import type { Core } from '@strapi/strapi';
import { setupRolesAndPermissions } from './bootstrap/permissions';
import { ensureDemoDevUser, seedDemoData } from './bootstrap/seed';
import {
  backfillAcademySubscriptions,
  backfillPoolSettings,
  ensurePlatformPlans,
  expireStaleTrials,
} from './bootstrap/platform-plans';
import { registerGraphQL } from './extensions/graphql';
import { registerUserPasswordLifecycle } from './bootstrap/user-password-lifecycle';

export default {
  /**
   * register runs before Strapi initializes — use it to register the explicit
   * GraphQL schema. shadowCRUD is disabled, so the entire /graphql surface
   * comes from src/extensions/graphql.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    registerGraphQL(strapi);
    registerUserPasswordLifecycle(strapi);
  },

  /**
   * bootstrap runs after the database is connected but before the HTTP server
   * starts handling requests. We use it to:
   *   1. Enable the Public role actions we always want available
   *      (Asaas webhook) — gym-specific roles live on Student.role, not
   *      in users-permissions.
   *   2. Optionally seed demo data on a fresh install (SEED_DEMO=true),
   *      then ensure a ready-to-login dev user exists.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await setupRolesAndPermissions(strapi);

    // SaaS tiers (Starter/Business/Pro) sempre presentes — sem isso, o
    // /pricing público e o backfill abaixo não têm o que linkar.
    await ensurePlatformPlans(strapi);
    // Cria uma AcademySubscription pra cada academia que ainda não tem.
    // Idempotente. Novas academias ganham subscription via lifecycle
    // (Academy.afterCreate), então essa função só toca em rows pré-
    // existentes na migração inicial.
    await backfillAcademySubscriptions(strapi);
    // Catch-up: vira `expired` subs que entraram em `trialing` e
    // passaram do prazo durante downtime. Em prod, um cron externo
    // (pg_cron / supercronic) deve rodar isso a cada hora.
    await expireStaleTrials(strapi);
    // PoolSettings com defaults da legislação brasileira pra academias
    // que ainda não tinham (criadas antes do módulo de piscina existir).
    await backfillPoolSettings(strapi);

    if (process.env.SEED_DEMO === 'true') {
      await seedDemoData(strapi);
      await ensureDemoDevUser(strapi);
    }
  },
};
