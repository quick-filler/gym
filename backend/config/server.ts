import type { Core } from '@strapi/strapi';
import {
  remindUpcomingCharges,
  remindUpcomingClasses,
} from '../src/services/reminders';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 7777),
  app: {
    keys: env.array('APP_KEYS'),
  },
  // Fase 7b — reminder crons (also triggerable via runNotificationReminders).
  cron: {
    enabled: true,
    tasks: {
      // ~09:00 BRT daily — "cobrança vence em 3/1 dia".
      '0 12 * * *': async ({ strapi }: { strapi: Core.Strapi }) => {
        await remindUpcomingCharges(strapi);
      },
      // every 15 min — "sua aula começa em 1 hora".
      '*/15 * * * *': async ({ strapi }: { strapi: Core.Strapi }) => {
        await remindUpcomingClasses(strapi);
      },
    },
  },
});

export default config;
