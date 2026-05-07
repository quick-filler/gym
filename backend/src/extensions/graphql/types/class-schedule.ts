/**
 * GraphQL schema for the ClassSchedule content type.
 *
 * Tenancy via direct academy relation.
 *
 * Custom query: scheduleBookings — bookings for a schedule on a given date.
 */

import type { Core } from '@strapi/strapi';
import {
  assertCanAccessDoc,
  isPlatformAdmin,
  requireAcademyId,
  requireRole,
  resolveUserAcademyId,
  withAcademyScope,
} from '../helpers';

const UID = 'api::class-schedule.class-schedule';
const BOOKING_UID = 'api::class-booking.class-booking';

const WEEKDAY_SHORT_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/** Parses "HH:MM" to minutes from midnight. Returns 0 on bad input. */
function timeToMinutes(t: string | null | undefined): number {
  if (!t) return 0;
  const [h, m] = t.split(':').map((s) => Number.parseInt(s, 10));
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
}

/** Half-open intervals overlap iff a1 < b2 && b1 < a2. */
function timeOverlaps(
  a1: string,
  a2: string,
  b1: string,
  b2: string,
): boolean {
  return (
    timeToMinutes(a1) < timeToMinutes(b2) &&
    timeToMinutes(b1) < timeToMinutes(a2)
  );
}

function normalizeName(s: unknown): string {
  if (typeof s !== 'string') return '';
  return s.trim().toLowerCase();
}

interface ConflictInput {
  weekdays: number[];
  startTime: string;
  endTime: string;
  instructor?: string | null;
  room?: string | null;
}

interface ConflictResult {
  schedule: any;
  reason: 'instructor' | 'room';
  days: number[];
}

/**
 * Returns every active ClassSchedule in the academy that collides with
 * the input on at least one shared weekday + overlapping time window AND
 * shares the same instructor (case-insensitive) OR room.
 *
 * Empty/blank instructor/room is never a conflict — a turma with no
 * instructor doesn't book anyone's calendar.
 */
async function findScheduleConflicts(
  strapi: Core.Strapi,
  academyId: string | null,
  input: ConflictInput,
  excludeDocumentId?: string | null,
): Promise<ConflictResult[]> {
  if (!academyId) return [];
  if (!Array.isArray(input.weekdays) || input.weekdays.length === 0) return [];
  if (!input.startTime || !input.endTime) return [];

  const wantedDays = new Set<number>(input.weekdays);
  const wantedInst = normalizeName(input.instructor);
  const wantedRoom = normalizeName(input.room);
  if (!wantedInst && !wantedRoom) return [];

  const all: any[] = await strapi.documents(UID).findMany({
    filters: { ...withAcademyScope({}, academyId), isActive: true },
    limit: 500,
  });

  const conflicts: ConflictResult[] = [];
  for (const s of all) {
    if (excludeDocumentId && s.documentId === excludeDocumentId) continue;

    const sDays: number[] = Array.isArray(s.weekdays) ? s.weekdays : [];
    const sharedDays = sDays.filter((d) => wantedDays.has(d));
    if (sharedDays.length === 0) continue;

    if (!s.startTime || !s.endTime) continue;
    if (!timeOverlaps(input.startTime, input.endTime, s.startTime, s.endTime)) {
      continue;
    }

    const sInst = normalizeName(s.instructor);
    const sRoom = normalizeName(s.room);
    if (wantedInst && sInst === wantedInst) {
      conflicts.push({ schedule: s, reason: 'instructor', days: sharedDays });
    } else if (wantedRoom && sRoom === wantedRoom) {
      conflicts.push({ schedule: s, reason: 'room', days: sharedDays });
    }
  }
  return conflicts;
}

function formatConflictMessage(conflicts: ConflictResult[]): string {
  // PT-BR human message — used when the mutation rejects, so the
  // operator gets a clear reason without parsing structured data.
  const parts = conflicts.map((c) => {
    const days = c.days
      .map((d) => WEEKDAY_SHORT_PT[d])
      .filter(Boolean)
      .join(', ');
    const noun = c.reason === 'instructor' ? 'instrutor' : 'sala';
    const target =
      c.reason === 'instructor' ? c.schedule.instructor : c.schedule.room;
    return `"${c.schedule.name}" usa o mesmo ${noun} (${target}) nas ${days}, ${c.schedule.startTime}–${c.schedule.endTime}`;
  });
  return `Conflito de horário: ${parts.join('; ')}.`;
}

