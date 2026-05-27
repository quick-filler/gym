/**
 * GraphQL schema for the AcademySubscription content type.
 *
 * Modelo: cada Academy tem **uma** subscription ativa que liga a um
 * PlatformPlan, carrega o ciclo (trial/active/past_due/cancelled/
 * expired), as datas (trial end, period start/end, cancel) e o
 * snapshot de preço/features/limits no momento da assinatura — assim
 * mudar o catálogo (`PlatformPlan`) não reescreve o histórico do
 * que foi cobrado.
 *
 * Tenancy:
 *   - `mySubscription`        → caller's academy only (academy_admin / instructor / member)
 *   - `subscriptions`         → platform_admin only (cross-tenant)
 *   - `updateMyBilling`       → academy_admin only, escopo da própria academia
 *   - `changeSubscriptionPlan`→ platform_admin only (upgrade/downgrade manual)
 *
 * Campos `asaas*` ficam `private` no schema.json — nunca expostos na
 * GraphQL (mesma convenção de `Enrollment.asaasCustomerId`).
 */

import type { Core } from '@strapi/strapi';
import {
  isPlatformAdmin,
  requireRole,
  resolveUserAcademyId,
} from '../helpers';

// Cast as any porque o contentTypes.d.ts gerado pelo Strapi ainda não
// reconhece o novo UID até o próximo boot — runtime é fine.
const UID = 'api::academy-subscription.academy-subscription' as any;
const PLATFORM_PLAN_UID = 'api::platform-plan.platform-plan';

