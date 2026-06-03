/**
 * GraphQL schema for in-app notifications.
 *
 * STUB (Fase 1): only `myUnreadNotificationCount` exists, hard-wired to 0
 * so the app can wire the header bell badge now. The real Notification
 * content type + inbox queries + push delivery land in Fase 7
 * (see APP-INTEGRATION-PLAN.md §3 Fase 7). When that ships, replace the
 * stub resolver with a real count of the caller's unread notifications.
 */

import type { Core } from '@strapi/strapi';

export function buildNotification({ nexus }: { nexus: any; strapi: Core.Strapi }) {
  const queries = nexus.extendType({
    type: 'Query',
    definition(t: any) {
      t.field('myUnreadNotificationCount', {
        type: 'Int',
        description:
          "Count of the caller's unread in-app notifications. Stub returning 0 until Fase 7 ships the Notification content type.",
        resolve: async () => 0,
      });
    },
  });

  return {
    types: [queries],
    resolversConfig: {
      'Query.myUnreadNotificationCount': { auth: true },
    },
  };
}
