/**
 * GraphQL schema for the Payment content type.
 *
 * Tenancy: payment → enrollment → student/dependent → academy. Read scope
 * via withPaymentScope; create/update validated through assertCanAccessDoc
 * on the linked enrollment.
 *
 * Payments are normally created by the Asaas webhook (REST). The GraphQL
 * createPayment is a manual escape hatch for academy_admins.
 */

import type { Core } from '@strapi/strapi';
import {
  assertCanAccessDoc,
  isPlatformAdmin,
  requireAcademyId,
  requireRole,
  resolveDocAcademyId,
  resolveUserAcademyId,
  withPaymentScope,
} from '../helpers';

const UID = 'api::payment.payment';

export function buildPayment({ nexus, strapi }: { nexus: any; strapi: Core.Strapi }) {
  const Payment = nexus.objectType({
    name: 'Payment',
    definition(t: any) {
      t.nonNull.id('documentId');
      t.nonNull.float('amount');
      t.nonNull.string('dueDate');
      t.string('paidAt');
      t.nonNull.string('status');
      t.string('method');
      t.string('externalId');
      t.string('receiptUrl');
      t.field('enrollment', {
        type: 'Enrollment',
        resolve: async (parent: any) => {
          if (parent.enrollment !== undefined) return parent.enrollment;
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { enrollment: true },
          });
          return doc?.enrollment ?? null;
        },
      });
    },
  });

  const PaymentInput = nexus.inputObjectType({
    name: 'PaymentInput',
    definition(t: any) {
      t.nonNull.id('enrollment');
      t.nonNull.float('amount');
      t.nonNull.string('dueDate');
      t.string('method');
      t.string('status');
      t.string('paidAt');
      t.string('receiptUrl');
    },
  });

  const PaymentUpdateInput = nexus.inputObjectType({
    name: 'PaymentUpdateInput',
    definition(t: any) {
      t.string('status');
      t.string('paidAt');
      t.string('receiptUrl');
    },
  });

  const queries = nexus.extendType({
    type: 'Query',
    definition(t: any) {
      t.list.field('payments', {
        type: 'Payment',
        args: { pagination: 'PaginationInput' },
        resolve: async (_root: any, args: any, ctx: any) => {
          const academyId = await resolveUserAcademyId(strapi, ctx);
          const filters = (await isPlatformAdmin(strapi, ctx))
            ? {}
            : withPaymentScope(academyId);
          return await strapi.documents(UID).findMany({
            filters,
            start: args.pagination?.start ?? 0,
            limit: Math.min(100, args.pagination?.limit ?? 25),
            sort: { dueDate: 'desc' },
          });
        },
      });

      t.field('payment', {
        type: 'Payment',
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
      t.field('createPayment', {
        type: 'Payment',
        args: { data: nexus.nonNull(nexus.arg({ type: 'PaymentInput' })) },
        resolve: async (_root: any, args: any, ctx: any) => {
          await requireRole(strapi, ctx, ['academy_admin']);
          const academyId = await requireAcademyId(strapi, ctx);
          const enrollmentAcademy = await resolveDocAcademyId(
            strapi,
            'api::enrollment.enrollment',
            args.data.enrollment,
          );
          if (enrollmentAcademy !== academyId) {
            throw new Error('Matrícula de outra academia.');
          }
          return await strapi.documents(UID).create({
            data: {
              ...args.data,
              status: args.data.status ?? 'pending',
              method: args.data.method ?? 'pix',
            },
          });
        },
      });

      t.field('updatePayment', {
        type: 'Payment',
        args: {
          documentId: nexus.nonNull(nexus.idArg()),
          data: nexus.nonNull(nexus.arg({ type: 'PaymentUpdateInput' })),
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
    },
  });

  return {
    types: [Payment, PaymentInput, PaymentUpdateInput, queries, mutations],
    resolversConfig: {
      'Query.payments': { auth: true },
      'Query.payment': { auth: true },
      'Mutation.createPayment': { auth: true },
      'Mutation.updatePayment': { auth: true },
    },
  };
}
