/**
 * GraphQL schema for the ClassBooking content type.
 *
 * Tenancy via student/dependent OR classSchedule → academy. Members can
 * create their own bookings (book themselves into a class) and check in;
 * staff (academy_admin / instructor) can manage any booking in the academy.
 */

import type { Core } from '@strapi/strapi';
import {
  assertCanAccessDoc,
  isPlatformAdmin,
  requireAcademyId,
  requireRole,
  requireActiveSubscription,
  resolveDocAcademyId,
  resolveUserAcademyId,
  resolveUserRole,
  withBookingScope,
} from '../helpers';

const UID = 'api::class-booking.class-booking';
const STUDENT = 'api::student.student';

/**
 * Today's date as `yyyy-mm-dd` in the academy timezone (pt-BR). Using the
 * tenant TZ (not UTC) so a 22:00 BRT class still counts as "today" instead
 * of rolling into tomorrow at 21:00 BRT (00:00 UTC).
 */
function todayBR(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
  }).format(new Date());
}

/** Minutes from midnight for a "HH:MM[:SS]" string; 0 on bad input. */
function startMinutes(schedule: any): number {
  const t = schedule?.startTime;
  if (typeof t !== 'string') return 0;
  const [h, m] = t.split(':').map((s: string) => Number.parseInt(s, 10));
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
}

/**
 * Upcoming confirmed bookings for a given Student, soonest first.
 *
 * "Upcoming" = status `confirmed` AND date >= today (academy TZ). Ordered
 * by (date asc, class start time asc) so the chronologically-next class is
 * first — Strapi can't sort by the related schedule's startTime, so we
 * order in JS after populating `classSchedule`.
 *
 * Shared by `Student.nextClass` (takes [0]) and the `myUpcomingBookings`
 * query (takes the first `limit`). Tenant-safe: scoped to one student's
 * own bookings.
 */
export async function findUpcomingBookingsForStudent(
  strapi: Core.Strapi,
  studentDocumentId: string,
  limit: number,
): Promise<any[]> {
  if (!studentDocumentId) return [];
  const rows: any[] = await strapi.documents(UID).findMany({
    filters: {
      student: { documentId: studentDocumentId },
      status: 'confirmed',
      date: { $gte: todayBR() },
    } as any,
    populate: { classSchedule: true },
    sort: { date: 'asc' },
    limit: 100,
  });
  rows.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return startMinutes(a.classSchedule) - startMinutes(b.classSchedule);
  });
  return rows.slice(0, Math.max(0, limit));
}

