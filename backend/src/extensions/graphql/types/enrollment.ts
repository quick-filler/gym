/**
 * GraphQL schema for the Enrollment content type.
 *
 * Note: asaasCustomerId and asaasSubId are intentionally not exposed in the
 * GraphQL type — they're internal payment-gateway state and stay in the
 * private (REST) admin/Strapi-internals layer.
 */

import type { Core } from '@strapi/strapi';
import { resolveUserAcademyId } from '../helpers';

const UID = 'api::enrollment.enrollment';

export function buildEnrollment({ nexus, strapi }: { nexus: any; strapi: Core.Strapi }) {
  const Enrollment = nexus.objectType({
    name: 'Enrollment',
    definition(t: any) {
      t.nonNull.id('documentId');
      t.nonNull.string('startDate');
      t.string('endDate');
      t.nonNull.string('status');
      t.string('paymentMethod');
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
      t.field('plan', {
        type: 'Plan',
        resolve: async (parent: any) => {
          if (parent.plan !== undefined) return parent.plan;
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { plan: true },
          });
          return doc?.plan ?? null;
        },
      });
      t.list.field('payments', {
        type: 'Payment',
        resolve: async (parent: any) => {
          if (parent.payments !== undefined) return parent.payments;
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { payments: true },
          });
          return doc?.payments ?? [];
        },
      });
    },
  });

  const EnrollmentInput = nexus.inputObjectType({
    name: 'EnrollmentInput',
    definition(t: any) {
      t.nonNull.id('student');
      t.nonNull.id('plan');
      t.nonNull.string('startDate');
      t.string('endDate');
      t.string('status');
      t.string('paymentMethod');
    },
  });

  const EnrollmentUpdateInput = nexus.inputObjectType({
    name: 'EnrollmentUpdateInput',
    definition(t: any) {
      t.id('student');
      t.id('plan');
      t.string('startDate');
      t.string('endDate');
      t.string('status');
      t.string('paymentMethod');
    },
  });

  const queries = nexus.extendType({
    type: 'Query',
    definition(t: any) {
      t.list.field('enrollments', {
        type: 'Enrollment',
        args: { pagination: 'PaginationInput' },
        resolve: async (_root: any, args: any, ctx: any) => {
          // Scope by the caller's academy via student → academy. Enrollment
          // doesn't have a direct academy field; it inherits tenancy from
          // the student it belongs to.
          const academyId = await resolveUserAcademyId(strapi, ctx);
          const filters: any = academyId
            ? { student: { academy: { documentId: academyId } } }
            : {};
          return await strapi.documents(UID).findMany({
            filters,
            start: args.pagination?.start ?? 0,
            limit: Math.min(100, args.pagination?.limit ?? 25),
            sort: { startDate: 'desc' },
          });
        },
      });

      t.field('enrollment', {
        type: 'Enrollment',
        args: { documentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any) => {
          return await strapi.documents(UID).findOne({ documentId: args.documentId });
        },
      });
    },
  });

  const mutations = nexus.extendType({
    type: 'Mutation',
    definition(t: any) {
      t.field('createEnrollment', {
        type: 'Enrollment',
        args: { data: nexus.nonNull(nexus.arg({ type: 'EnrollmentInput' })) },
        resolve: async (_root: any, args: any) => {
          return await strapi.documents(UID).create({ data: args.data });
        },
      });

      t.field('updateEnrollment', {
        type: 'Enrollment',
        args: {
          documentId: nexus.nonNull(nexus.idArg()),
          data: nexus.nonNull(nexus.arg({ type: 'EnrollmentUpdateInput' })),
        },
        resolve: async (_root: any, args: any) => {
          return await strapi.documents(UID).update({
            documentId: args.documentId,
            data: args.data,
          });
        },
      });

      t.field('deleteEnrollment', {
        type: 'Enrollment',
        args: { documentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any) => {
          const doc = await strapi.documents(UID).findOne({ documentId: args.documentId });
          await strapi.documents(UID).delete({ documentId: args.documentId });
          return doc;
        },
      });
    },
  });

  return {
    types: [Enrollment, EnrollmentInput, EnrollmentUpdateInput, queries, mutations],
    resolversConfig: {
      'Query.enrollments': { auth: true },
      'Query.enrollment': { auth: true },
      'Mutation.createEnrollment': { auth: true },
      'Mutation.updateEnrollment': { auth: true },
      'Mutation.deleteEnrollment': { auth: true },
    },
  };
}
