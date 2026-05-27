/**
 * Bootstrap helpers — Platform plans (SaaS tiers).
 *
 * Roda em todo boot (não gated por SEED_DEMO) pra garantir que qualquer
 * banco — fresh clone, staging, prod — tenha os 3 tiers (Starter,
 * Business, Pro) cadastrados como `PlatformPlan`. Idempotente por slug.
 *
 * Depois do upsert dos tiers, faz backfill: pra cada Academy com
 * `platformPlan` ainda nulo, linka pelo `Academy.plan` enum (chave
 * de migração) → `PlatformPlan` com slug correspondente. Permite
 * apagar o enum em PR futuro sem perder a referência.
 */

import type { Core } from '@strapi/strapi';

const PLATFORM_PLAN_UID = 'api::platform-plan.platform-plan';
const ACADEMY_UID = 'api::academy.academy';
// Cast as any até o Strapi regenerar contentTypes.d.ts no próximo boot.
const SUBSCRIPTION_UID = 'api::academy-subscription.academy-subscription' as any;

type PlatformPlanSeed = {
  slug: 'starter' | 'business' | 'pro';
  name: string;
  tagline: string;
  tag: string;
  priceMonthly: number;
  priceAnnual: number;
  features: string[];
  limits: { maxStudents: number | null; maxInstructors: number | null; maxAdmins: number | null };
  modules: string[];
  featured: boolean;
  sortOrder: number;
  ctaLabel: string;
};

/**
 * Tabela mestre dos tiers — espelha hoje o MOCK_PRICING_PLANS no website
 * + a tabela COMPARE do PricingClient. Único lugar onde os números
 * "moram" no backend. Mudar preço/feature/limite = editar aqui ou via
 * admin UI (que escreve no mesmo banco).
 */
const SEED: PlatformPlanSeed[] = [
  {
    slug: 'starter',
    name: 'Starter',
    tagline: 'Para quem está começando',
    tag: 'Para começar',
    priceMonthly: 99,
    priceAnnual: 79,
    features: [
      'Até 50 alunos ativos',
      'Agenda + reservas',
      'Cobrança via PIX e boleto',
      'App white-label',
      'Suporte por e-mail',
    ],
    limits: { maxStudents: 50, maxInstructors: 2, maxAdmins: 1 },
    modules: ['agenda', 'attendance', 'finance', 'documents'],
    featured: false,
    sortOrder: 10,
    ctaLabel: 'Começar grátis',
  },
  {
    slug: 'business',
    name: 'Business',
    tagline: 'Para crescer com confiança',
    tag: 'Mais escolhido',
    priceMonthly: 199,
    priceAnnual: 159,
    features: [
      'Até 200 alunos ativos',
      'Tudo do Starter',
      'Cartão de crédito recorrente',
      'Relatórios financeiros',
      'Cobrança automática de inadimplentes',
      'Suporte WhatsApp prioritário',
    ],
    limits: { maxStudents: 200, maxInstructors: 10, maxAdmins: 3 },
    modules: [
      'agenda', 'attendance', 'finance', 'documents',
      'workouts', 'dependents', 'communication',
    ],
    featured: true,
    sortOrder: 20,
    ctaLabel: 'Começar grátis',
  },
  {
    slug: 'pro',
    name: 'Pro',
    tagline: 'Para academias com várias unidades',
    tag: 'Multi-unidade',
    priceMonthly: 399,
    priceAnnual: 319,
    features: [
      'Alunos ilimitados',
      'Tudo do Business',
      'Multi-unidade',
      'CRM integrado',
      'API + webhooks',
      'Gerente de conta dedicado',
    ],
    limits: { maxStudents: null, maxInstructors: null, maxAdmins: null },
    modules: [
      'agenda', 'attendance', 'finance', 'documents',
      'workouts', 'dependents', 'communication',
      'pool', 'pedagogy', 'makeups', 'resources',
      'digital_signature', 'indicators', 'imports',
    ],
    featured: false,
    sortOrder: 30,
    ctaLabel: 'Falar com vendas',
  },
];

/**
 * Find-or-create dos 3 PlatformPlans. Em re-boots, atualiza os campos
 * pra refletir mudanças na constante SEED — exceto `featured`, que
 * respeitamos se o admin tiver flipado manualmente via UI (não
 * sobrescreve flag editada à mão).
 */
export async function ensurePlatformPlans(strapi: Core.Strapi) {
  let created = 0;
  let updated = 0;

  for (const tier of SEED) {
    const existing: any[] = await strapi.documents(PLATFORM_PLAN_UID).findMany({
      filters: { slug: tier.slug },
      limit: 1,
    });

    if (existing.length === 0) {
      await strapi.documents(PLATFORM_PLAN_UID).create({
        data: {
          slug: tier.slug,
          name: tier.name,
          tagline: tier.tagline,
          tag: tier.tag,
          priceMonthly: tier.priceMonthly,
          priceAnnual: tier.priceAnnual,
          currency: 'BRL',
          features: tier.features,
          limits: tier.limits,
          modules: tier.modules,
          ctaLabel: tier.ctaLabel,
          featured: tier.featured,
          sortOrder: tier.sortOrder,
          isActive: true,
        } as any,
      });
      created++;
    } else {
      // Atualiza só campos "estruturais" (preço, features, limits, modules,
      // sortOrder). Mantém `featured`/`isActive` se já tiverem sido mexidos
      // via admin UI pra não pisar em decisões manuais.
      await strapi.documents(PLATFORM_PLAN_UID).update({
        documentId: existing[0].documentId,
        data: {
          name: tier.name,
          tagline: tier.tagline,
          tag: tier.tag,
          priceMonthly: tier.priceMonthly,
          priceAnnual: tier.priceAnnual,
          features: tier.features,
          limits: tier.limits,
          modules: tier.modules,
          sortOrder: tier.sortOrder,
          ctaLabel: tier.ctaLabel,
        } as any,
      });
      updated++;
    }
  }

  strapi.log.info(
    `[bootstrap] PlatformPlans ensured (created: ${created}, updated: ${updated})`,
  );
}

