import type { Core } from '@strapi/strapi';
import { setupRolesAndPermissions } from './bootstrap/permissions';
import { seedDemoData } from './bootstrap/seed';

export default {
  /**
   * register runs before Strapi initializes — use it to extend code, register
   * plugin hooks, etc. We don't need anything here right now.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * bootstrap runs after the database is connected but before the HTTP server
   * starts handling requests. We use it to:
   *   1. Create / update users-permissions roles for the gym domain
   *   2. Optionally seed demo data on a fresh install (SEED_DEMO=true)
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await setupRolesAndPermissions(strapi);

    if (process.env.SEED_DEMO === 'true') {
      await seedDemoData(strapi);
    }
  },
};
