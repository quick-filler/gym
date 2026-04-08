/**
 * GraphQL schema for the Student content type.
 *
 * Custom queries:
 *   - me — returns the authenticated user's linked Student profile, deeply
 *     populated for the student-app dashboard (academy branding, active
 *     enrollment + plan, current workout).
 *
 * List queries are scoped by the caller's academy unless they're a super admin.
 */

import type { Core } from '@strapi/strapi';
import { resolveUserAcademyId, withAcademyScope } from '../helpers';

const UID = 'api::student.student';

export function buildStudent({ nexus, strapi }: { nexus: any; strapi: Core.Strapi }) {
  const Student = nexus.objectType({
    name: 'Student',
    definition(t: any) {
      t.nonNull.id('documentId');
      t.nonNull.string('name');
      t.nonNull.string('email');
      t.string('phone');
      t.string('birthdate');
      t.string('status');
      t.string('notes');
      t.field('photo', {
        type: 'Media',
        resolve: async (parent: any) => {
          if (parent.photo !== undefined) return parent.photo;
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { photo: true },
          });
          return doc?.photo ?? null;
        },
      });
      t.field('academy', {
        type: 'Academy',
        resolve: async (parent: any) => {
          if (parent.academy !== undefined) return parent.academy;
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { academy: { populate: { logo: true } } },
          });
          return doc?.academy ?? null;
        },
      });
      t.list.field('enrollments', {
        type: 'Enrollment',
        resolve: async (parent: any) => {
          if (parent.enrollments !== undefined) return parent.enrollments;
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { enrollments: { populate: { plan: true } } },
          });
          return doc?.enrollments ?? [];
        },
      });
      t.list.field('workoutPlans', {
        type: 'WorkoutPlan',
        resolve: async (parent: any) => {
          if (parent.workoutPlans !== undefined) return parent.workoutPlans;
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { workoutPlans: true },
          });
          return doc?.workoutPlans ?? [];
        },
      });
    },
  });

  const StudentInput = nexus.inputObjectType({
    name: 'StudentInput',
    definition(t: any) {
      t.nonNull.string('name');
      t.nonNull.string('email');
      t.string('phone');
      t.string('birthdate');
      t.string('status');
      t.string('notes');
      t.id('photo');
      t.id('academy');
      t.id('user');
    },
  });

  const StudentUpdateInput = nexus.inputObjectType({
    name: 'StudentUpdateInput',
    definition(t: any) {
      t.string('name');
      t.string('email');
      t.string('phone');
      t.string('birthdate');
      t.string('status');
      t.string('notes');
      t.id('photo');
      t.id('academy');
    },
  });

  const queries = nexus.extendType({
    type: 'Query',
    definition(t: any) {
      t.list.field('students', {
        type: 'Student',
        args: { pagination: 'PaginationInput' },
        resolve: async (_root: any, args: any, ctx: any) => {
          const academyId = await resolveUserAcademyId(strapi, ctx);
          return await strapi.documents(UID).findMany({
            filters: withAcademyScope({}, academyId),
            start: args.pagination?.start ?? 0,
            limit: Math.min(100, args.pagination?.limit ?? 25),
            sort: { name: 'asc' },
          });
        },
      });

      t.field('student', {
        type: 'Student',
        args: { documentId: nexus.nonNull.idArg() },
        resolve: async (_root: any, args: any) => {
          return await strapi.documents(UID).findOne({ documentId: args.documentId });
        },
      });

      t.field('me', {
        type: 'Student',
        description: 'Returns the authenticated user\'s linked Student profile.',
        resolve: async (_root: any, _args: any, ctx: any) => {
          const userId = ctx?.state?.user?.id;
          if (!userId) return null;
          const results: any[] = await strapi.documents(UID).findMany({
            filters: { user: { id: userId } },
            populate: {
              photo: true,
              academy: { populate: { logo: true } },
              enrollments: { populate: { plan: true } },
              workoutPlans: { filters: { isActive: true } },
            },
            limit: 1,
          });
          return results[0] ?? null;
        },
      });
    },
  });

  const mutations = nexus.extendType({
    type: 'Mutation',
    definition(t: any) {
      t.field('createStudent', {
        type: 'Student',
        args: { data: nexus.nonNull.arg({ type: 'StudentInput' }) },
        resolve: async (_root: any, args: any) => {
          return await strapi.documents(UID).create({ data: args.data });
        },
      });

      t.field('updateStudent', {
        type: 'Student',
        args: {
          documentId: nexus.nonNull.idArg(),
          data: nexus.nonNull.arg({ type: 'StudentUpdateInput' }),
        },
        resolve: async (_root: any, args: any) => {
          return await strapi.documents(UID).update({
            documentId: args.documentId,
            data: args.data,
          });
        },
      });

      t.field('deleteStudent', {
        type: 'Student',
        args: { documentId: nexus.nonNull.idArg() },
        resolve: async (_root: any, args: any) => {
          const doc = await strapi.documents(UID).findOne({ documentId: args.documentId });
          await strapi.documents(UID).delete({ documentId: args.documentId });
          return doc;
        },
      });
    },
  });

  return {
    types: [Student, StudentInput, StudentUpdateInput, queries, mutations],
    resolversConfig: {
      'Query.students': { auth: true },
      'Query.student': { auth: true },
      'Query.me': { auth: true },
      'Mutation.createStudent': { auth: true },
      'Mutation.updateStudent': { auth: true },
      'Mutation.deleteStudent': { auth: true },
    },
  };
}
