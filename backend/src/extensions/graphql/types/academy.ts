/**
 * GraphQL schema for the Academy content type.
 *
 * Includes the public `academyBySlug` query which is the only auth-free
 * surface in the gym API — it powers the white-label theming on the
 * frontend (returns name, slug, colors, logo only).
 */

import type { Core } from '@strapi/strapi';

const UID = 'api::academy.academy';

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
      t.boolean('isActive');
      t.string('email');
      t.string('phone');
      t.string('address');
      t.id('logo');
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
      t.boolean('isActive');
      t.string('email');
      t.string('phone');
      t.string('address');
      t.id('logo');
    },
  });

  const queries = nexus.extendType({
    type: 'Query',
    definition(t: any) {
      t.list.field('academies', {
        type: 'Academy',
        args: { pagination: 'PaginationInput' },
        resolve: async (_root: any, args: any) => {
          return await strapi.documents(UID).findMany({
            start: args.pagination?.start ?? 0,
            limit: Math.min(100, args.pagination?.limit ?? 25),
            sort: { name: 'asc' },
          });
        },
      });

      t.field('academy', {
        type: 'Academy',
        args: { documentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any) => {
          return await strapi.documents(UID).findOne({ documentId: args.documentId });
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
    },
  });

  const mutations = nexus.extendType({
    type: 'Mutation',
    definition(t: any) {
      t.field('createAcademy', {
        type: 'Academy',
        args: { data: nexus.nonNull(nexus.arg({ type: 'AcademyInput' })) },
        resolve: async (_root: any, args: any) => {
          return await strapi.documents(UID).create({ data: args.data });
        },
      });

      t.field('updateAcademy', {
        type: 'Academy',
        args: {
          documentId: nexus.nonNull(nexus.idArg()),
          data: nexus.nonNull(nexus.arg({ type: 'AcademyUpdateInput' })),
        },
        resolve: async (_root: any, args: any) => {
          return await strapi.documents(UID).update({
            documentId: args.documentId,
            data: args.data,
          });
        },
      });

      t.field('deleteAcademy', {
        type: 'Academy',
        args: { documentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any) => {
          const doc = await strapi.documents(UID).findOne({ documentId: args.documentId });
          await strapi.documents(UID).delete({ documentId: args.documentId });
          return doc;
        },
      });
    },
  });

  return {
    types: [Academy, AcademyInput, AcademyUpdateInput, queries, mutations],
    resolversConfig: {
      'Query.academies': { auth: true },
      'Query.academy': { auth: true },
      'Query.academyBySlug': { auth: false },
      'Mutation.createAcademy': { auth: true },
      'Mutation.updateAcademy': { auth: true },
      'Mutation.deleteAcademy': { auth: true },
    },
  };
}
