/**
 * Student-facing workouts: fichas, execution sessions, history & stats
 * (app Treinos tab — Fase 3).
 *
 * Queries (all member-callable, tenant-safe):
 *   - Query.myWorkouts         → { active: WorkoutPlan, upcoming: [WorkoutPlan] }
 *   - Query.myWorkoutHistory   → the caller's finished sessions, newest first
 *   - Query.myWorkoutStats     → derived { thisWeekCount, thirtyDaysCount, streakDays }
 *
 * Mutations (member-callable; the caller must own the plan/session):
 *   - Mutation.startWorkoutSession(workoutPlanId)            → opens a session
 *   - Mutation.finishWorkoutSession(sessionId, …)            → closes + logs it
 *   - Mutation.cancelWorkoutSession(sessionId)               → drops an open one
 *
 * Business rules:
 *   - Eligibility to START a session mirrors booking (see §2.8): the caller
 *     needs an `active` enrollment. Reading fichas/history/stats only needs
 *     a linked student (tenant gate).
 *   - A session is "open" until `finishedAt` is set; only open sessions can
 *     be finished or cancelled.
 *   - `durationMinutes` is computed once, on finish (finishedAt - startedAt).
 *   - Stats use the São Paulo calendar (Brazil dropped DST in 2019).
 */

import type { Core } from '@strapi/strapi';
import { requireActiveSubscription, requireAnyModule, requireModule } from '../helpers';
import { addDaysISO, isISODate, mondayOfWeek } from './student-schedule';

const SESSION_UID = 'api::workout-session.workout-session';
const PLAN_UID = 'api::workout-plan.workout-plan';
const STUDENT_UID = 'api::student.student';

/* ==================================================================
 * Pure helpers (exported for unit tests)
 * ================================================================ */

/** Whole minutes between two instants (ISO strings or Date), floored, never < 0. */
export function computeDurationMinutes(
  startedAt: string | Date | null | undefined,
  finishedAt: string | Date | null | undefined,
): number {
  if (!startedAt || !finishedAt) return 0;
  const a = new Date(startedAt).getTime();
  const b = new Date(finishedAt).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.floor((b - a) / 60000));
}

/** São Paulo calendar date (yyyy-mm-dd) for an instant. */
export function isoDateBR(instant: string | Date): string {
  const d = instant instanceof Date ? instant : new Date(instant);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(d);
}

/**
 * Consecutive-day training streak ending today (or yesterday, so a streak
 * isn't "broken" before you've trained today). `dates` is a set of yyyy-mm-dd.
 */
export function computeStreak(dates: Set<string>, today: string): number {
  let cursor = today;
  if (!dates.has(cursor)) {
    cursor = addDaysISO(today, -1);
    if (!dates.has(cursor)) return 0;
  }
  let streak = 0;
  while (dates.has(cursor)) {
    streak += 1;
    cursor = addDaysISO(cursor, -1);
  }
  return streak;
}

export interface WorkoutStatsShape {
  thisWeekCount: number;
  thirtyDaysCount: number;
  streakDays: number;
}

/** Derives the three header stats from the BR-calendar dates of finished sessions. */
export function summarizeStats(finishedDates: string[], today: string): WorkoutStatsShape {
  const valid = finishedDates.filter(isISODate);
  const weekStart = mondayOfWeek(today);
  const weekEnd = addDaysISO(weekStart, 6);
  const thirtyAgo = addDaysISO(today, -29);

  const thisWeekCount = valid.filter((d) => d >= weekStart && d <= weekEnd).length;
  const thirtyDaysCount = valid.filter((d) => d >= thirtyAgo && d <= today).length;
  const streakDays = computeStreak(new Set(valid), today);

  return { thisWeekCount, thirtyDaysCount, streakDays };
}

/**
 * Splits a student's workout plans into the single live "ficha atual" and the
 * remaining ones. Active = isActive (not false) and the date window covers
 * `today`; the most-recently-started wins. The rest are "upcoming".
 */
