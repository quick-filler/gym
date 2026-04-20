/**
 * GraphQL schema for the Expense (despesa) content type.
 */

import type { Core } from '@strapi/strapi';
import { resolveUserAcademyId, withAcademyScope } from '../helpers';

const UID = 'api::expense.expense';

export function buildExpense({
  nexus,
  strapi,
}: {
  nexus: any;
  strapi: Core.Strapi;
}) {
  const Expense = nexus.objectType({
    name: 'Expense',
    definition(t: any) {
      t.nonNull.id('documentId');
      t.nonNull.string('description');
      t.string('subtitle');
      t.nonNull.float('amount');
      t.nonNull.string('date');
      t.string('dueDate');
      t.string('paidAt');
      t.nonNull.string('category');
      t.nonNull.string('type');
      t.nonNull.string('status');
      t.boolean('recurrent');
      t.int('recurrenceDay');
      t.string('notes');
      t.field('receipt', {
        type: 'Media',
        resolve: async (parent: any) => {
          if (parent.receipt !== undefined) return parent.receipt;
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { receipt: true },
          });
          return doc?.receipt ?? null;
        },
      });
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

  const ExpenseInput = nexus.inputObjectType({
    name: 'ExpenseInput',
    definition(t: any) {
      t.nonNull.string('description');
      t.string('subtitle');
      t.nonNull.float('amount');
      t.nonNull.string('date');
      t.string('dueDate');
      t.string('paidAt');
      t.nonNull.string('category');
      t.nonNull.string('type');
      t.string('status');
      t.boolean('recurrent');
      t.int('recurrenceDay');
      t.string('notes');
      t.id('academy');
    },
  });

  const ExpenseUpdateInput = nexus.inputObjectType({
    name: 'ExpenseUpdateInput',
    definition(t: any) {
      t.string('description');
      t.string('subtitle');
      t.float('amount');
      t.string('date');
      t.string('dueDate');
      t.string('paidAt');
      t.string('category');
      t.string('type');
      t.string('status');
      t.boolean('recurrent');
      t.int('recurrenceDay');
      t.string('notes');
    },
  });

  const queries = nexus.extendType({
    type: 'Query',
    definition(t: any) {
      t.list.field('expenses', {
        type: 'Expense',
        args: {
          pagination: 'PaginationInput',
          month: nexus.intArg(),
          year: nexus.intArg(),
        },
        resolve: async (_root: any, args: any, ctx: any) => {
          const academyId = await resolveUserAcademyId(strapi, ctx);
          const filters: any = withAcademyScope({}, academyId);
          if (args.year) {
            const mm = args.month
              ? String(args.month).padStart(2, '0')
              : null;
            if (mm) {
              const start = `${args.year}-${mm}-01`;
              const nextMonth = args.month === 12 ? 1 : args.month + 1;
              const nextYear = args.month === 12 ? args.year + 1 : args.year;
              const end = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
              filters.date = { $gte: start, $lt: end };
            } else {
              filters.date = {
                $gte: `${args.year}-01-01`,
                $lt: `${args.year + 1}-01-01`,
              };
            }
          }
          return await strapi.documents(UID).findMany({
            filters,
            start: args.pagination?.start ?? 0,
            limit: Math.min(500, args.pagination?.limit ?? 100),
            sort: { date: 'desc' },
          });
        },
      });

      t.field('expense', {
        type: 'Expense',
        args: { documentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any) =>
          await strapi.documents(UID).findOne({ documentId: args.documentId }),
      });
    },
  });

  const mutations = nexus.extendType({
    type: 'Mutation',
    definition(t: any) {
      t.field('createExpense', {
        type: 'Expense',
        args: { data: nexus.nonNull(nexus.arg({ type: 'ExpenseInput' })) },
        resolve: async (_root: any, args: any, ctx: any) => {
          const academyId = await resolveUserAcademyId(strapi, ctx);
          return await strapi.documents(UID).create({
            data: { ...args.data, academy: args.data.academy ?? academyId },
          });
        },
      });

      t.field('updateExpense', {
        type: 'Expense',
        args: {
          documentId: nexus.nonNull(nexus.idArg()),
          data: nexus.nonNull(nexus.arg({ type: 'ExpenseUpdateInput' })),
        },
        resolve: async (_root: any, args: any) =>
          await strapi.documents(UID).update({
            documentId: args.documentId,
            data: args.data,
          }),
      });

      t.field('deleteExpense', {
        type: 'Expense',
        args: { documentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any) => {
          const doc = await strapi
            .documents(UID)
            .findOne({ documentId: args.documentId });
          await strapi.documents(UID).delete({ documentId: args.documentId });
          return doc;
        },
      });
    },
  });

  return {
    types: [Expense, ExpenseInput, ExpenseUpdateInput, queries, mutations],
    resolversConfig: {
      'Query.expenses': { auth: true },
      'Query.expense': { auth: true },
      'Mutation.createExpense': { auth: true },
      'Mutation.updateExpense': { auth: true },
      'Mutation.deleteExpense': { auth: true },
    },
  };
}
