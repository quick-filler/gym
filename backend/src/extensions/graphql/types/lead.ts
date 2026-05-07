/**
 * Lead GraphQL module.
 *
 * Public surface:
 *   Mutation.submitContactForm — creates a Lead from the marketing /contact page.
 *
 * Platform-admin surface (isPlatformAdmin guard):
 *   Query.leads(status, page, pageSize) — paginated lead list
 *   Mutation.updateLead(documentId, status, notes) — triage a lead
 *   Mutation.convertLead(documentId, data) — provisions Academy + admin user
 *     from a lead, marks the lead converted, and emails a password-reset
 *     link to the new admin.
 */

import crypto from 'node:crypto';
import { isPlatformAdmin } from '../helpers';
import {
  getAcademyBranding,
  sendAcademyWelcomeEmail,
} from '../../../lib/email';

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

  const ConvertLeadInput = nexus.inputObjectType({
    name: 'ConvertLeadInput',
    description:
      'Settings to provision the new Academy + admin user when converting a lead.',
    definition(t: any) {
      t.nonNull.string('slug');
      t.nonNull.string('plan');
      t.string('academyName');
      t.string('primaryColor');
      t.string('secondaryColor');
      t.string('businessType');
    },
  });

  const ConvertLeadResult = nexus.objectType({
    name: 'ConvertLeadResult',
    description:
      'Outcome of a lead → academy conversion. passwordResetUrl is included so the platform admin can copy it manually if email delivery fails.',
    definition(t: any) {
      t.nonNull.field('academy', { type: 'Academy' });
      t.nonNull.string('passwordResetUrl');
      t.nonNull.string('adminEmail');
      t.nonNull.boolean('emailSent');
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

      t.field('convertLead', {
        type: 'ConvertLeadResult',
        description:
          'Provisions a new Academy + academy_admin user from a converted lead, marks the lead as converted, and sends a password-reset email so the new admin can log in.',
        args: {
          documentId: nexus.nonNull(nexus.idArg()),
          data: nexus.nonNull(nexus.arg({ type: 'ConvertLeadInput' })),
        },
        resolve: async (_: any, args: any, ctx: any) => {
          if (!(await isPlatformAdmin(strapi, ctx))) {
            throw new Error('Forbidden');
          }

          // ── load + validate lead ────────────────────────────────────────
          const lead: any = await strapi.documents(LEAD).findOne({
            documentId: args.documentId,
          });
          if (!lead) throw new Error('Lead não encontrado.');
          if (lead.status === 'converted') {
            throw new Error('Este lead já foi convertido.');
          }

          // ── normalize + validate input ──────────────────────────────────
          const slug = String(args.data.slug ?? '').trim().toLowerCase();
          if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug)) {
            throw new Error(
              'Slug inválido: use apenas letras minúsculas, números e hífens (ex.: crossfit-sp).',
            );
          }

          const plan = String(args.data.plan ?? '');
          if (!['starter', 'business', 'pro'].includes(plan)) {
            throw new Error('Plano inválido (starter, business ou pro).');
          }

          // ── slug uniqueness ─────────────────────────────────────────────
          const slugTaken: any[] = await strapi
            .documents('api::academy.academy')
            .findMany({ filters: { slug }, limit: 1 });
          if (slugTaken.length > 0) {
            throw new Error(`Já existe uma academia com o slug "${slug}".`);
          }

          // ── email uniqueness in users-permissions ───────────────────────
          const adminEmail = String(lead.email).trim().toLowerCase();
          const existingUser: any = await strapi.db
            .query('plugin::users-permissions.user')
            .findOne({ where: { email: adminEmail } });
          if (existingUser) {
            throw new Error(
              `Já existe um usuário com o e-mail ${adminEmail}. Vincule manualmente ou use outro e-mail.`,
            );
          }

          // ── 1. Create the Academy ───────────────────────────────────────
          const academy: any = await strapi
            .documents('api::academy.academy')
            .create({
              data: {
                name: args.data.academyName ?? lead.academyName ?? lead.name,
                slug,
                plan,
                primaryColor: args.data.primaryColor ?? '#6366f1',
                secondaryColor: args.data.secondaryColor ?? '#8b5cf6',
                businessType: args.data.businessType ?? 'gym',
                isActive: true,
                email: adminEmail,
                phone: lead.phone ?? null,
              } as any,
            });

          // ── 2. Create the users-permissions user ────────────────────────
          const roles = await strapi
            .plugin('users-permissions')
            .service('role')
            .find();
          const authRole = roles.find(
            (r: any) =>
              r.type === 'authenticated' || r.name === 'Authenticated',
          );
          if (!authRole) {
            throw new Error('Role Authenticated não encontrada.');
          }

          // Random throwaway password — the new admin sets their own via
          // the reset link. Strapi requires SOMETHING to satisfy validators.
          const tempPassword = crypto.randomBytes(16).toString('base64url');

          const user: any = await strapi
            .plugin('users-permissions')
            .service('user')
            .add({
              username: adminEmail,
              email: adminEmail,
              password: tempPassword,
              provider: 'local',
              role: authRole.id,
              confirmed: true,
              blocked: false,
            });

          // ── 3. Generate password-reset token ────────────────────────────
          const resetPasswordToken = crypto.randomBytes(64).toString('hex');
          await strapi.db
            .query('plugin::users-permissions.user')
            .update({
              where: { id: user.id },
              data: { resetPasswordToken },
            });

          // ── 4. Create the academy_admin Student linked to the user ──────
          await strapi.documents('api::student.student').create({
            data: {
              name: lead.name,
              email: adminEmail,
              phone: lead.phone ?? null,
              status: 'active',
              role: 'academy_admin',
              user: user.id,
              academy: academy.documentId,
              isGuardian: false,
            } as any,
          });

          // ── 5. Mark the lead as converted ───────────────────────────────
          const convertedNote = `[${new Date()
            .toISOString()
            .slice(0, 10)}] Convertido em academia "${academy.name}" (slug: ${slug}).`;
          const mergedNotes = lead.notes
            ? `${lead.notes}\n${convertedNote}`
            : convertedNote;
          await strapi.documents(LEAD).update({
            documentId: lead.documentId,
            data: { status: 'converted', notes: mergedNotes },
          });

          // ── 6. Send the welcome email ───────────────────────────────────
          const websiteOrigin =
            process.env.WEBSITE_ORIGIN ?? 'http://localhost:9999';
          const resetUrl = `${websiteOrigin.replace(/\/$/, '')}/reset-password?code=${encodeURIComponent(resetPasswordToken)}`;

          let emailSent = false;
          try {
            // Pull branding (logo + primaryColor) so the welcome email
            // matches the academy's identity. Brand-new academies have
            // only the seed defaults — that's fine, infra is wired for
            // when the dono customizes later.
            const branding = await getAcademyBranding(
              strapi,
              academy.documentId,
            );
            await sendAcademyWelcomeEmail(strapi, {
              name: lead.name,
              email: adminEmail,
              academyName: academy.name,
              resetUrl,
              branding,
            });
            emailSent = true;
          } catch (err) {
            strapi.log.warn(
              `[convertLead] welcome email failed for ${adminEmail}: ${
                err instanceof Error ? err.message : String(err)
              }`,
            );
          }

          return {
            academy,
            passwordResetUrl: resetUrl,
            adminEmail,
            emailSent,
          };
        },
      });
    },
  });

  return {
    types: [
      ContactFormInput,
      ContactFormResult,
      LeadType,
      LeadListResult,
      UpdateLeadInput,
      ConvertLeadInput,
      ConvertLeadResult,
      Query,
      Mutation,
    ],
    resolversConfig: {
      'Mutation.submitContactForm': { auth: false },
      'Query.leads': { auth: true },
      'Mutation.updateLead': { auth: true },
      'Mutation.convertLead': { auth: true },
    },
  };
}
