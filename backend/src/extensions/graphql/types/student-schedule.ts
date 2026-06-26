/**
 * Student-facing schedule + booking flow (app Agenda tab — Fase 2).
 *
 * Three resolvers, all member-callable (auth: true), all tenant-safe:
 *
 *   - Query.myScheduleWeek(weekStart)  → the caller's academy week grid, one
 *     ScheduleOccurrence per (active schedule × matching weekday), enriched
 *     with occupancy + whether the caller already booked it.
 *   - Mutation.bookClass(scheduleDocumentId, date) → books the caller into a
 *     class. Confirms while seats remain; queues onto the waitlist once full.
 *   - Mutation.cancelMyBooking(documentId) → cancels the caller's own booking
 *     and auto-promotes the first waitlister when a confirmed seat frees.
 *
 * Business rules (locked with the product owner — see
 * docs/design-decisions.md §2.8):
 *   - Eligibility: caller must have an `active` enrollment.
 *   - Booking window: until 1h before class start.
 *   - Cancellation window: until 24h before class start (confirmed only;
 *     waitlist spots can be dropped any time).
 *   - Full class → waitlist + automatic FIFO promotion on a freed seat.
 *     (Push notification on promotion is deferred to Fase 7.)
 *
 * Capacity-occupying statuses are `confirmed` + `attended`; `waitlist` and
 * `cancelled` never occupy a seat (mirrors the ClassBooking lifecycle).
 */

import type { Core } from '@strapi/strapi';
import {
  requireActiveSubscription,
  requireModule,
  resolveUserAcademyId,
  withAcademyScope,
} from '../helpers';

const BOOKING_UID = 'api::class-booking.class-booking';
const SCHEDULE_UID = 'api::class-schedule.class-schedule';
const STUDENT_UID = 'api::student.student';
const DEPENDENT_UID = 'api::dependent.dependent';

const HOUR_MS = 3600 * 1000;
const OCCUPYING = ['confirmed', 'attended'];

/* ==================================================================
 * Pure helpers (exported for unit tests)
 * ================================================================ */

/** Weekday (0=Sun .. 6=Sat) for a `yyyy-mm-dd` date. TZ-safe via UTC. */
export function weekdayOfISO(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay();
}

/** Adds `n` days to a `yyyy-mm-dd` date, returns `yyyy-mm-dd`. TZ-safe via UTC. */
export function addDaysISO(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Monday (ISO week start) of the week containing `dateStr`. */
export function mondayOfWeek(dateStr: string): string {
  const offset = (weekdayOfISO(dateStr) + 6) % 7; // Mon→0, Sun→6
  return addDaysISO(dateStr, -offset);
}

/** True for a strict `yyyy-mm-dd` calendar date. */
export function isISODate(s: unknown): s is string {
  return (
    typeof s === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(s) &&
    !Number.isNaN(Date.parse(`${s}T00:00:00Z`))
  );
}

/**
 * Instant of a class start from `date` + `"HH:MM"`, anchored to BRT.
 * Brazil dropped DST in 2019, so the offset is a fixed -03:00 nationwide.
 * Returns null when the date/time can't be parsed.
 */
export function classStartInstant(
  dateStr: string,
  startTime: string | null | undefined,
): Date | null {
  if (!isISODate(dateStr)) return null;
  if (typeof startTime !== 'string' || !/^\d{2}:\d{2}/.test(startTime)) return null;
  const t = new Date(`${dateStr}T${startTime.slice(0, 5)}:00-03:00`);
  return Number.isNaN(t.getTime()) ? null : t;
}

/** Booking allowed up to 1h before start. */
export function isWithinBookingWindow(now: Date, start: Date | null): boolean {
  if (!start) return false;
  return now.getTime() <= start.getTime() - 1 * HOUR_MS;
}

/** Cancellation allowed up to 24h before start; no resolvable start never blocks. */
export function isWithinCancelWindow(now: Date, start: Date | null): boolean {
  if (!start) return true;
  return now.getTime() <= start.getTime() - 24 * HOUR_MS;
}

/** True when any enrollment in the list is `active`. Shared by the caller
 * (self) eligibility check and the dependent booking eligibility check. */
export function hasActiveEnrollment(enrollments: unknown): boolean {
  return (
    Array.isArray(enrollments) &&
    enrollments.some((e: any) => e?.status === 'active')
  );
}

/** Confirmed while seats remain; waitlist once full. `null` capacity = unlimited. */
export function decideBookingStatus(
  occupied: number,
  maxCapacity: number | null,
): 'confirmed' | 'waitlist' {
  if (maxCapacity == null) return 'confirmed';
  return occupied >= maxCapacity ? 'waitlist' : 'confirmed';
}

/** Minutes from midnight for `"HH:MM"`; 0 on bad input. */
export function timeToMinutes(t: string | null | undefined): number {
  if (typeof t !== 'string') return 0;
  const [h, m] = t.split(':').map((x) => Number.parseInt(x, 10));
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
}

/** SP calendar "today" as `yyyy-mm-dd`. */
function todayBR(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
  }).format(new Date());
}