export function buildClassSchedule({ nexus, strapi }: { nexus: any; strapi: Core.Strapi }) {
  const ClassSchedule = nexus.objectType({
    name: 'ClassSchedule',
    definition(t: any) {
      t.nonNull.id('documentId');
      t.nonNull.string('name');
      t.string('instructor');
      t.string('modality');
      t.list.int('weekdays');
      t.string('startTime');
      t.string('endTime');
      t.int('maxCapacity');
      t.string('room');
      t.boolean('isActive');
      t.field('academy', {
        type: 'Academy',
        resolve: async (parent: any) => {
          if (parent.academy !== undefined) return parent.academy;
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { academy: true },
          });
          return doc?.academy ?? null;
        },
      });
    },
  });

  const ClassScheduleInput = nexus.inputObjectType({
    name: 'ClassScheduleInput',
    definition(t: any) {
      t.nonNull.string('name');
      t.string('instructor');
      t.string('modality');
      t.list.int('weekdays');
      t.string('startTime');
      t.string('endTime');
      t.int('maxCapacity');
      t.string('room');
      t.boolean('isActive');
    },
  });

  const ClassScheduleUpdateInput = nexus.inputObjectType({
    name: 'ClassScheduleUpdateInput',
    definition(t: any) {
      t.string('name');
      t.string('instructor');
      t.string('modality');
      t.list.int('weekdays');
      t.string('startTime');
      t.string('endTime');
      t.int('maxCapacity');
      t.string('room');
      t.boolean('isActive');
    },
  });

  const ScheduleConflictInput = nexus.inputObjectType({
    name: 'ScheduleConflictInput',
    definition(t: any) {
      t.nonNull.list.nonNull.int('weekdays');
      t.nonNull.string('startTime');
      t.nonNull.string('endTime');
      t.string('instructor');
      t.string('room');
      t.id('excludeDocumentId');
    },
  });

  const ScheduleConflict = nexus.objectType({
    name: 'ScheduleConflict',
    description:
      'Existing ClassSchedule that collides with a proposed input on instructor or room.',
    definition(t: any) {
      t.nonNull.field('schedule', { type: 'ClassSchedule' });
      // 'instructor' | 'room' — which dimension produced the clash.
      t.nonNull.string('reason');
      // Weekdays both schedules share (subset of the proposed input).
      t.nonNull.list.nonNull.int('days');
    },
  });

  const queries = nexus.extendType({
    type: 'Query',
    definition(t: any) {
      t.list.field('classSchedules', {
        type: 'ClassSchedule',
        args: { pagination: 'PaginationInput' },
        resolve: async (_root: any, args: any, ctx: any) => {
          const academyId = await resolveUserAcademyId(strapi, ctx);
          const filters = (await isPlatformAdmin(strapi, ctx))
            ? { isActive: true }
            : withAcademyScope({ isActive: true }, academyId);
          return await strapi.documents(UID).findMany({
            filters,
            start: args.pagination?.start ?? 0,
            limit: Math.min(100, args.pagination?.limit ?? 25),
            sort: { startTime: 'asc' },
          });
        },
      });

      t.field('classSchedule', {
        type: 'ClassSchedule',
        args: { documentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any, ctx: any) => {
          await assertCanAccessDoc(strapi, ctx, UID, args.documentId);
          return await strapi.documents(UID).findOne({ documentId: args.documentId });
        },
      });

      t.list.nonNull.field('scheduleConflicts', {
        type: 'ScheduleConflict',
        description:
          "Returns existing schedules that would clash with the input on instructor or room. Empty list = no conflict. Tenant-scoped to the caller's academy.",
        args: { input: nexus.nonNull(nexus.arg({ type: 'ScheduleConflictInput' })) },
        resolve: async (_root: any, args: any, ctx: any) => {
          const academyId = await resolveUserAcademyId(strapi, ctx);
          return findScheduleConflicts(
            strapi,
            academyId,
            {
              weekdays: args.input.weekdays,
              startTime: args.input.startTime,
              endTime: args.input.endTime,
              instructor: args.input.instructor ?? null,
              room: args.input.room ?? null,
            },
            args.input.excludeDocumentId ?? null,
          );
        },
      });

      t.list.field('scheduleBookings', {
        type: 'ClassBooking',
        description: 'Bookings for a given class schedule, optionally filtered by date.',
        args: {
          documentId: nexus.nonNull(nexus.idArg()),
          date: nexus.stringArg(),
        },
        resolve: async (_root: any, args: any, ctx: any) => {
          // Tenant check: schedule must belong to caller's academy.
          await assertCanAccessDoc(strapi, ctx, UID, args.documentId);
          const filters: any = { classSchedule: { documentId: args.documentId } };
          if (args.date) filters.date = args.date;
          return await strapi.documents(BOOKING_UID).findMany({
            filters,
            populate: { student: { populate: { photo: true } } },
            sort: { date: 'asc' },
          });
        },
      });
    },
  });

  const mutations = nexus.extendType({
    type: 'Mutation',
    definition(t: any) {
      t.field('createClassSchedule', {
        type: 'ClassSchedule',
        args: { data: nexus.nonNull(nexus.arg({ type: 'ClassScheduleInput' })) },
        resolve: async (_root: any, args: any, ctx: any) => {
          await requireRole(strapi, ctx, ['academy_admin']);
          const academyId = await requireAcademyId(strapi, ctx);

          // Hard-block on conflicts at write time so the DB can't end up
          // with an instructor or room double-booked, even if the front
          // skipped the live-preview query.
          if (args.data.startTime && args.data.endTime && args.data.weekdays) {
            const conflicts = await findScheduleConflicts(strapi, academyId, {
              weekdays: args.data.weekdays,
              startTime: args.data.startTime,
              endTime: args.data.endTime,
              instructor: args.data.instructor,
              room: args.data.room,
            });
            if (conflicts.length > 0) {
              throw new Error(formatConflictMessage(conflicts));
            }
          }

          return await strapi.documents(UID).create({
            data: { ...args.data, academy: academyId },
          });
        },
      });

      t.field('updateClassSchedule', {
        type: 'ClassSchedule',
        args: {
          documentId: nexus.nonNull(nexus.idArg()),
          data: nexus.nonNull(nexus.arg({ type: 'ClassScheduleUpdateInput' })),
        },
        resolve: async (_root: any, args: any, ctx: any) => {
          await assertCanAccessDoc(strapi, ctx, UID, args.documentId);
          await requireRole(strapi, ctx, ['academy_admin']);

          // Merge proposed patch onto current row so partial updates still
          // get the right time/weekday/instructor when checking conflicts.
          const current: any = await strapi
            .documents(UID)
            .findOne({ documentId: args.documentId });
          const merged = {
            weekdays: args.data.weekdays ?? current?.weekdays ?? [],
            startTime: args.data.startTime ?? current?.startTime,
            endTime: args.data.endTime ?? current?.endTime,
            instructor:
              args.data.instructor !== undefined
                ? args.data.instructor
                : current?.instructor,
            room: args.data.room !== undefined ? args.data.room : current?.room,
          };
          // Skip the conflict check on plain deactivations — flipping
          // isActive=false can't introduce overlap.
          const isDeactivation =
            args.data.isActive === false &&
            args.data.startTime === undefined &&
            args.data.endTime === undefined &&
            args.data.weekdays === undefined &&
            args.data.instructor === undefined &&
            args.data.room === undefined;
          if (!isDeactivation && merged.startTime && merged.endTime) {
            const academyId = await resolveUserAcademyId(strapi, ctx);
            const conflicts = await findScheduleConflicts(
              strapi,
              academyId,
              merged,
              args.documentId,
            );
            if (conflicts.length > 0) {
              throw new Error(formatConflictMessage(conflicts));
            }
          }

          return await strapi.documents(UID).update({
            documentId: args.documentId,
            data: args.data,
          });
        },
      });

      t.field('deleteClassSchedule', {
        type: 'ClassSchedule',
        args: { documentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any, ctx: any) => {
          await assertCanAccessDoc(strapi, ctx, UID, args.documentId);
          await requireRole(strapi, ctx, ['academy_admin']);
          const doc = await strapi.documents(UID).findOne({ documentId: args.documentId });
          await strapi.documents(UID).delete({ documentId: args.documentId });
          return doc;
        },
      });
    },
  });

  return {
    types: [
      ClassSchedule,
      ClassScheduleInput,
      ClassScheduleUpdateInput,
      ScheduleConflictInput,
      ScheduleConflict,
      queries,
      mutations,
    ],
    resolversConfig: {
      'Query.classSchedules': { auth: true },
      'Query.classSchedule': { auth: true },
      'Query.scheduleBookings': { auth: true },
      'Query.scheduleConflicts': { auth: true },
      'Mutation.createClassSchedule': { auth: true },
      'Mutation.updateClassSchedule': { auth: true },
      'Mutation.deleteClassSchedule': { auth: true },
    },
  };
}
