/**
 * GraphQL schema for the Payment content type.
 *
 * Payments are read-only over GraphQL — they're created by the Asaas
 * webhook (REST endpoint) and updated by the same handler. Admins can
 * still update status manually if needed via the Strapi admin UI.
 */

import type { Core } from '@strapi/strapi';

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
        resolve: async (_root: any, args: any) => {
          return await strapi.documents(UID).findMany({
            start: args.pagination?.start ?? 0,
            limit: Math.min(100, args.pagination?.limit ?? 25),
            sort: { dueDate: 'desc' },
          });
        },
      });

      t.field('payment', {
        type: 'Payment',
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
      t.field('updatePayment', {
        type: 'Payment',
        args: {
          documentId: nexus.nonNull.idArg(),
          data: nexus.nonNull.arg({ type: 'PaymentUpdateInput' }),
        },
        resolve: async (_root: any, args: any) => {
          return await strapi.documents(UID).update({
            documentId: args.documentId,
            data: args.data,
          });
        },
      });
    },
  });

  return {
    types: [Payment, PaymentUpdateInput, queries, mutations],
    resolversConfig: {
      'Query.payments': { auth: true },
      'Query.payment': { auth: true },
      'Mutation.updatePayment': { auth: true },
    },
  };
}