/** Snaps an optional weekStart arg to the Monday of its week (default: this week). */
function normalizeWeekStart(arg: string | null | undefined): string {
  return mondayOfWeek(isISODate(arg) ? arg : todayBR());
}

/* ==================================================================
 * Data helpers (impure — hit Strapi)
 * ================================================================ */

interface CallerStudent {
  documentId: string;
  academyId: string | null;
  status: string | null;
  hasActiveEnrollment: boolean;
}

/** Resolves the authenticated user's Student with the fields booking needs. */
async function resolveCallerStudent(
  strapi: Core.Strapi,
  ctx: any,
): Promise<CallerStudent | null> {
  const userId = ctx?.state?.user?.id;
  if (!userId) return null;
  const rows: any[] = await strapi.documents(STUDENT_UID).findMany({
    filters: { user: { id: userId } },
    fields: ['documentId', 'status'],
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
    status: me.status ?? null,
    hasActiveEnrollment: hasActiveEnrollment(me.enrollments),
  };
}

interface OwnedDependent {
  documentId: string;
  academyId: string | null;
  hasActiveEnrollment: boolean;
}

/**
 * Loads a dependent and asserts the caller (`guardianDocumentId`) owns it.
 * Throws PT-BR on missing / not-owned so the guardian can never read or book
 * for a child that isn't theirs. The dependent — not the guardian — is the
 * practitioner, so eligibility reads the dependent's own enrollments.
 */
async function loadOwnedDependent(
  strapi: Core.Strapi,
  dependentDocumentId: string,
  guardianDocumentId: string,
): Promise<OwnedDependent> {
  const dep: any = await strapi.documents(DEPENDENT_UID).findOne({
    documentId: dependentDocumentId,
    fields: ['documentId'],
    populate: {
      guardian: { fields: ['documentId'] },
      academy: { fields: ['documentId'] },
      enrollments: { fields: ['status'] },
    },
  });
  if (!dep) throw new Error('Dependente não encontrado.');
  if (dep.guardian?.documentId !== guardianDocumentId) {
    throw new Error('Dependente não pertence a esta conta.');
  }
  return {
    documentId: dep.documentId,
    academyId: dep.academy?.documentId ?? null,
    hasActiveEnrollment: hasActiveEnrollment(dep.enrollments),
  };
}

/** Seats occupied (confirmed + attended) for a (schedule, date). */
async function countOccupying(
  strapi: Core.Strapi,
  scheduleDocumentId: string,
  date: string,
): Promise<number> {
  const rows: any[] = await strapi.documents(BOOKING_UID).findMany({
    filters: {
      classSchedule: { documentId: scheduleDocumentId },
      date,
      status: { $in: OCCUPYING },
    } as any,
    fields: ['documentId'],
    limit: 1000,
  });
  return rows.length;
}

/**
 * Promotes the earliest waitlister (FIFO by createdAt) of a (schedule, date)
 * to `confirmed`, but only if a seat is actually free. Returns the promoted
 * booking or null. TODO(Fase 7): push "Sua vaga foi confirmada".
 */
async function promoteNextWaitlister(
  strapi: Core.Strapi,
  scheduleDocumentId: string,
  date: string,
): Promise<any | null> {
  const sched: any = await strapi.documents(SCHEDULE_UID).findOne({
    documentId: scheduleDocumentId,
    fields: ['maxCapacity'],
  });
  const maxCapacity = sched?.maxCapacity ?? null;
  if (maxCapacity != null) {
    const occupied = await countOccupying(strapi, scheduleDocumentId, date);
    if (occupied >= maxCapacity) return null; // no seat freed up
  }
  const queue: any[] = await strapi.documents(BOOKING_UID).findMany({
    filters: {
      classSchedule: { documentId: scheduleDocumentId },
      date,
      status: 'waitlist',
    } as any,
    sort: { createdAt: 'asc' },
    limit: 1,
  });
  const next = queue[0];
  if (!next?.documentId) return null;
  return await strapi.documents(BOOKING_UID).update({
    documentId: next.documentId,
    data: { status: 'confirmed' },
  });
}

/**
 * Builds the academy weekly grid (one ScheduleOccurrence per active schedule ×
 * matching weekday) for `academyId`, enriched with occupancy and the subject's
 * own booking state. `isMine` decides which booking in a slot belongs to the
 * subject in view — the caller (self) for `myScheduleWeek`, the dependent for
 * `dependentScheduleWeek`. Capacity counts every occupying booking in the
 * academy regardless of who made it; only the "mine" flags are subject-scoped.
 */
async function buildWeekOccurrences(
  strapi: Core.Strapi,
  academyId: string,
  weekStartArg: string | null | undefined,
  isMine: (booking: any) => boolean,
): Promise<any[]> {
  const weekStart = normalizeWeekStart(weekStartArg);
  const dates = Array.from({ length: 7 }, (_, i) => addDaysISO(weekStart, i));
  const weekEnd = dates[6];

  const schedules: any[] = await strapi.documents(SCHEDULE_UID).findMany({
    filters: { ...withAcademyScope({}, academyId), isActive: true },
    limit: 500,
  });

  // Single bookings sweep for the whole window, grouped in JS. Populates both
  // student and dependent so the same grid powers self- and dependent agendas.
  const bookings: any[] = await strapi.documents(BOOKING_UID).findMany({
    filters: {
      classSchedule: { academy: { documentId: academyId } },
      date: { $gte: weekStart, $lte: weekEnd },
      status: { $ne: 'cancelled' },
    } as any,
    populate: {
      classSchedule: { fields: ['documentId'] },
      student: { fields: ['documentId'] },
      dependent: { fields: ['documentId'] },
    },
    limit: 5000,
  });

  const now = new Date();
  const occurrences: any[] = [];
  for (const date of dates) {
    const wd = weekdayOfISO(date);
    for (const s of schedules) {
      const weekdays: number[] = Array.isArray(s.weekdays) ? s.weekdays : [];
      if (!weekdays.includes(wd)) continue;

      const slot = bookings.filter(
        (b) => b.classSchedule?.documentId === s.documentId && b.date === date,
      );
      const bookedCount = slot.filter((b) => OCCUPYING.includes(b.status)).length;
      const waitlistCount = slot.filter((b) => b.status === 'waitlist').length;
      const mine = slot.find(isMine);

      const maxCapacity = s.maxCapacity ?? null;
      const isFull = maxCapacity != null && bookedCount >= maxCapacity;
      const start = classStartInstant(date, s.startTime);

      occurrences.push({
        scheduleDocumentId: s.documentId,
        date,
        weekday: wd,
        name: s.name,
        instructor: s.instructor ?? null,
        modality: s.modality ?? null,
        room: s.room ?? null,
        startTime: s.startTime ?? null,
        endTime: s.endTime ?? null,
        maxCapacity,
        bookedCount,
        spotsLeft: maxCapacity != null ? Math.max(0, maxCapacity - bookedCount) : null,
        isFull,
        bookable: isWithinBookingWindow(now, start),
        waitlistCount,
        bookedByMe: !!mine,
        myBookingDocumentId: mine?.documentId ?? null,
        myBookingStatus: mine?.status ?? null,
      });
    }
  }

  occurrences.sort((a, b) =>
    a.date !== b.date
      ? a.date < b.date
        ? -1
        : 1
      : timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
  );
  return occurrences;
}

/* ==================================================================
 * Schema
 * ================================================================ */

export function buildStudentSchedule({
  nexus,
  strapi,
}: {
  nexus: any;
  strapi: Core.Strapi;
}) {
  const ScheduleOccurrence = nexus.objectType({
    name: 'ScheduleOccurrence',
    description:
      'One concrete class instance (a schedule on a specific date) for the student Agenda, with occupancy and the caller’s own booking state.',
    definition(t: any) {
      t.nonNull.id('scheduleDocumentId');
      t.nonNull.string('date'); // yyyy-mm-dd
      t.nonNull.int('weekday'); // 0=Sun .. 6=Sat
      t.nonNull.string('name');
      t.string('instructor');
      t.string('modality');
      t.string('room');
      t.string('startTime');
      t.string('endTime');
      t.int('maxCapacity');
      t.nonNull.int('bookedCount'); // occupying seats taken
      t.int('spotsLeft'); // null = unlimited
      t.nonNull.boolean('isFull');
      t.nonNull.boolean('bookable'); // booking window still open
      t.nonNull.int('waitlistCount');
      t.nonNull.boolean('bookedByMe');
      t.id('myBookingDocumentId');
      t.string('myBookingStatus'); // confirmed | waitlist
    },
  });

  const queries = nexus.extendType({
    type: 'Query',
    definition(t: any) {
      t.list.field('myScheduleWeek', {
        type: 'ScheduleOccurrence',
        description:
          "The caller's academy weekly grid starting at `weekStart` (yyyy-mm-dd, snapped to Monday; defaults to the current week). Sorted by date then start time.",
        args: { weekStart: nexus.stringArg() },
        resolve: async (_root: any, args: any, ctx: any) => {
          await requireModule(strapi, ctx, 'classes');
          const me = await resolveCallerStudent(strapi, ctx);
          if (!me?.academyId) return [];
          return await buildWeekOccurrences(
            strapi,
            me.academyId,
            args.weekStart,
            (b) => b.student?.documentId === me.documentId,
          );
        },
      });

      t.list.field('dependentScheduleWeek', {
        type: 'ScheduleOccurrence',
        description:
          "A dependent's academy weekly grid starting at `weekStart` (defaults to the current week). Same shape as myScheduleWeek; the `bookedByMe` / `myBooking*` fields reflect the dependent's own bookings (made on their behalf by the guardian). Requires the caller to be the dependent's guardian.",
        args: {
          dependentId: nexus.nonNull(nexus.idArg()),
          weekStart: nexus.stringArg(),
        },
        resolve: async (_root: any, args: any, ctx: any) => {
          await requireModule(strapi, ctx, 'dependents');
          const me = await resolveCallerStudent(strapi, ctx);
          if (!me) return [];
          const dep = await loadOwnedDependent(strapi, args.dependentId, me.documentId);
          if (!dep.academyId) return [];
          return await buildWeekOccurrences(
            strapi,
            dep.academyId,
            args.weekStart,
            (b) => b.dependent?.documentId === args.dependentId,
          );
        },
      });
    },
  });

  const mutations = nexus.extendType({
    type: 'Mutation',
    definition(t: any) {
      t.field('bookClass', {
        type: 'ClassBooking',
        description:
          'Books the caller into a class on a date. Confirms while seats remain; queues onto the waitlist once full. Requires an active enrollment; closes 1h before start.',
        args: {
          scheduleDocumentId: nexus.nonNull(nexus.idArg()),
          date: nexus.nonNull(nexus.stringArg()),
        },
        resolve: async (_root: any, args: any, ctx: any) => {
          await requireModule(strapi, ctx, 'classes');
          await requireActiveSubscription(strapi, ctx);

          const me = await resolveCallerStudent(strapi, ctx);
          if (!me) throw new Error('Sua conta não está vinculada a um aluno.');
          if (!me.academyId) {
            throw new Error('Sua conta não está vinculada a nenhuma academia.');
          }
          if (!me.hasActiveEnrollment) {
            throw new Error(
              'Você precisa de uma matrícula ativa para reservar aulas. Fale com a recepção da sua academia.',
            );
          }

          if (!isISODate(args.date)) throw new Error('Data inválida.');

          const sched: any = await strapi.documents(SCHEDULE_UID).findOne({
            documentId: args.scheduleDocumentId,
            populate: { academy: { fields: ['documentId'] } },
          });
          if (!sched) throw new Error('Aula não encontrada.');
          if (sched.academy?.documentId !== me.academyId) {
            throw new Error('Aula de outra academia.');
          }
          if (sched.isActive === false) throw new Error('Esta turma não está ativa.');

          const weekdays: number[] = Array.isArray(sched.weekdays) ? sched.weekdays : [];
          if (weekdays.length > 0 && !weekdays.includes(weekdayOfISO(args.date))) {
            throw new Error('Esta turma não tem aula nesse dia.');
          }

          const start = classStartInstant(args.date, sched.startTime);
          if (!isWithinBookingWindow(new Date(), start)) {
            throw new Error('As reservas encerram 1h antes do início da aula.');
          }

          const occupied = await countOccupying(strapi, args.scheduleDocumentId, args.date);
          const status = decideBookingStatus(occupied, sched.maxCapacity ?? null);

          // Lifecycle re-checks dedup (and capacity for `confirmed`); surface
          // its PT-BR message as-is to the caller.
          return await strapi.documents(BOOKING_UID).create({
            data: {
              student: me.documentId,
              classSchedule: args.scheduleDocumentId,
              date: args.date,
              status,
            } as any,
          });
        },
      });

      t.field('bookClassForDependent', {
        type: 'ClassBooking',
        description:
          'Books a dependent (child) into a class on the guardian’s behalf. Same windows, capacity and waitlist rules as bookClass, but eligibility reads the dependent’s own active enrollment. Requires the caller to be the dependent’s guardian.',
        args: {
          dependentId: nexus.nonNull(nexus.idArg()),
          scheduleDocumentId: nexus.nonNull(nexus.idArg()),
          date: nexus.nonNull(nexus.stringArg()),
        },
        resolve: async (_root: any, args: any, ctx: any) => {
          await requireModule(strapi, ctx, 'dependents');
          await requireActiveSubscription(strapi, ctx);

          const me = await resolveCallerStudent(strapi, ctx);
          if (!me) throw new Error('Sua conta não está vinculada a um aluno.');

          const dep = await loadOwnedDependent(strapi, args.dependentId, me.documentId);
          if (!dep.academyId) {
            throw new Error('Dependente não está vinculado a nenhuma academia.');
          }
          if (!dep.hasActiveEnrollment) {
            throw new Error(
              'O dependente precisa de uma matrícula ativa para reservar aulas. Fale com a recepção da sua academia.',
            );
          }

          if (!isISODate(args.date)) throw new Error('Data inválida.');

          const sched: any = await strapi.documents(SCHEDULE_UID).findOne({
            documentId: args.scheduleDocumentId,
            populate: { academy: { fields: ['documentId'] } },
          });
          if (!sched) throw new Error('Aula não encontrada.');
          if (sched.academy?.documentId !== dep.academyId) {
            throw new Error('Aula de outra academia.');
          }
          if (sched.isActive === false) throw new Error('Esta turma não está ativa.');

          const weekdays: number[] = Array.isArray(sched.weekdays) ? sched.weekdays : [];
          if (weekdays.length > 0 && !weekdays.includes(weekdayOfISO(args.date))) {
            throw new Error('Esta turma não tem aula nesse dia.');
          }

          const start = classStartInstant(args.date, sched.startTime);
          if (!isWithinBookingWindow(new Date(), start)) {
            throw new Error('As reservas encerram 1h antes do início da aula.');
          }

          const occupied = await countOccupying(strapi, args.scheduleDocumentId, args.date);
          const status = decideBookingStatus(occupied, sched.maxCapacity ?? null);

          // Cancellation reuses cancelMyBooking — it already resolves dependent
          // ownership via dependent.guardian (see resolver above).
          return await strapi.documents(BOOKING_UID).create({
            data: {
              dependent: dep.documentId,
              classSchedule: args.scheduleDocumentId,
              date: args.date,
              status,
            } as any,
          });
        },
      });

      t.field('cancelMyBooking', {
        type: 'ClassBooking',
        description:
          'Cancels the caller’s own booking — self or a dependent’s (guardian-owned). Confirmed seats: until 24h before start; waitlist spots: any time. Frees a seat → auto-promotes the first waitlister.',
        args: { documentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any, ctx: any) => {
          await requireModule(strapi, ctx, 'classes');
          const me = await resolveCallerStudent(strapi, ctx);
          if (!me) throw new Error('Sua conta não está vinculada a um aluno.');

          const booking: any = await strapi.documents(BOOKING_UID).findOne({
            documentId: args.documentId,
            populate: {
              student: { fields: ['documentId'] },
              dependent: { populate: { guardian: { fields: ['documentId'] } } },
              classSchedule: { fields: ['documentId', 'startTime', 'name'] },
            },
          });
          if (!booking) throw new Error('Reserva não encontrada.');

          const ownsStudent = booking.student?.documentId === me.documentId;
          const ownsDependent =
            booking.dependent?.guardian?.documentId === me.documentId;
          if (!ownsStudent && !ownsDependent) {
            throw new Error('Reserva não pertence a esta conta.');
          }

          if (!['confirmed', 'waitlist'].includes(booking.status)) {
            throw new Error('Esta reserva não pode ser cancelada.');
          }

          // 24h window only guards a real (confirmed) seat; dropping a
          // waitlist spot is always allowed.
          if (booking.status === 'confirmed') {
            const start = classStartInstant(booking.date, booking.classSchedule?.startTime);
            if (!isWithinCancelWindow(new Date(), start)) {
              throw new Error('Cancelamento permitido até 24h antes da aula.');
            }
          }

          const freedSeat = booking.status === 'confirmed';
          const scheduleDocId = booking.classSchedule?.documentId;

          const cancelled = await strapi.documents(BOOKING_UID).update({
            documentId: args.documentId,
            data: { status: 'cancelled' },
          });

          if (freedSeat && scheduleDocId) {
            await promoteNextWaitlister(strapi, scheduleDocId, booking.date);
          }
          return cancelled;
        },
      });
    },
  });

  return {
    types: [ScheduleOccurrence, queries, mutations],
    resolversConfig: {
      'Query.myScheduleWeek': { auth: true },
      'Query.dependentScheduleWeek': { auth: true },
      'Mutation.bookClass': { auth: true },
      'Mutation.bookClassForDependent': { auth: true },
      'Mutation.cancelMyBooking': { auth: true },
    },
  };
}