/**
 * Backfill: pra cada Academy SEM subscription, cria uma. Usa o
 * `Academy.plan` enum legado pra inferir o PlatformPlan (slug igual).
 * Subscriptions backfilled nascem `active` (não `trialing`) — academias
 * pré-existentes presumivelmente já estão usando o sistema.
 *
 * Idempotente: skipa academias que já têm subscription. Quando o enum
 * `Academy.plan` for removido (PR futuro), o fallback `'starter'`
 * mantém o backfill funcional pra qualquer academia órfã que apareça.
 */
export async function backfillAcademySubscriptions(strapi: Core.Strapi) {
  const tiers: any[] = await strapi.documents(PLATFORM_PLAN_UID).findMany({
    limit: 100,
  });
  const tierBySlug = new Map<string, any>(tiers.map((t) => [t.slug, t]));
  const starterTier = tierBySlug.get('starter');

  const academies: any[] = await strapi.documents(ACADEMY_UID).findMany({
    populate: { subscription: { fields: ['documentId'] } } as any,
    limit: 2000,
  });

  let created = 0;
  let alreadyHasOne = 0;
  let missingTier = 0;

  for (const academy of academies) {
    if (academy.subscription) {
      alreadyHasOne++;
      continue;
    }
    const slug = (academy.plan as string | undefined) ?? 'starter';
    const tier = tierBySlug.get(slug) ?? starterTier;
    if (!tier) {
      strapi.log.warn(
        `[bootstrap] backfill: no tier for academy "${academy.slug}" (slug="${slug}") and no starter fallback`,
      );
      missingTier++;
      continue;
    }

    const now = new Date();
    await strapi.documents(SUBSCRIPTION_UID).create({
      data: {
        academy: academy.documentId,
        platformPlan: tier.documentId,
        // Academias pré-existentes nasceram antes do conceito de
        // trial — assumimos `active`. Sub novas (signup) caem em
        // `trialing` via lifecycle, não aqui.
        status: 'active',
        recurrency: 'monthly',
        startedAt: (academy.createdAt as string | undefined) ?? now.toISOString(),
        currentPeriodStart: now.toISOString(),
        priceMonthlySnapshot: tier.priceMonthly,
        priceAnnualSnapshot: tier.priceAnnual ?? tier.priceMonthly,
        featuresSnapshot: tier.features,
        limitsSnapshot: tier.limits,
        billingEmail: academy.email ?? null,
        billingName: academy.name ?? null,
      } as any,
    });
    created++;
  }

  strapi.log.info(
    `[bootstrap] backfill AcademySubscription — created: ${created}, already had one: ${alreadyHasOne}, missing tier: ${missingTier}`,
  );
}

/**
 * Varre subscriptions em `trialing` cujo `trialEndsAt` já passou e
 * marca como `expired`. Idempotente — sub que já tá expired não é
 * tocada.
 *
 * Roda no boot (catch-up depois de downtime / janela perdida).
 * Em prod produção, idealmente é também acionada periodicamente
 * (cron externo / supercronic / pg_cron) — fora de escopo deste PR.
 */
export async function expireStaleTrials(strapi: Core.Strapi) {
  const nowIso = new Date().toISOString();
  const stale: any[] = await strapi.documents(SUBSCRIPTION_UID).findMany({
    filters: {
      status: 'trialing',
      trialEndsAt: { $lt: nowIso } as any,
    } as any,
    fields: ['status', 'trialEndsAt'] as any,
    limit: 1000,
  });

  let expired = 0;
  for (const sub of stale) {
    await strapi.documents(SUBSCRIPTION_UID).update({
      documentId: sub.documentId,
      data: { status: 'expired' } as any,
    });
    expired++;
  }

  if (expired > 0) {
    strapi.log.info(
      `[bootstrap] expired ${expired} trial subscription(s) past trialEndsAt`,
    );
  }
}

const POOL_SETTINGS_UID = 'api::pool-setting.pool-setting' as any;

/**
 * Pra cada Academy sem PoolSettings, cria uma row com os defaults da
 * legislação brasileira (pH 7.2–7.8, cloro 1–3 mg/L, temp 28–31°C).
 * Idempotente — academias novas ganham via Academy.afterCreate
 * lifecycle; essa função cobre as pré-existentes.
 */
export async function backfillPoolSettings(strapi: Core.Strapi) {
  const academies: any[] = await strapi.documents(ACADEMY_UID).findMany({
    populate: { poolSettings: { fields: ['documentId'] } } as any,
    limit: 2000,
  });

  let created = 0;
  for (const academy of academies) {
    if (academy.poolSettings) continue;
    await strapi.documents(POOL_SETTINGS_UID).create({
      data: {
        academy: academy.documentId,
        phMin: 7.2,
        phMax: 7.8,
        chlorineMin: 1,
        chlorineMax: 3,
        temperatureMin: 28,
        temperatureMax: 31,
        alertTolerance: 0.2,
        inspectionTimes: ['08:00', '18:00'],
      } as any,
    });
    created++;
  }

  if (created > 0) {
    strapi.log.info(
      `[bootstrap] backfilled PoolSettings for ${created} academy(ies)`,
    );
  }
}
