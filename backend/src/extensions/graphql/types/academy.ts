/**
 * GraphQL schema for the Academy content type.
 *
 * Tenancy:
 *   - academyBySlug(slug)   public  — branding lookup for white-label theming
 *   - academies()           platform admin only — cross-tenant listing
 *   - academy(documentId)   regular users get their own academy only;
 *                           platform admins fetch any
 *   - createAcademy         platform admin only — provisions a new tenant
 *   - updateAcademy         academy_admin (own academy) or platform admin
 *   - deleteAcademy         platform admin only — destructive cross-tenant op
 */

import type { Core } from '@strapi/strapi';
import {
  assertCanAccessDoc,
  isPlatformAdmin,
  resolveUserAcademyId,
  requireRole,
} from '../helpers';

const UID = 'api::academy.academy';
const FILE_UID = 'plugin::upload.file';

/**
 * Strapi v5's documents API accepts `documentId` for most relations,
 * but plugin::upload.file media relations still expect the numeric id.
 * Translate the documentId we receive on AcademyInput / AcademyUpdateInput
 * into the numeric id before handing the data to documents().update().
 *
 * Returns a new object — the original args.data from the GraphQL
 * resolver is frozen by Nexus/Apollo, so in-place mutation silently
 * no-ops in strict mode. Null means "detach the relation" and is
 * preserved so Strapi clears the field.
 */
async function resolveMediaIds<T extends Record<string, unknown>>(
  strapi: Core.Strapi,
  data: T,
): Promise<T> {
  const out: Record<string, unknown> = { ...data };
  for (const field of ['logo', 'logoSquare'] as const) {
    const value = out[field];
    if (typeof value !== 'string') continue; // null, undefined skip
    // db.query is a more reliable shortcut to the numeric id than
    // documents().findOne — plugin::upload.file's documents-API support
    // is uneven in Strapi 5.x.
    const file: any = await strapi.db
      .query(FILE_UID)
      .findOne({ where: { documentId: value }, select: ['id'] });
    if (!file) {
      throw new Error(`Arquivo não encontrado para ${field}.`);
    }
    out[field] = file.id;
  }
  return out as T;
}

