/**
 * Academy lifecycles.
 *
 * afterCreate → cria automaticamente uma AcademySubscription `trialing`
 *   com 14 dias de trial, plano default `starter` e snapshots de
 *   preço/features/limits. Sem isso, academia recém-criada (signup,
 *   convertLead, seed) começa sem subscription — e o painel quebra
 *   ao tentar ler `academy.subscription.platformPlan`.
 *
 * Idempotente: se já existe subscription pra essa academia, no-op.
 */

import type { Core } from '@strapi/strapi';

// Casts as any porque os tipos gerados pelo Strapi (contentTypes.d.ts)
// só conhecem os novos UIDs depois do próximo boot. Runtime é fine.
const SUBSCRIPTION_UID = 'api::academy-subscription.academy-subscription' as any;
const PLATFORM_PLAN_UID = 'api::platform-plan.platform-plan';
const POOL_SETTINGS_UID = 'api::pool-setting.pool-setting' as any;

const TRIAL_DAYS = 14;

export default {
  async afterCreate(event: any) {
    const strapi = (global as any).strapi as Core.Strapi;
    if (!strapi) return;

    const academy = event?.result;
    if (!academy?.documentId) return;

    try {
      await ensureSubscription(strapi, academy);
    } catch (err) {
      strapi.log.warn(
        `[academy.afterCreate] subscription bootstrap failed for ${academy.slug}: ${(err as Error).message}`,
      );
    }

    try {
      await ensurePoolSettings(strapi, academy);
    } catch (err) {
      strapi.log.warn(
        `[academy.afterCreate] pool settings bootstrap failed for ${academy.slug}: ${(err as Error).message}`,
      );
    }
  },
};

/**
 * Cria PoolSettings default pra cada Academy nova. Mesmo que o módulo
 * Piscina esteja desligado em enabledModules, deixar a row criada
 * simplifica o caso de ligar depois (já tem config válida).
 *
 * Idempotente — checa se já existe antes de criar.
 */
async function ensurePoolSettings(strapi: Core.Strapi, academy: any) {
  const existing: any[] = await strapi.documents(POOL_SETTINGS_UID).findMany({
    filters: { academy: { documentId: academy.documentId } } as any,
    limit: 1,
  });
  if (existing.length > 0) return;

  await strapi.documents(POOL_SETTINGS_UID).create({
    data: {
      academy: academy.documentId,
      // Defaults da legislação brasileira de piscinas — admin pode
      // editar via /admin/settings → aba Módulos.
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
}

async function ensureSubscription(strapi: Core.Strapi, academy: any) {
  // Skipa se já tem subscription (academia criada via UI de bulk import
  // mais de uma vez, ou seed re-rodando)
  const existing: any[] = await strapi.documents(SUBSCRIPTION_UID).findMany({
    filters: { academy: { documentId: academy.documentId } } as any,
    limit: 1,
  });
  if (existing.length > 0) return;

  // Tenta plano explícito (academy.plan enum) ou cai pro starter
  const desiredSlug = (academy.plan as string | undefined) ?? 'starter';
  const tierRows: any[] = await strapi.documents(PLATFORM_PLAN_UID).findMany({
    filters: { slug: desiredSlug },
    limit: 1,
  });
  const tier = tierRows[0];
  if (!tier) {
    strapi.log.warn(
      `[academy.afterCreate] no PlatformPlan with slug="${desiredSlug}" — ensurePlatformPlans não rodou?`,
    );
    return;
  }

  const now = new Date();
  const trialEnd = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

  await strapi.documents(SUBSCRIPTION_UID).create({
    data: {
      academy: academy.documentId,
      platformPlan: tier.documentId,
      status: 'trialing',
      recurrency: 'monthly',
      startedAt: now.toISOString(),
      trialEndsAt: trialEnd.toISOString(),
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: trialEnd.toISOString(),
      priceMonthlySnapshot: tier.priceMonthly,
      priceAnnualSnapshot: tier.priceAnnual ?? tier.priceMonthly,
      featuresSnapshot: tier.features,
      limitsSnapshot: tier.limits,
      billingEmail: academy.email ?? null,
      billingName: academy.name ?? null,
    } as any,
  });
  strapi.log.info(
    `[academy.afterCreate] created trial subscription for ${academy.slug} (tier=${desiredSlug}, ${TRIAL_DAYS}d)`,
  );
}
