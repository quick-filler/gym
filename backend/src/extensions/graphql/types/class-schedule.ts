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
    types: [ClassSchedule, ClassScheduleInput, ClassScheduleUpdateInput, queries, mutations],
    resolversConfig: {
      'Query.classSchedules': { auth: true },
      'Query.classSchedule': { auth: true },
      'Query.scheduleBookings': { auth: true },
      'Mutation.createClassSchedule': { auth: true },
      'Mutation.updateClassSchedule': { auth: true },
      'Mutation.deleteClassSchedule': { auth: true },
    },
  };
}