export function buildAcademy({ nexus, strapi }: { nexus: any; strapi: Core.Strapi }) {
  const Academy = nexus.objectType({
    name: 'Academy',
    definition(t: any) {
      t.nonNull.id('documentId');
      t.nonNull.string('name');
      t.nonNull.string('slug');
      t.string('primaryColor');
      t.string('secondaryColor');
      t.string('plan');
      t.string('businessType');
      t.list.string('enabledModules');
      t.string('billingMode');
      t.boolean('isActive');
      t.string('email');
      t.string('phone');
      t.string('address');
      t.field('logo', {
        type: 'Media',
        resolve: async (parent: any) => {
          if (parent.logo !== undefined) return parent.logo;
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { logo: true },
          });
          return doc?.logo ?? null;
        },
      });
      t.field('logoSquare', {
        type: 'Media',
        description:
          'Square version of the logo, used for favicon and small icons. Optional — fall back to logo when absent.',
        resolve: async (parent: any) => {
          if (parent.logoSquare !== undefined) return parent.logoSquare;
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { logoSquare: true },
          });
          return doc?.logoSquare ?? null;
        },
      });
      t.field('subscription', {
        type: 'AcademySubscription',
        description:
          'Active SaaS subscription. Holds the tier (via platformPlan), trial/cycle state, and billing data. Null only on legacy rows that the backfill could not link.',
        resolve: async (parent: any) => {
          if (parent.subscription !== undefined) return parent.subscription;
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { subscription: { populate: { platformPlan: true } } } as any,
          });
          return doc?.subscription ?? null;
        },
      });
    },
  });

  const AcademyInput = nexus.inputObjectType({
    name: 'AcademyInput',
    definition(t: any) {
      t.nonNull.string('name');
      t.string('slug');
      t.string('primaryColor');
      t.string('secondaryColor');
      t.string('plan');
      t.string('businessType');
      t.list.string('enabledModules');
      t.string('billingMode');
      t.boolean('isActive');
      t.string('email');
      t.string('phone');
      t.string('address');
      t.id('logo');
      t.id('logoSquare');
    },
  });

  const AcademyUpdateInput = nexus.inputObjectType({
    name: 'AcademyUpdateInput',
    definition(t: any) {
      t.string('name');
      t.string('slug');
      t.string('primaryColor');
      t.string('secondaryColor');
      t.string('plan');
      t.string('businessType');
      t.list.string('enabledModules');
      t.string('billingMode');
      t.boolean('isActive');
      t.string('email');
      t.string('phone');
      t.string('address');
      t.id('logo');
      t.id('logoSquare');
    },
  });

  const AsaasSettingsStatus = nexus.objectType({
    name: 'AsaasSettingsStatus',
    description:
      "Asaas configuration status — surfaces whether credentials are set without exposing them.",
    definition(t: any) {
      t.nonNull.boolean('apiKeyConfigured');
      t.nonNull.boolean('webhookTokenConfigured');
      t.nonNull.string('environment');
      t.nonNull.string('webhookUrl');
      t.string('apiKeyHint');
    },
  });

  const AsaasSettingsInput = nexus.inputObjectType({
    name: 'AsaasSettingsInput',
    description:
      'Asaas credential update. Empty/null fields are preserved (never wipe an existing key with a blank submit).',
    definition(t: any) {
      t.string('apiKey');
      t.string('webhookToken');
      t.string('environment');
    },
  });

  const queries = nexus.extendType({
    type: 'Query',
    definition(t: any) {
      t.list.field('academies', {
        type: 'Academy',
        args: { pagination: 'PaginationInput' },
        resolve: async (_root: any, args: any, ctx: any) => {
          // Cross-tenant listing is restricted to platform admins.
          // Regular users get only their own academy back.
          if (await isPlatformAdmin(strapi, ctx)) {
            return await strapi.documents(UID).findMany({
              start: args.pagination?.start ?? 0,
              limit: Math.min(100, args.pagination?.limit ?? 25),
              sort: { name: 'asc' },
            });
          }
          const academyId = await resolveUserAcademyId(strapi, ctx);
          if (!academyId) return [];
          const own = await strapi.documents(UID).findOne({
            documentId: academyId,
          });
          return own ? [own] : [];
        },
      });

      t.field('academy', {
        type: 'Academy',
        args: { documentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any, ctx: any) => {
          await assertCanAccessDoc(strapi, ctx, UID, args.documentId);
          return await strapi.documents(UID).findOne({
            documentId: args.documentId,
          });
        },
      });

      t.field('academyBySlug', {
        type: 'Academy',
        description: 'Public — returns branding config for the given slug.',
        args: { slug: nexus.nonNull(nexus.stringArg()) },
        resolve: async (_root: any, args: any) => {
          const results: any[] = await strapi.documents(UID).findMany({
            filters: { slug: args.slug, isActive: true },
            limit: 1,
          });
          return results[0] ?? null;
        },
      });

      t.field('myAsaasSettings', {
        type: 'AsaasSettingsStatus',
        description:
          "Returns the Asaas configuration status for the caller's academy. Never reveals the actual credentials.",
        resolve: async (_root: any, _args: any, ctx: any) => {
          const academyId = await resolveUserAcademyId(strapi, ctx);
          if (!academyId) {
            throw new Error(
              'Sua conta não está vinculada a nenhuma academia.',
            );
          }
          const academy: any = await strapi.documents(UID).findOne({
            documentId: academyId,
            fields: [
              'slug',
              'asaasApiKey',
              'asaasWebhookToken',
              'asaasEnvironment',
            ] as any,
          });
          const apiBase =
            process.env.PUBLIC_API_URL ?? 'http://localhost:7777';
          return {
            apiKeyConfigured: !!academy?.asaasApiKey,
            webhookTokenConfigured: !!academy?.asaasWebhookToken,
            environment: academy?.asaasEnvironment ?? 'sandbox',
            webhookUrl: `${apiBase}/api/payments/webhook/${academy?.slug}`,
            apiKeyHint: academy?.asaasApiKey
              ? `…${academy.asaasApiKey.slice(-4)}`
              : null,
          };
        },
      });
    },
  });

  const mutations = nexus.extendType({
    type: 'Mutation',
    definition(t: any) {
      t.field('createAcademy', {
        type: 'Academy',
        args: { data: nexus.nonNull(nexus.arg({ type: 'AcademyInput' })) },
        resolve: async (_root: any, args: any, ctx: any) => {
          if (!(await isPlatformAdmin(strapi, ctx))) {
            throw new Error(
              'Acesso negado: apenas administradores da plataforma criam academias.',
            );
          }
          const data = await resolveMediaIds(strapi, args.data);
          return await strapi.documents(UID).create({ data });
        },
      });

      t.field('updateAcademy', {
        type: 'Academy',
        args: {
          documentId: nexus.nonNull(nexus.idArg()),
          data: nexus.nonNull(nexus.arg({ type: 'AcademyUpdateInput' })),
        },
        resolve: async (_root: any, args: any, ctx: any) => {
          // Platform admin can edit anything; academy_admin only their own.
          if (!(await isPlatformAdmin(strapi, ctx))) {
            await assertCanAccessDoc(strapi, ctx, UID, args.documentId);
            await requireRole(strapi, ctx, ['academy_admin']);
          }
          const data = await resolveMediaIds(strapi, args.data);
          return await strapi.documents(UID).update({
            documentId: args.documentId,
            data,
          });
        },
      });

      t.field('deleteAcademy', {
        type: 'Academy',
        args: { documentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any, ctx: any) => {
          if (!(await isPlatformAdmin(strapi, ctx))) {
            throw new Error(
              'Acesso negado: apenas administradores da plataforma deletam academias.',
            );
          }
          const doc = await strapi.documents(UID).findOne({
            documentId: args.documentId,
          });
          await strapi.documents(UID).delete({ documentId: args.documentId });
          return doc;
        },
      });

      t.field('updateMyAsaasSettings', {
        type: 'AsaasSettingsStatus',
        description:
          "Updates Asaas credentials for the caller's academy. Empty fields preserve the existing values — pass apiKey only when rotating.",
        args: { data: nexus.nonNull(nexus.arg({ type: 'AsaasSettingsInput' })) },
        resolve: async (_root: any, args: any, ctx: any) => {
          await requireRole(strapi, ctx, ['academy_admin']);
          const academyId = await resolveUserAcademyId(strapi, ctx);
          if (!academyId) {
            throw new Error(
              'Sua conta não está vinculada a nenhuma academia.',
            );
          }

          // Coerce empty strings to undefined so blanks never overwrite
          // existing credentials (rotation requires a non-empty value).
          const patch: Record<string, unknown> = {};
          if (args.data.apiKey?.trim()) {
            patch.asaasApiKey = args.data.apiKey.trim();
          }
          if (args.data.webhookToken?.trim()) {
            patch.asaasWebhookToken = args.data.webhookToken.trim();
          }
          if (args.data.environment) {
            if (!['sandbox', 'production'].includes(args.data.environment)) {
              throw new Error(
                'environment deve ser sandbox ou production.',
              );
            }
            patch.asaasEnvironment = args.data.environment;
          }

          if (Object.keys(patch).length === 0) {
            // Nothing to update — return current status.
          } else {
            await strapi.documents(UID).update({
              documentId: academyId,
              data: patch as any,
            });
          }

          const academy: any = await strapi.documents(UID).findOne({
            documentId: academyId,
            fields: [
              'slug',
              'asaasApiKey',
              'asaasWebhookToken',
              'asaasEnvironment',
            ] as any,
          });
          const apiBase =
            process.env.PUBLIC_API_URL ?? 'http://localhost:7777';
          return {
            apiKeyConfigured: !!academy?.asaasApiKey,
            webhookTokenConfigured: !!academy?.asaasWebhookToken,
            environment: academy?.asaasEnvironment ?? 'sandbox',
            webhookUrl: `${apiBase}/api/payments/webhook/${academy?.slug}`,
            apiKeyHint: academy?.asaasApiKey
              ? `…${academy.asaasApiKey.slice(-4)}`
              : null,
          };
        },
      });
    },
  });

  return {
    types: [
      Academy,
      AcademyInput,
      AcademyUpdateInput,
      AsaasSettingsStatus,
      AsaasSettingsInput,
      queries,
      mutations,
    ],
    resolversConfig: {
      'Query.academies': { auth: true },
      'Query.academy': { auth: true },
      'Query.academyBySlug': { auth: false },
      'Query.myAsaasSettings': { auth: true },
      'Mutation.createAcademy': { auth: true },
      'Mutation.updateAcademy': { auth: true },
      'Mutation.deleteAcademy': { auth: true },
      'Mutation.updateMyAsaasSettings': { auth: true },
    },
  };
}