export function buildAcademySubscription({
  nexus,
  strapi,
}: {
  nexus: any;
  strapi: Core.Strapi;
}) {
  const AcademySubscription = nexus.objectType({
    name: 'AcademySubscription',
    description:
      'Active SaaS subscription for an Academy. Links the academy to a PlatformPlan with cycle + trial + billing state.',
    definition(t: any) {
      t.nonNull.id('documentId');
      t.nonNull.string('status');
      t.nonNull.string('recurrency');
      t.string('startedAt');
      t.string('trialEndsAt');
      t.string('currentPeriodStart');
      t.string('currentPeriodEnd');
      t.string('cancelAt');
      t.string('cancelledAt');
      // Snapshot fields ficam expostos pra o painel da academia
      // mostrar exatamente o que foi contratado, mesmo depois que o
      // catálogo (`PlatformPlan`) for atualizado.
      t.float('priceMonthlySnapshot');
      t.float('priceAnnualSnapshot');
      t.field('featuresSnapshot', { type: 'JSON' });
      t.field('limitsSnapshot', { type: 'JSON' });
      // Billing data — visível só pro próprio admin (resolver gateia).
      t.string('billingEmail');
      t.string('billingName');
      t.string('billingDocumentType');
      t.string('billingDocumentNumber');
      t.string('billingZipcode');
      t.string('billingState');
      t.string('billingCity');
      t.string('billingAddressLine1');
      t.string('billingAddressLine2');
      t.string('billingNumber');
      t.string('notes');
      t.field('platformPlan', {
        type: 'PlatformPlan',
        resolve: async (parent: any) => {
          if (parent.platformPlan !== undefined) return parent.platformPlan;
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { platformPlan: true } as any,
          });
          return doc?.platformPlan ?? null;
        },
      });
      t.field('academy', {
        type: 'Academy',
        resolve: async (parent: any) => {
          if (parent.academy !== undefined) return parent.academy;
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { academy: true } as any,
          });
          return doc?.academy ?? null;
        },
      });
      // Computed: dá pra ler do front sem precisar somar datas
      // (`trialEndsAt - now`). Em ms; negativo significa expirado.
      t.int('trialDaysLeft', {
        resolve: (parent: any) => {
          if (parent.status !== 'trialing' || !parent.trialEndsAt) return null;
          const end = new Date(parent.trialEndsAt).getTime();
          const now = Date.now();
          return Math.ceil((end - now) / (24 * 60 * 60 * 1000));
        },
      });
    },
  });

  const BillingInfoInput = nexus.inputObjectType({
    name: 'BillingInfoInput',
    description:
      'Billing fields that the academy admin can edit on their own subscription. Empty strings preserve existing values (use null to clear).',
    definition(t: any) {
      t.string('billingEmail');
      t.string('billingName');
      t.string('billingDocumentType'); // CPF | CNPJ
      t.string('billingDocumentNumber');
      t.string('billingZipcode');
      t.string('billingState');
      t.string('billingCity');
      t.string('billingAddressLine1');
      t.string('billingAddressLine2');
      t.string('billingNumber');
    },
  });

  const queries = nexus.extendType({
    type: 'Query',
    definition(t: any) {
      t.field('mySubscription', {
        type: 'AcademySubscription',
        description:
          "Returns the active subscription for the caller's academy. Null if no subscription exists yet (shouldn't happen post-backfill).",
        resolve: async (_root: any, _args: any, ctx: any) => {
          const academyId = await resolveUserAcademyId(strapi, ctx);
          if (!academyId) {
            throw new Error('Sua conta não está vinculada a nenhuma academia.');
          }
          const rows: any[] = await strapi.documents(UID).findMany({
            filters: { academy: { documentId: academyId } } as any,
            populate: { platformPlan: true } as any,
            limit: 1,
          });
          return rows[0] ?? null;
        },
      });

      t.list.field('subscriptions', {
        type: 'AcademySubscription',
        description: 'Platform admin only — cross-tenant listing of every academy subscription.',
        args: { pagination: 'PaginationInput' },
        resolve: async (_root: any, args: any, ctx: any) => {
          if (!(await isPlatformAdmin(strapi, ctx))) {
            throw new Error('Acesso negado: restrito a platform_admin.');
          }
          return await strapi.documents(UID).findMany({
            start: args.pagination?.start ?? 0,
            limit: Math.min(200, args.pagination?.limit ?? 50),
            sort: { createdAt: 'desc' } as any,
            populate: { academy: true, platformPlan: true } as any,
          });
        },
      });
    },
  });

  const mutations = nexus.extendType({
    type: 'Mutation',
    definition(t: any) {
      t.field('updateMyBilling', {
        type: 'AcademySubscription',
        description:
          "Updates billing info on the caller's subscription. Restricted to academy_admin.",
        args: { data: nexus.nonNull(nexus.arg({ type: 'BillingInfoInput' })) },
        resolve: async (_root: any, args: any, ctx: any) => {
          await requireRole(strapi, ctx, ['academy_admin']);
          const academyId = await resolveUserAcademyId(strapi, ctx);
          if (!academyId) {
            throw new Error('Sua conta não está vinculada a nenhuma academia.');
          }
          const rows: any[] = await strapi.documents(UID).findMany({
            filters: { academy: { documentId: academyId } } as any,
            limit: 1,
          });
          const sub = rows[0];
          if (!sub) {
            throw new Error('Esta academia ainda não tem subscription criada.');
          }
          // Coerce: empty string → undefined (preserva), null explicito → null (limpa)
          const patch: Record<string, unknown> = {};
          const data = args.data as Record<string, string | null | undefined>;
          for (const [k, v] of Object.entries(data)) {
            if (v === undefined) continue;
            if (typeof v === 'string' && v.trim() === '') continue;
            patch[k] = v;
          }
          if (Object.keys(patch).length === 0) return sub;

          return await strapi.documents(UID).update({
            documentId: sub.documentId,
            data: patch as any,
          });
        },
      });

      t.field('changeSubscriptionPlan', {
        type: 'AcademySubscription',
        description:
          'Platform admin only — moves an academy to a different PlatformPlan. Re-snapshots price/features/limits.',
        args: {
          documentId: nexus.nonNull(nexus.idArg()),
          platformPlanSlug: nexus.nonNull(nexus.stringArg()),
          recurrency: nexus.stringArg(), // monthly | annual
        },
        resolve: async (_root: any, args: any, ctx: any) => {
          if (!(await isPlatformAdmin(strapi, ctx))) {
            throw new Error('Acesso negado: restrito a platform_admin.');
          }
          const tierRows: any[] = await strapi
            .documents(PLATFORM_PLAN_UID)
            .findMany({ filters: { slug: args.platformPlanSlug }, limit: 1 });
          const tier = tierRows[0];
          if (!tier) throw new Error(`PlatformPlan slug "${args.platformPlanSlug}" não encontrado.`);

          return await strapi.documents(UID).update({
            documentId: args.documentId,
            data: {
              platformPlan: tier.documentId,
              recurrency: args.recurrency ?? 'monthly',
              priceMonthlySnapshot: tier.priceMonthly,
              priceAnnualSnapshot: tier.priceAnnual ?? tier.priceMonthly,
              featuresSnapshot: tier.features,
              limitsSnapshot: tier.limits,
              // Sai do trial automaticamente quando muda plano via admin.
              status: 'active',
            } as any,
          });
        },
      });
    },
  });

  return {
    types: [AcademySubscription, BillingInfoInput, queries, mutations],
    resolversConfig: {
      'Query.mySubscription': { auth: true },
      'Query.subscriptions': { auth: true },
      'Mutation.updateMyBilling': { auth: true },
      'Mutation.changeSubscriptionPlan': { auth: true },
    },
  };
}
