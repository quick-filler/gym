/**
 * Lead GraphQL module.
 *
 * Public surface:
 *   Mutation.submitContactForm — creates a Lead from the marketing /contact page.
 *
 * Platform-admin surface (isPlatformAdmin guard):
 *   Query.leads(status, page, pageSize) — paginated lead list
 *   Mutation.updateLead(documentId, status, notes) — triage a lead
 */

import { isPlatformAdmin } from '../helpers';

export function buildLead({ nexus, strapi }: any) {
  const LEAD = 'api::lead.lead';

  // ── shared types ──────────────────────────────────────────────────────────

  const ContactFormInput = nexus.inputObjectType({
    name: 'ContactFormInput',
    definition(t: any) {
      t.nonNull.string('name');
      t.nonNull.string('email');
      t.string('phone');
      t.string('academyName');
      t.string('studentCount');
      t.nonNull.string('message');
    },
  });

  const ContactFormResult = nexus.objectType({
    name: 'ContactFormResult',
    definition(t: any) {
      t.nonNull.boolean('ok');
    },
  });

  const LeadType = nexus.objectType({
    name: 'Lead',
    definition(t: any) {
      t.nonNull.string('documentId');
      t.nonNull.string('name');
      t.nonNull.string('email');
      t.string('phone');
      t.string('academyName');
      t.string('studentCount');
      t.nonNull.string('message');
      t.nonNull.string('status');
      t.string('planInterest');
      t.string('notes');
      t.string('createdAt');
    },
  });

  const LeadListResult = nexus.objectType({
    name: 'LeadListResult',
    definition(t: any) {
      t.nonNull.list.nonNull.field('items', { type: 'Lead' });
      t.nonNull.int('total');
      t.nonNull.int('page');
      t.nonNull.int('pageSize');
    },
  });

  const UpdateLeadInput = nexus.inputObjectType({
    name: 'UpdateLeadInput',
    definition(t: any) {
      t.string('status');
      t.string('notes');
      t.string('planInterest');
    },
  });

  // ── queries ───────────────────────────────────────────────────────────────

  const Query = nexus.extendType({
    type: 'Query',
    definition(t: any) {
      t.field('leads', {
        type: 'LeadListResult',
        args: {
          status: nexus.stringArg(),
          page: nexus.intArg(),
          pageSize: nexus.intArg(),
        },
        resolve: async (_: any, args: any, ctx: any) => {
          if (!(await isPlatformAdmin(strapi, ctx))) {
            throw new Error('Forbidden');
          }
          const page = args.page ?? 1;
          const pageSize = args.pageSize ?? 20;
          const filters: any = {};
          if (args.status) filters.status = { $eq: args.status };

          const [items, total] = await Promise.all([
            strapi.documents(LEAD).findMany({
              filters,
              sort: { createdAt: 'desc' },
              limit: pageSize,
              start: (page - 1) * pageSize,
            }),
            strapi.documents(LEAD).count({ filters }),
          ]);

          return {
            items: items.map((l: any) => ({
              documentId: l.documentId,
              name: l.name,
              email: l.email,
              phone: l.phone ?? null,
              academyName: l.academyName ?? null,
              studentCount: l.studentCount ?? null,
              message: l.message,
              status: l.status,
              planInterest: l.planInterest ?? null,
              notes: l.notes ?? null,
              createdAt: l.createdAt,
            })),
            total,
            page,
            pageSize,
          };
        },
      });
    },
  });

  // ── mutations ─────────────────────────────────────────────────────────────

  const Mutation = nexus.extendType({
    type: 'Mutation',
    definition(t: any) {
      t.field('submitContactForm', {
        type: 'ContactFormResult',
        args: { input: nexus.nonNull(nexus.arg({ type: 'ContactFormInput' })) },
        async resolve(_: any, { input }: any) {
          await strapi.documents(LEAD).create({ data: input });
          return { ok: true };
        },
      });

      t.field('updateLead', {
        type: 'Lead',
        args: {
          documentId: nexus.nonNull(nexus.idArg()),
          data: nexus.nonNull(nexus.arg({ type: 'UpdateLeadInput' })),
        },
        resolve: async (_: any, args: any, ctx: any) => {
          if (!(await isPlatformAdmin(strapi, ctx))) {
            throw new Error('Forbidden');
          }
          const updated = await strapi.documents(LEAD).update({
            documentId: args.documentId,
            data: args.data,
          });
          return {
            documentId: updated.documentId,
            name: updated.name,
            email: updated.email,
            phone: updated.phone ?? null,
            academyName: updated.academyName ?? null,
            studentCount: updated.studentCount ?? null,
            message: updated.message,
            status: updated.status,
            planInterest: updated.planInterest ?? null,
            notes: updated.notes ?? null,
            createdAt: updated.createdAt,
          };
        },
      });
    },
  });

  return {
    types: [ContactFormInput, ContactFormResult, LeadType, LeadListResult, UpdateLeadInput, Query, Mutation],
    resolversConfig: {
      'Mutation.submitContactForm': { auth: false },
      'Query.leads': { auth: true },
      'Mutation.updateLead': { auth: true },
    },
  };
}