export function partitionWorkoutPlans<T extends {
  validFrom?: string | null;
  validTo?: string | null;
  isActive?: boolean | null;
}>(plans: T[], today: string): { active: T | null; upcoming: T[] } {
  const covers = (p: T) =>
    (!p.validFrom || p.validFrom <= today) && (!p.validTo || p.validTo >= today);
  const isLive = (p: T) => p.isActive !== false;
  const byValidFromDesc = (a: T, b: T) => (b.validFrom ?? '') < (a.validFrom ?? '') ? -1 : 1;

  const live = plans.filter((p) => isLive(p) && covers(p)).sort(byValidFromDesc);
  const active = live[0] ?? null;
  const upcoming = plans.filter((p) => p !== active).sort(byValidFromDesc);
  return { active, upcoming };
}

/**
 * A plan is a pool (Piscina) activity when its category is exactly 'pool'.
 * Everything else — including legacy plans with no category — counts as gym,
 * so existing fichas stay in Treinos.
 */
export function isPoolPlan(plan: { category?: string | null }): boolean {
  return plan?.category === 'pool';
}

/** Seeds the per-exercise checklist for a fresh session from the plan's exercises. */
export function seedExercisesCompleted(exercises: any): any[] {
  if (!Array.isArray(exercises)) return [];
  return exercises.map((ex: any) => ({
    name: ex?.name ?? '',
    sets: ex?.sets ?? null,
    reps: ex?.reps ?? null,
    load: ex?.load ?? null,
    completed: false,
  }));
}

/* ==================================================================
 * Data helpers (impure)
 * ================================================================ */

interface CallerStudent {
  documentId: string;
  academyId: string | null;
  hasActiveEnrollment: boolean;
}

async function resolveCallerStudent(
  strapi: Core.Strapi,
  ctx: any,
): Promise<CallerStudent | null> {
  const userId = ctx?.state?.user?.id;
  if (!userId) return null;
  const rows: any[] = await strapi.documents(STUDENT_UID).findMany({
    filters: { user: { id: userId } },
    fields: ['documentId'],
    populate: {
      academy: { fields: ['documentId'] },
      enrollments: { fields: ['status'] },
    },
    limit: 1,
  });
  const me = rows[0];
  if (!me?.documentId) return null;
  return {
    documentId: me.documentId,
    academyId: me.academy?.documentId ?? null,
    hasActiveEnrollment:
      Array.isArray(me.enrollments) &&
      me.enrollments.some((e: any) => e?.status === 'active'),
  };
}

/* ==================================================================
 * Schema
 * ================================================================ */

