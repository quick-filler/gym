/**
 * GraphQL schema for the PlatformPlan content type.
 *
 * Diferente do `Plan` (planos de matrícula academy-scoped, vendidos
 * pros alunos), o `PlatformPlan` representa os **tiers SaaS** que cada
 * academia paga pra usar a GYM (Starter / Business / Pro). Por isso:
 *
 *   - `Query.platformPlans` e `Query.platformPlan(slug)` são **públicos**
 *     (auth: false) — alimentam a página /pricing.
 *   - Mutations CRUD são restritas a **platform_admin** (super-admin
 *     cross-tenant). Academy admins não mexem nos próprios tiers.
 */

import type { Core } from '@strapi/strapi';
import { isPlatformAdmin } from '../helpers';

const UID = 'api::platform-plan.platform-plan';

export function buildPlatformPlan({
  nexus,
  strapi,
}: {
  nexus: any;
  strapi: Core.Strapi;
}) {
  const PlatformPlan = nexus.objectType({
    name: 'PlatformPlan',
    description:
      'GYM SaaS tier (Starter/Business/Pro). Source of truth for /pricing and Academy.platformPlan.',
    definition(t: any) {
      t.nonNull.id('documentId');
      t.nonNull.string('slug');
      t.nonNull.string('name');
      t.string('tagline');
      t.string('tag');
      t.nonNull.float('priceMonthly');
      t.float('priceAnnual');
      t.string('currency');
      t.list.string('features');
      // limits / modules ficam como JSON porque a shape muda por tier
      // (limites numéricos, módulos como lista de strings). O frontend
      // já trata como blob.
      t.field('limits', { type: 'JSON' });
      t.field('modules', { type: 'JSON' });
      t.string('ctaLabel');
      t.boolean('featured');
      t.int('sortOrder');
      t.boolean('isActive');
    },
  });

  const PlatformPlanInput = nexus.inputObjectType({
    name: 'PlatformPlanInput',
    definition(t: any) {
      t.nonNull.string('slug');
      t.nonNull.string('name');
      t.string('tagline');
      t.string('tag');
      t.nonNull.float('priceMonthly');
      t.float('priceAnnual');
      t.string('currency');
      t.list.string('features');
      t.field('limits', { type: 'JSON' });
      t.field('modules', { type: 'JSON' });
      t.string('ctaLabel');
      t.boolean('featured');
      t.int('sortOrder');
      t.boolean('isActive');
    },
  });

  const PlatformPlanUpdateInput = nexus.inputObjectType({
    name: 'PlatformPlanUpdateInput',
    definition(t: any) {
      t.string('slug');
      t.string('name');
      t.string('tagline');
      t.string('tag');
      t.float('priceMonthly');
      t.float('priceAnnual');
      t.string('currency');
      t.list.string('features');
      t.field('limits', { type: 'JSON' });
      t.field('modules', { type: 'JSON' });
      t.string('ctaLabel');
      t.boolean('featured');
      t.int('sortOrder');
      t.boolean('isActive');
    },
  });

  const queries = nexus.extendType({
    type: 'Query',
    definition(t: any) {
      t.list.field('platformPlans', {
        type: 'PlatformPlan',
        resolve: async () => {
          // Sem auth, sem academia scope. Filtro por isActive porque a
          // /pricing nunca deve mostrar tier desativado, mas o admin
          // ainda enxerga via Strapi UI / mutations.
          return await strapi.documents(UID).findMany({
            filters: { isActive: true },
            sort: { sortOrder: 'asc', priceMonthly: 'asc' },
            limit: 50,
          });
        },
      });

      t.field('platformPlan', {
        type: 'PlatformPlan',
        args: { slug: nexus.nonNull(nexus.stringArg()) },
        resolve: async (_root: any, args: any) => {
          const rows: any[] = await strapi.documents(UID).findMany({
            filters: { slug: args.slug },
            limit: 1,
          });
          return rows[0] ?? null;
        },
      });
    },
  });

  const mutations = nexus.extendType({
    type: 'Mutation',
    definition(t: any) {
      t.field('createPlatformPlan', {
        type: 'PlatformPlan',
        args: { data: nexus.nonNull(nexus.arg({ type: 'PlatformPlanInput' })) },
        resolve: async (_root: any, args: any, ctx: any) => {
          if (!(await isPlatformAdmin(strapi, ctx))) {
            throw new Error('Acesso negado: restrito a platform_admin.');
          }
          return await strapi.documents(UID).create({ data: args.data });
        },
      });

      t.field('updatePlatformPlan', {
        type: 'PlatformPlan',
        args: {
          documentId: nexus.nonNull(nexus.idArg()),
          data: nexus.nonNull(nexus.arg({ type: 'PlatformPlanUpdateInput' })),
        },
        resolve: async (_root: any, args: any, ctx: any) => {
          if (!(await isPlatformAdmin(strapi, ctx))) {
            throw new Error('Acesso negado: restrito a platform_admin.');
          }
          return await strapi.documents(UID).update({
            documentId: args.documentId,
            data: args.data,
          });
        },
      });

      t.field('deletePlatformPlan', {
        type: 'PlatformPlan',
        args: { documentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any, ctx: any) => {
          if (!(await isPlatformAdmin(strapi, ctx))) {
            throw new Error('Acesso negado: restrito a platform_admin.');
          }
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
    types: [
      PlatformPlan,
      PlatformPlanInput,
      PlatformPlanUpdateInput,
      queries,
      mutations,
    ],
    resolversConfig: {
      'Query.platformPlans': { auth: false },
      'Query.platformPlan': { auth: false },
      'Mutation.createPlatformPlan': { auth: true },
      'Mutation.updatePlatformPlan': { auth: true },
      'Mutation.deletePlatformPlan': { auth: true },
    },
  };
}
