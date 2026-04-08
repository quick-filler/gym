/**
 * GraphQL schema for the Plan (membership plan) content type.
 */

import type { Core } from '@strapi/strapi';
import { resolveUserAcademyId, withAcademyScope } from '../helpers';

const UID = 'api::plan.plan';

export function buildPlan({ nexus, strapi }: { nexus: any; strapi: Core.Strapi }) {
  const Plan = nexus.objectType({
    name: 'Plan',
    definition(t: any) {
      t.nonNull.id('documentId');
      t.nonNull.string('name');
      t.string('description');
      t.nonNull.float('price');
      t.nonNull.string('billingCycle');
      t.int('maxStudents');
      t.list.string('features');
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

  const PlanInput = nexus.inputObjectType({
    name: 'PlanInput',
    definition(t: any) {
      t.nonNull.string('name');
      t.string('description');
      t.nonNull.float('price');
      t.nonNull.string('billingCycle');
      t.int('maxStudents');
      t.list.string('features');
      t.boolean('isActive');
      t.id('academy');
    },
  });

  const PlanUpdateInput = nexus.inputObjectType({
    name: 'PlanUpdateInput',
    definition(t: any) {
      t.string('name');
      t.string('description');
      t.float('price');
      t.string('billingCycle');
      t.int('maxStudents');
      t.list.string('features');
      t.boolean('isActive');
      t.id('academy');
    },
  });

  const queries = nexus.extendType({
    type: 'Query',
    definition(t: any) {
      t.list.field('plans', {
        type: 'Plan',
        args: { pagination: 'PaginationInput' },
        resolve: async (_root: any, args: any, ctx: any) => {
          const academyId = await resolveUserAcademyId(strapi, ctx);
          return await strapi.documents(UID).findMany({
            filters: withAcademyScope({}, academyId),
            start: args.pagination?.start ?? 0,
            limit: Math.min(100, args.pagination?.limit ?? 25),
            sort: { price: 'asc' },
          });
        },
      });

      t.field('plan', {
        type: 'Plan',
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
      t.field('createPlan', {
        type: 'Plan',
        args: { data: nexus.nonNull.arg({ type: 'PlanInput' }) },
        resolve: async (_root: any, args: any) => {
          return await strapi.documents(UID).create({ data: args.data });
        },
      });

      t.field('updatePlan', {
        type: 'Plan',
        args: {
          documentId: nexus.nonNull.idArg(),
          data: nexus.nonNull.arg({ type: 'PlanUpdateInput' }),
        },
        resolve: async (_root: any, args: any) => {
          return await strapi.documents(UID).update({
            documentId: args.documentId,
            data: args.data,
          });
        },
      });

      t.field('deletePlan', {
        type: 'Plan',
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
    types: [Plan, PlanInput, PlanUpdateInput, queries, mutations],
    resolversConfig: {
      'Query.plans': { auth: true },
      'Query.plan': { auth: true },
      'Mutation.createPlan': { auth: true },
      'Mutation.updatePlan': { auth: true },
      'Mutation.deletePlan': { auth: true },
    },
  };
}