export function buildWorkoutSession({
  nexus,
  strapi,
}: {
  nexus: any;
  strapi: Core.Strapi;
}) {
  const WorkoutSession = nexus.objectType({
    name: 'WorkoutSession',
    description: 'A single executed training session logged against a workout plan.',
    definition(t: any) {
      t.nonNull.id('documentId');
      t.string('startedAt');
      t.string('finishedAt');
      t.int('durationMinutes');
      t.string('notes');
      // Array of { name, sets, reps, load, completed } — shape mirrors the plan.
      t.field('exercisesCompleted', { type: 'JSON' });
      t.field('workoutPlan', {
        type: 'WorkoutPlan',
        resolve: async (parent: any) => {
          if (parent.workoutPlan !== undefined) return parent.workoutPlan;
          const doc: any = await strapi.documents(SESSION_UID).findOne({
            documentId: parent.documentId,
            populate: { workoutPlan: true },
          });
          return doc?.workoutPlan ?? null;
        },
      });
    },
  });

  const MyWorkouts = nexus.objectType({
    name: 'MyWorkouts',
    description: "The caller's active ficha plus the remaining (upcoming) ones.",
    definition(t: any) {
      t.field('active', { type: 'WorkoutPlan' });
      t.list.field('upcoming', { type: 'WorkoutPlan' });
    },
  });

  const WorkoutStats = nexus.objectType({
    name: 'WorkoutStats',
    description: 'Derived training stats for the Treinos header.',
    definition(t: any) {
      t.nonNull.int('thisWeekCount');
      t.nonNull.int('thirtyDaysCount');
      t.nonNull.int('streakDays');
    },
  });

  const queries = nexus.extendType({
    type: 'Query',
    definition(t: any) {
      t.field('myWorkouts', {
        type: 'MyWorkouts',
        description: "The caller's active workout plan and the remaining ones.",
        resolve: async (_root: any, _args: any, ctx: any) => {
          await requireModule(strapi, ctx, 'workouts');
          const me = await resolveCallerStudent(strapi, ctx);
          if (!me?.documentId) return { active: null, upcoming: [] };
          const plans: any[] = await strapi.documents(PLAN_UID).findMany({
            filters: { students: { documentId: me.documentId } } as any,
            sort: { validFrom: 'desc' },
            limit: 200,
          });
          const today = isoDateBR(new Date());
          // Pool fichas live in the Piscina tab (myPoolActivities), not here.
          return partitionWorkoutPlans(plans.filter((p) => !isPoolPlan(p)), today);
        },
      });

      t.field('myPoolActivities', {
        type: 'MyWorkouts',
        description:
          "The caller's pool (Piscina) fichas — same shape as myWorkouts, filtered to category 'pool'. Gated by the pool module.",
        resolve: async (_root: any, _args: any, ctx: any) => {
          await requireModule(strapi, ctx, 'pool');
          const me = await resolveCallerStudent(strapi, ctx);
          if (!me?.documentId) return { active: null, upcoming: [] };
          const plans: any[] = await strapi.documents(PLAN_UID).findMany({
            filters: { students: { documentId: me.documentId } } as any,
            sort: { validFrom: 'desc' },
            limit: 200,
          });
          const today = isoDateBR(new Date());
          return partitionWorkoutPlans(plans.filter(isPoolPlan), today);
        },
      });

      t.field('workoutSession', {
        type: 'WorkoutSession',
        description: "A single session the caller owns (the execution screen).",
        args: { documentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any, ctx: any) => {
          // Sessions back both Treinos and Piscina fichas.
          await requireAnyModule(strapi, ctx, ['workouts', 'pool']);
          const me = await resolveCallerStudent(strapi, ctx);
          if (!me?.documentId) return null;
          const session: any = await strapi.documents(SESSION_UID).findOne({
            documentId: args.documentId,
            populate: { student: { fields: ['documentId'] } },
          });
          if (!session) return null;
          if (session.student?.documentId !== me.documentId) {
            throw new Error('Esta sessão não pertence a você.');
          }
          return session;
        },
      });

      t.list.field('myWorkoutHistory', {
        type: 'WorkoutSession',
        description: "The caller's finished training sessions, newest first.",
        args: { limit: nexus.intArg() },
        resolve: async (_root: any, args: any, ctx: any) => {
          await requireModule(strapi, ctx, 'workouts');
          const me = await resolveCallerStudent(strapi, ctx);
          if (!me?.documentId) return [];
          return await strapi.documents(SESSION_UID).findMany({
            filters: {
              student: { documentId: me.documentId },
              finishedAt: { $notNull: true },
            } as any,
            sort: { finishedAt: 'desc' },
            limit: Math.min(100, args.limit ?? 20),
          });
        },
      });

      t.field('myWorkoutStats', {
        type: 'WorkoutStats',
        description: 'Derived training stats (this week / 30 days / streak).',
        resolve: async (_root: any, _args: any, ctx: any) => {
          await requireModule(strapi, ctx, 'workouts');
          const me = await resolveCallerStudent(strapi, ctx);
          if (!me?.documentId) {
            return { thisWeekCount: 0, thirtyDaysCount: 0, streakDays: 0 };
          }
          const sessions: any[] = await strapi.documents(SESSION_UID).findMany({
            filters: {
              student: { documentId: me.documentId },
              finishedAt: { $notNull: true },
            } as any,
            fields: ['finishedAt'],
            limit: 1000,
          });
          const dates = sessions.map((s) => isoDateBR(s.finishedAt)).filter(Boolean);
          return summarizeStats(dates, isoDateBR(new Date()));
        },
      });
    },
  });

  const mutations = nexus.extendType({
    type: 'Mutation',
    definition(t: any) {
      t.field('startWorkoutSession', {
        type: 'WorkoutSession',
        description:
          'Opens a training session against one of the caller’s active fichas. Requires an active enrollment. Seeds the per-exercise checklist from the plan.',
        args: { workoutPlanId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any, ctx: any) => {
          // Sessions back both Treinos and Piscina fichas.
          await requireAnyModule(strapi, ctx, ['workouts', 'pool']);
          await requireActiveSubscription(strapi, ctx);

          const me = await resolveCallerStudent(strapi, ctx);
          if (!me) throw new Error('Sua conta não está vinculada a um aluno.');
          if (!me.academyId) {
            throw new Error('Sua conta não está vinculada a nenhuma academia.');
          }
          if (!me.hasActiveEnrollment) {
            throw new Error(
              'Você precisa de uma matrícula ativa para iniciar um treino. Fale com a recepção da sua academia.',
            );
          }

          // WorkoutPlan has no direct academy relation — tenancy is via its
          // student roster, so we populate it and check the caller is in it.
          const plan: any = await strapi.documents(PLAN_UID).findOne({
            documentId: args.workoutPlanId,
            populate: { students: { fields: ['documentId'] } },
          });
          if (!plan) throw new Error('Ficha não encontrada.');
          const inRoster =
            Array.isArray(plan.students) &&
            plan.students.some((s: any) => s?.documentId === me.documentId);
          if (!inRoster) {
            throw new Error('Esta ficha não pertence a você.');
          }

          return await strapi.documents(SESSION_UID).create({
            data: {
              student: me.documentId,
              academy: me.academyId,
              workoutPlan: args.workoutPlanId,
              startedAt: new Date().toISOString(),
              exercisesCompleted: seedExercisesCompleted(plan.exercises),
            } as any,
          });
        },
      });

      t.field('finishWorkoutSession', {
        type: 'WorkoutSession',
        description:
          'Closes an open session: records duration, the per-exercise checklist and optional notes.',
        args: {
          sessionId: nexus.nonNull(nexus.idArg()),
          exercisesCompleted: nexus.arg({ type: 'JSON' }),
          notes: nexus.stringArg(),
        },
        resolve: async (_root: any, args: any, ctx: any) => {
          await requireAnyModule(strapi, ctx, ['workouts', 'pool']);
          const me = await resolveCallerStudent(strapi, ctx);
          if (!me) throw new Error('Sua conta não está vinculada a um aluno.');

          const session: any = await strapi.documents(SESSION_UID).findOne({
            documentId: args.sessionId,
            populate: { student: { fields: ['documentId'] } },
          });
          if (!session) throw new Error('Sessão não encontrada.');
          if (session.student?.documentId !== me.documentId) {
            throw new Error('Esta sessão não pertence a você.');
          }
          if (session.finishedAt) throw new Error('Esta sessão já foi finalizada.');

          const finishedAt = new Date().toISOString();
          return await strapi.documents(SESSION_UID).update({
            documentId: args.sessionId,
            data: {
              finishedAt,
              durationMinutes: computeDurationMinutes(session.startedAt, finishedAt),
              ...(args.exercisesCompleted !== undefined && args.exercisesCompleted !== null
                ? { exercisesCompleted: args.exercisesCompleted }
                : {}),
              ...(args.notes != null ? { notes: args.notes } : {}),
            } as any,
          });
        },
      });

      t.field('cancelWorkoutSession', {
        type: 'WorkoutSession',
        description: 'Drops an open (not-yet-finished) session.',
        args: { sessionId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any, ctx: any) => {
          await requireAnyModule(strapi, ctx, ['workouts', 'pool']);
          const me = await resolveCallerStudent(strapi, ctx);
          if (!me) throw new Error('Sua conta não está vinculada a um aluno.');

          const session: any = await strapi.documents(SESSION_UID).findOne({
            documentId: args.sessionId,
            populate: { student: { fields: ['documentId'] } },
          });
          if (!session) throw new Error('Sessão não encontrada.');
          if (session.student?.documentId !== me.documentId) {
            throw new Error('Esta sessão não pertence a você.');
          }
          if (session.finishedAt) {
            throw new Error('Uma sessão finalizada não pode ser cancelada.');
          }

          await strapi.documents(SESSION_UID).delete({ documentId: args.sessionId });
          return session;
        },
      });
    },
  });

  return {
    types: [WorkoutSession, MyWorkouts, WorkoutStats, queries, mutations],
    resolversConfig: {
      'Query.myWorkouts': { auth: true },
      'Query.myPoolActivities': { auth: true },
      'Query.workoutSession': { auth: true },
      'Query.myWorkoutHistory': { auth: true },
      'Query.myWorkoutStats': { auth: true },
      'Mutation.startWorkoutSession': { auth: true },
      'Mutation.finishWorkoutSession': { auth: true },
      'Mutation.cancelWorkoutSession': { auth: true },
    },
  };
}
