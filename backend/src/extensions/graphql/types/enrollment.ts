/**
 * GraphQL schema for the Enrollment content type.
 *
 * Enrollment has no direct academy field — tenancy is inherited from the
 * student or dependent it belongs to. We validate that:
 *   - on read:   the enrollment's student/dependent academy === caller's
 *   - on create: the referenced student/dependent and plan are all in the
 *                same academy as the caller (prevents cross-tenant linking)
 *
 * asaasCustomerId/asaasSubId stay private — never exposed via GraphQL.
 */

import type { Core } from '@strapi/strapi';
import {
  assertCanAccessDoc,
  isPlatformAdmin,
  requireAcademyId,
  requireRole,
  resolveDocAcademyId,
  resolveUserAcademyId,
  withStudentScope,
} from '../helpers';

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
      t.id('student');
      t.id('dependent');
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
          const academyId = await resolveUserAcademyId(strapi, ctx);
          const filters = (await isPlatformAdmin(strapi, ctx))
            ? {}
            : withStudentScope({}, academyId);
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
        resolve: async (_root: any, args: any, ctx: any) => {
          await assertCanAccessDoc(strapi, ctx, UID, args.documentId);
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
        resolve: async (_root: any, args: any, ctx: any) => {
          await requireRole(strapi, ctx, ['academy_admin']);
          const academyId = await requireAcademyId(strapi, ctx);

          // Either student OR dependent must be set, not both.
          if (!args.data.student && !args.data.dependent) {
            throw new Error('Informe o aluno ou o dependente.');
          }
          if (args.data.student && args.data.dependent) {
            throw new Error(
              'Matrícula deve ter apenas student ou dependent, não os dois.',
            );
          }

          // Validate every referenced relation belongs to the caller's tenant.
          if (args.data.student) {
            const a = await resolveDocAcademyId(
              strapi,
              'api::student.student',
              args.data.student,
            );
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
          const planAcademy = await resolveDocAcademyId(
            strapi,
            'api::plan.plan',
            args.data.plan,
          );
          if (planAcademy !== academyId) {
            throw new Error('Plano de outra academia.');
          }

          return await strapi.documents(UID).create({ data: args.data });
        },
      });

      t.field('updateEnrollment', {
        type: 'Enrollment',
        args: {
          documentId: nexus.nonNull(nexus.idArg()),
          data: nexus.nonNull(nexus.arg({ type: 'EnrollmentUpdateInput' })),
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

      t.field('deleteEnrollment', {
        type: 'Enrollment',
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