export function buildClassBooking({ nexus, strapi }: { nexus: any; strapi: Core.Strapi }) {
  const ClassBooking = nexus.objectType({
    name: 'ClassBooking',
    definition(t: any) {
      t.nonNull.id('documentId');
      t.nonNull.string('date');
      t.nonNull.string('status');
      t.string('checkedInAt');
      t.field('student', {
        type: 'Student',
        resolve: async (parent: any) => {
          if (parent.student !== undefined) return parent.student;
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { student: true },
          });
          return doc?.student ?? null;
        },
      });
      t.field('classSchedule', {
        type: 'ClassSchedule',
        resolve: async (parent: any) => {
          if (parent.classSchedule !== undefined) return parent.classSchedule;
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { classSchedule: true },
          });
          return doc?.classSchedule ?? null;
        },
      });
    },
  });

  const ClassBookingInput = nexus.inputObjectType({
    name: 'ClassBookingInput',
    definition(t: any) {
      t.id('student');
      t.id('dependent');
      t.nonNull.id('classSchedule');
      t.nonNull.string('date');
      t.string('status');
    },
  });

  const ClassBookingUpdateInput = nexus.inputObjectType({
    name: 'ClassBookingUpdateInput',
    definition(t: any) {
      t.string('date');
      t.string('status');
      t.string('checkedInAt');
    },
  });

  const queries = nexus.extendType({
    type: 'Query',
    definition(t: any) {
      t.list.field('classBookings', {
        type: 'ClassBooking',
        args: { pagination: 'PaginationInput' },
        resolve: async (_root: any, args: any, ctx: any) => {
          const academyId = await resolveUserAcademyId(strapi, ctx);
          const filters = (await isPlatformAdmin(strapi, ctx))
            ? {}
            : withBookingScope({}, academyId);
          return await strapi.documents(UID).findMany({
            filters,
            start: args.pagination?.start ?? 0,
            limit: Math.min(100, args.pagination?.limit ?? 25),
            sort: { date: 'desc' },
          });
        },
      });

      t.field('classBooking', {
        type: 'ClassBooking',
        args: { documentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any, ctx: any) => {
          await assertCanAccessDoc(strapi, ctx, UID, args.documentId);
          return await strapi.documents(UID).findOne({ documentId: args.documentId });
        },
      });

      t.list.field('myUpcomingBookings', {
        type: 'ClassBooking',
        description:
          "The caller's upcoming confirmed bookings, soonest first. Powers the app dashboard + schedule preview.",
        args: { limit: nexus.intArg() },
        resolve: async (_root: any, args: any, ctx: any) => {
          const userId = ctx?.state?.user?.id;
          if (!userId) return [];
          const me: any = (
            await strapi.documents(STUDENT).findMany({
              filters: { user: { id: userId } },
              fields: ['documentId'],
              limit: 1,
            })
          )[0];
          if (!me?.documentId) return [];
          const limit = Math.min(50, Math.max(1, args.limit ?? 5));
          return await findUpcomingBookingsForStudent(strapi, me.documentId, limit);
        },
      });
    },
  });

  const mutations = nexus.extendType({
    type: 'Mutation',
    definition(t: any) {
      t.field('createClassBooking', {
        type: 'ClassBooking',
        args: { data: nexus.nonNull(nexus.arg({ type: 'ClassBookingInput' })) },
        resolve: async (_root: any, args: any, ctx: any) => {
          // Any role can book — but only into their own academy and for
          // student/dependent records they own.
          const academyId = await requireAcademyId(strapi, ctx);
          const role = await resolveUserRole(strapi, ctx);

          if (!args.data.student && !args.data.dependent) {
            throw new Error('Informe o aluno ou o dependente.');
          }
          // Members can only book for themselves or their own dependents.
          if (role === 'member') {
            const userId = ctx?.state?.user?.id;
            const me: any = (
              await strapi.documents(STUDENT).findMany({
                filters: { user: { id: userId } },
                fields: ['documentId'],
                limit: 1,
              })
            )[0];
            if (args.data.student && args.data.student !== me?.documentId) {
              throw new Error('Reserva apenas para a própria conta.');
            }
            if (args.data.dependent) {
              const dep: any = await strapi
                .documents('api::dependent.dependent')
                .findOne({
                  documentId: args.data.dependent,
                  populate: { guardian: { fields: ['documentId'] } },
                });
              if (dep?.guardian?.documentId !== me?.documentId) {
                throw new Error('Dependente não pertence a esta conta.');
              }
            }
          }

          // Validate every linked record is in the caller's academy.
          if (args.data.student) {
            const a = await resolveDocAcademyId(strapi, STUDENT, args.data.student);
            if (a !== academyId) throw new Error('Aluno de outra academia.');
          }
          if (args.data.dependent) {
            const a = await resolveDocAcademyId(
              strapi,
              'api::dependent.dependent',
              args.data.dependent,
            );
            if (a !== academyId) throw new Error('Dependente de outra academia.');
          }
          const sa = await resolveDocAcademyId(
            strapi,
            'api::class-schedule.class-schedule',
            args.data.classSchedule,
          );
          if (sa !== academyId) throw new Error('Aula de outra academia.');

          return await strapi.documents(UID).create({ data: args.data });
        },
      });

      t.field('updateClassBooking', {
        type: 'ClassBooking',
        args: {
          documentId: nexus.nonNull(nexus.idArg()),
          data: nexus.nonNull(nexus.arg({ type: 'ClassBookingUpdateInput' })),
        },
        resolve: async (_root: any, args: any, ctx: any) => {
          await assertCanAccessDoc(strapi, ctx, UID, args.documentId);
          await requireRole(strapi, ctx, ['academy_admin', 'instructor']);
          await requireActiveSubscription(strapi, ctx);
          return await strapi.documents(UID).update({
            documentId: args.documentId,
            data: args.data,
          });
        },
      });

      t.field('deleteClassBooking', {
        type: 'ClassBooking',
        args: { documentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any, ctx: any) => {
          await assertCanAccessDoc(strapi, ctx, UID, args.documentId);
          await requireRole(strapi, ctx, ['academy_admin', 'instructor']);
          await requireActiveSubscription(strapi, ctx);
          const doc = await strapi.documents(UID).findOne({ documentId: args.documentId });
          await strapi.documents(UID).delete({ documentId: args.documentId });
          return doc;
        },
      });

      t.field('checkInBooking', {
        type: 'ClassBooking',
        description: 'Mark a booking as attended and stamp checkedInAt.',
        args: { documentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any, ctx: any) => {
          // Tenant-scoped: caller must own the academy where the booking lives.
          await assertCanAccessDoc(strapi, ctx, UID, args.documentId);
          return await strapi.documents(UID).update({
            documentId: args.documentId,
            data: {
              status: 'attended',
              checkedInAt: new Date().toISOString(),
            },
          });
        },
      });
    },
  });

  return {
    types: [ClassBooking, ClassBookingInput, ClassBookingUpdateInput, queries, mutations],
    resolversConfig: {
      'Query.classBookings': { auth: true },
      'Query.classBooking': { auth: true },
      'Query.myUpcomingBookings': { auth: true },
      'Mutation.createClassBooking': { auth: true },
      'Mutation.updateClassBooking': { auth: true },
      'Mutation.deleteClassBooking': { auth: true },
      'Mutation.checkInBooking': { auth: true },
    },
  };
}
