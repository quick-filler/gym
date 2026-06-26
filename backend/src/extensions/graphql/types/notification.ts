/**
 * GraphQL schema for in-app notifications (Fase 7).
 *
 * Caller-scoped inbox: every resolver reads/writes only the authenticated
 * user's own notifications (recipient = ctx user). Works for both students
 * (app) and academy admins (web). Frontends poll myNotifications /
 * myUnreadNotificationCount for near-real-time delivery.
 *
 * Writes (creating notifications) happen server-side via src/services/notify
 * from lifecycles + crons — never from the client.
 */

import type { Core } from '@strapi/strapi';
import { isPlatformAdmin } from '../helpers';
import {
  remindUpcomingCharges,
  remindUpcomingClasses,
} from '../../../services/reminders';

const UID = 'api::notification.notification';
const PUSH_DEVICE = 'api::push-device.push-device';

export function buildNotification({
  nexus,
  strapi,
}: {
  nexus: any;
  strapi: Core.Strapi;
}) {
  const Notification = nexus.objectType({
    name: 'Notification',
    definition(t: any) {
      t.nonNull.id('documentId');
      t.nonNull.string('kind');
      t.nonNull.string('title');
      t.string('body');
      t.field('data', { type: 'JSON' });
      t.nonNull.boolean('read');
      t.string('readAt');
      t.string('createdAt');
    },
  });

  const queries = nexus.extendType({
    type: 'Query',
    definition(t: any) {
      t.list.field('myNotifications', {
        type: 'Notification',
        description:
          "The caller's notifications, newest first. `unreadOnly` filters to unread.",
        args: {
          limit: nexus.intArg(),
          offset: nexus.intArg(),
          unreadOnly: nexus.booleanArg(),
        },
        resolve: async (_root: any, args: any, ctx: any) => {
          const userId = ctx?.state?.user?.id;
          if (!userId) return [];
          const filters: any = { recipient: { id: userId } };
          if (args.unreadOnly) filters.read = false;
          return await strapi.documents(UID).findMany({
            filters,
            sort: { createdAt: 'desc' },
            start: Math.max(0, args.offset ?? 0),
            limit: Math.min(100, Math.max(1, args.limit ?? 30)),
          });
        },
      });

      t.field('myUnreadNotificationCount', {
        type: 'Int',
        description: "Count of the caller's unread in-app notifications.",
        resolve: async (_root: any, _args: any, ctx: any) => {
          const userId = ctx?.state?.user?.id;
          if (!userId) return 0;
          const rows: any[] = await strapi.documents(UID).findMany({
            filters: { recipient: { id: userId }, read: false } as any,
            fields: ['documentId'],
            limit: 1000,
          });
          return rows.length;
        },
      });
    },
  });

  const mutations = nexus.extendType({
    type: 'Mutation',
    definition(t: any) {
      t.field('markNotificationRead', {
        type: 'Notification',
        description: 'Marks one of the caller’s notifications as read.',
        args: { documentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any, ctx: any) => {
          const userId = ctx?.state?.user?.id;
          if (!userId) throw new Error('Não autenticado.');
          const doc: any = await strapi.documents(UID).findOne({
            documentId: args.documentId,
            populate: { recipient: { fields: ['id'] } },
          });
          if (!doc) throw new Error('Notificação não encontrada.');
          if (doc.recipient?.id !== userId) {
            throw new Error('Notificação não pertence a você.');
          }
          if (doc.read) return doc;
          return await strapi.documents(UID).update({
            documentId: args.documentId,
            data: { read: true, readAt: new Date().toISOString() } as any,
          });
        },
      });

      t.field('markAllNotificationsRead', {
        type: 'Int',
        description:
          'Marks every unread notification of the caller as read. Returns how many were updated.',
        resolve: async (_root: any, _args: any, ctx: any) => {
          const userId = ctx?.state?.user?.id;
          if (!userId) throw new Error('Não autenticado.');
          const unread: any[] = await strapi.documents(UID).findMany({
            filters: { recipient: { id: userId }, read: false } as any,
            fields: ['documentId'],
            limit: 1000,
          });
          const now = new Date().toISOString();
          for (const n of unread) {
            await strapi.documents(UID).update({
              documentId: n.documentId,
              data: { read: true, readAt: now } as any,
            });
          }
          return unread.length;
        },
      });

      t.field('runNotificationReminders', {
        type: 'Int',
        description:
          'Dispara os crons de lembrete (cobrança + aula) manualmente e retorna quantas notificações criou. Restrito a platform admin (liberado fora de produção p/ testes).',
        resolve: async (_root: any, _args: any, ctx: any) => {
          const allowed =
            process.env.NODE_ENV !== 'production' ||
            (await isPlatformAdmin(strapi, ctx));
          if (!allowed) throw new Error('Acesso negado.');
          const charges = await remindUpcomingCharges(strapi);
          const classes = await remindUpcomingClasses(strapi);
          return charges + classes;
        },
      });

      t.field('registerPushToken', {
        type: 'Boolean',
        description:
          'Registra (ou reatribui) um Expo push token ao usuário do caller. Idempotente por token.',
        args: {
          token: nexus.nonNull(nexus.stringArg()),
          platform: nexus.stringArg(),
        },
        resolve: async (_root: any, args: any, ctx: any) => {
          const userId = ctx?.state?.user?.id;
          if (!userId) throw new Error('Não autenticado.');
          if (!args.token?.startsWith('ExponentPushToken')) {
            throw new Error('Token de push inválido.');
          }
          const existing: any = await strapi.db
            .query(PUSH_DEVICE)
            .findOne({ where: { token: args.token } });
          const data = {
            owner: userId,
            platform: args.platform ?? null,
            lastSeenAt: new Date(),
          };
          if (existing) {
            await strapi.db
              .query(PUSH_DEVICE)
              .update({ where: { id: existing.id }, data });
          } else {
            await strapi.db.query(PUSH_DEVICE).create({
              data: { token: args.token, publishedAt: new Date(), ...data },
            });
          }
          return true;
        },
      });

      t.field('unregisterPushToken', {
        type: 'Boolean',
        description: 'Remove um Expo push token (logout do aparelho).',
        args: { token: nexus.nonNull(nexus.stringArg()) },
        resolve: async (_root: any, args: any, ctx: any) => {
          if (!ctx?.state?.user?.id) throw new Error('Não autenticado.');
          const existing: any = await strapi.db
            .query(PUSH_DEVICE)
            .findOne({ where: { token: args.token } });
          if (existing) {
            await strapi.db.query(PUSH_DEVICE).delete({ where: { id: existing.id } });
          }
          return true;
        },
      });
    },
  });

  return {
    types: [Notification, queries, mutations],
    resolversConfig: {
      'Query.myNotifications': { auth: true },
      'Query.myUnreadNotificationCount': { auth: true },
      'Mutation.markNotificationRead': { auth: true },
      'Mutation.markAllNotificationsRead': { auth: true },
      'Mutation.runNotificationReminders': { auth: true },
      'Mutation.registerPushToken': { auth: true },
      'Mutation.unregisterPushToken': { auth: true },
    },
  };
}
