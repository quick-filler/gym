/**
 * GraphQL schema for the ClassBooking content type.
 *
 * Custom mutation: checkInBooking — marks a booking as attended and stamps
 * checkedInAt. Used by both the admin attendance page and the student app
 * "I'm here" button.
 */

import type { Core } from '@strapi/strapi';

const UID = 'api::class-booking.class-booking';

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
      t.nonNull.id('student');
      t.nonNull.id('classSchedule');
      t.nonNull.string('date');
      t.string('status');
    },
  });

  const ClassBookingUpdateInput = nexus.inputObjectType({
    name: 'ClassBookingUpdateInput',
    definition(t: any) {
      t.id('student');
      t.id('classSchedule');
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
        resolve: async (_root: any, args: any) => {
          return await strapi.documents(UID).findMany({
            start: args.pagination?.start ?? 0,
            limit: Math.min(100, args.pagination?.limit ?? 25),
            sort: { date: 'desc' },
          });
        },
      });

      t.field('classBooking', {
        type: 'ClassBooking',
        args: { documentId: nexus.nonNull.idArg() },
        resolve: async (_root: any, args: any) => {
          return await strapi.documents(UID).findOne({ documentId: args.documentId });
        },
      });
    },
  });

  const mutations = nexus.extendType({
    type: 'Mutation',
    definition(t: any) {
      t.field('createClassBooking', {
        type: 'ClassBooking',
        args: { data: nexus.nonNull.arg({ type: 'ClassBookingInput' }) },
        resolve: async (_root: any, args: any) => {
          return await strapi.documents(UID).create({ data: args.data });
        },
      });

      t.field('updateClassBooking', {
        type: 'ClassBooking',
        args: {
          documentId: nexus.nonNull.idArg(),
          data: nexus.nonNull.arg({ type: 'ClassBookingUpdateInput' }),
        },
        resolve: async (_root: any, args: any) => {
          return await strapi.documents(UID).update({
            documentId: args.documentId,
            data: args.data,
          });
        },
      });

      t.field('deleteClassBooking', {
        type: 'ClassBooking',
        args: { documentId: nexus.nonNull.idArg() },
        resolve: async (_root: any, args: any) => {
          const doc = await strapi.documents(UID).findOne({ documentId: args.documentId });
          await strapi.documents(UID).delete({ documentId: args.documentId });
          return doc;
        },
      });

      t.field('checkInBooking', {
        type: 'ClassBooking',
        description: 'Mark a booking as attended and stamp checkedInAt.',
        args: { documentId: nexus.nonNull.idArg() },
        resolve: async (_root: any, args: any) => {
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
      'Mutation.createClassBooking': { auth: true },
      'Mutation.updateClassBooking': { auth: true },
      'Mutation.deleteClassBooking': { auth: true },
      'Mutation.checkInBooking': { auth: true },
    },
  };
}
