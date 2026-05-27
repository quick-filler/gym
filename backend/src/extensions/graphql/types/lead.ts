/**
 * Lead GraphQL module.
 *
 * Public surface:
 *   Mutation.submitContactForm — cria Lead a partir do /contact E
 *     **provisiona academia + usuário admin + envia welcome email no
 *     mesmo passo**. Sem aprovação manual: o trial de 14 dias começa
 *     na hora (lifecycle Academy.afterCreate cria a subscription),
 *     bloqueio só rola quando o trial expira. Isso transforma o
 *     formulário de "lead pra triagem" em "self-serve signup".
 *
 * Platform-admin surface (isPlatformAdmin guard):
 *   Query.leads(status, page, pageSize) — paginated lead list
 *   Mutation.updateLead(documentId, status, notes) — triage a lead
 *   Mutation.convertLead(documentId, data) — escape hatch pra
 *     provisionar manualmente leads antigos (status != 'converted')
 *     ou casos onde o platform admin quer customizar slug/plan/etc.
 */

import crypto from 'node:crypto';
import { isPlatformAdmin } from '../helpers';
import {
  getAcademyBranding,
  sendAcademyWelcomeEmail,
} from '../../../lib/email';

const ACADEMY_UID = 'api::academy.academy';
const STUDENT_UID = 'api::student.student';

/**
 * Normaliza nome → slug seguro pra URL/subdomínio.
 * "CrossFit Vila Mariana!" → "crossfit-vila-mariana"
 */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/**
 * Acha um slug livre na tabela academies — se "crossfit-sp" já existe,
 * tenta "crossfit-sp-2", "-3"... Para em 100 pra não loopar infinito.
 */
async function findFreeSlug(strapi: any, base: string): Promise<string> {
  const safe = slugify(base) || `academia-${Date.now().toString(36)}`;
  let candidate = safe;
  for (let n = 2; n < 100; n++) {
    const taken: any[] = await strapi
      .documents(ACADEMY_UID)
      .findMany({ filters: { slug: candidate }, limit: 1 });
    if (taken.length === 0) return candidate;
    candidate = `${safe}-${n}`;
  }
  // Fallback paranoico — concatena timestamp pra garantir unicidade.
  return `${safe}-${Date.now().toString(36)}`;
}

/**
 * Provisionamento compartilhado entre `submitContactForm` (self-serve)
 * e `convertLead` (manual via platform admin). Cria Academy + user
 * users-permissions + Student academy_admin + token de reset + tenta
 * mandar o welcome email.
 *
 * Lança erro com mensagem amigável quando: slug colide e auto-resolver
 * falhar, email já tem conta, role Authenticated sumir.
 */
async function provisionAcademyAndAdmin(
  strapi: any,
  params: {
    adminName: string;
    adminEmail: string;
    adminPhone?: string | null;
    academyName: string;
    slug: string;
    plan: string;
    primaryColor?: string;
    secondaryColor?: string;
    businessType?: string;
  },
): Promise<{
  academy: any;
  passwordResetUrl: string;
  emailSent: boolean;
}> {
  const {
    adminName,
    adminEmail,
    adminPhone,
    academyName,
    slug,
    plan,
    primaryColor = '#6366f1',
    secondaryColor = '#8b5cf6',
    businessType = 'gym',
  } = params;

  // ── email uniqueness ──────────────────────────────────────────────
  const existingUser: any = await strapi.db
    .query('plugin::users-permissions.user')
    .findOne({ where: { email: adminEmail } });
  if (existingUser) {
    throw new Error(
      `Já existe uma conta com o e-mail ${adminEmail}. Faça login ou use a recuperação de senha.`,
    );
  }

  // ── 1. Academy (afterCreate lifecycle cria a subscription trialing) ─
  const academy: any = await strapi.documents(ACADEMY_UID).create({
    data: {
      name: academyName,
      slug,
      plan,
      primaryColor,
      secondaryColor,
      businessType,
      isActive: true,
      email: adminEmail,
      phone: adminPhone ?? null,
    } as any,
  });

  // ── 2. users-permissions user (Authenticated role) ────────────────
  const roles = await strapi
    .plugin('users-permissions')
    .service('role')
    .find();
  const authRole = roles.find(
    (r: any) => r.type === 'authenticated' || r.name === 'Authenticated',
  );
  if (!authRole) throw new Error('Role Authenticated não encontrada.');

  // Senha throwaway — o admin define a real via o link de reset.
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

  // ── 3. Reset token pro link de boas-vindas ────────────────────────
  const resetPasswordToken = crypto.randomBytes(64).toString('hex');
  await strapi.db
    .query('plugin::users-permissions.user')
    .update({
      where: { id: user.id },
      data: { resetPasswordToken },
    });

  // ── 4. Student academy_admin vinculado ao user ────────────────────
  await strapi.documents(STUDENT_UID).create({
    data: {
      name: adminName,
      email: adminEmail,
      phone: adminPhone ?? null,
      status: 'active',
      role: 'academy_admin',
      user: user.id,
      academy: academy.documentId,
      isGuardian: false,
    } as any,
  });

  // ── 5. Welcome email (best-effort; não bloqueia provisionamento) ──
  const websiteOrigin = process.env.WEBSITE_ORIGIN ?? 'http://localhost:9999';
  const passwordResetUrl = `${websiteOrigin.replace(/\/$/, '')}/reset-password?code=${encodeURIComponent(resetPasswordToken)}`;
  let emailSent = false;
  try {
    const branding = await getAcademyBranding(strapi, academy.documentId);
    await sendAcademyWelcomeEmail(strapi, {
      name: adminName,
      email: adminEmail,
      academyName: academy.name,
      resetUrl: passwordResetUrl,
      branding,
    });
    emailSent = true;
  } catch (err) {
    strapi.log.warn(
      `[lead] welcome email failed for ${adminEmail}: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }

  return { academy, passwordResetUrl, emailSent };
}

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
          // Sanity de input — academyName é obrigatório pra derivar o
          // slug; o form do website já marca como required, mas o
          // resolver checa também porque ContactFormInput.academyName
          // continua opcional no schema (compat com clientes velhos).
          const adminName = String(input.name ?? '').trim();
          const adminEmail = String(input.email ?? '').trim().toLowerCase();
          const academyName =
            String(input.academyName ?? '').trim() || adminName;
          if (!adminName || !adminEmail) {
            throw new Error('Nome e e-mail são obrigatórios.');
          }
          if (!academyName) {
            throw new Error(
              'Informe o nome da academia pra criarmos sua conta.',
            );
          }

          // Persiste o lead independente do provisionamento — registro
          // pra analytics + fallback se a criação automática falhar.
          const lead: any = await strapi.documents(LEAD).create({
            data: { ...input, status: 'new' },
          });

          try {
            const slug = await findFreeSlug(strapi, academyName);
            const { academy } = await provisionAcademyAndAdmin(strapi, {
              adminName,
              adminEmail,
              adminPhone: input.phone ?? null,
              academyName,
              slug,
              plan: 'starter',
            });

            // Lead vira "converted" + nota com o slug pra rastreio.
            const noteLine = `[${new Date()
              .toISOString()
              .slice(0, 10)}] Auto-provisionado em "${academy.name}" (slug: ${slug}).`;
            await strapi.documents(LEAD).update({
              documentId: lead.documentId,
              data: { status: 'converted', notes: noteLine } as any,
            });
            return { ok: true };
          } catch (err) {
            // Mantém o lead como `new` pra platform admin tratar via
            // convertLead (manual). Propaga a mensagem pro frontend.
            strapi.log.warn(
              `[submitContactForm] auto-provision failed for ${adminEmail}: ${
                err instanceof Error ? err.message : String(err)
              }`,
            );
            throw err;
          }
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
          'Manual escape hatch: provisiona um lead específico com slug/plan custom (útil pra leads antigos ou casos onde o auto-provision falhou). Self-serve via submitContactForm cobre 99% dos casos.',
        args: {
          documentId: nexus.nonNull(nexus.idArg()),
          data: nexus.nonNull(nexus.arg({ type: 'ConvertLeadInput' })),
        },
        resolve: async (_: any, args: any, ctx: any) => {
          if (!(await isPlatformAdmin(strapi, ctx))) {
            throw new Error('Forbidden');
          }

          const lead: any = await strapi.documents(LEAD).findOne({
            documentId: args.documentId,
          });
          if (!lead) throw new Error('Lead não encontrado.');
          if (lead.status === 'converted') {
            throw new Error('Este lead já foi convertido.');
          }

          // Slug vem do form do platform admin — valida formato + uniqueness.
          const slug = String(args.data.slug ?? '').trim().toLowerCase();
          if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug)) {
            throw new Error(
              'Slug inválido: use apenas letras minúsculas, números e hífens (ex.: crossfit-sp).',
            );
          }
          const slugTaken: any[] = await strapi
            .documents(ACADEMY_UID)
            .findMany({ filters: { slug }, limit: 1 });
          if (slugTaken.length > 0) {
            throw new Error(`Já existe uma academia com o slug "${slug}".`);
          }

          const plan = String(args.data.plan ?? '');
          if (!['starter', 'business', 'pro'].includes(plan)) {
            throw new Error('Plano inválido (starter, business ou pro).');
          }

          const adminEmail = String(lead.email).trim().toLowerCase();
          const { academy, passwordResetUrl, emailSent } =
            await provisionAcademyAndAdmin(strapi, {
              adminName: lead.name,
              adminEmail,
              adminPhone: lead.phone ?? null,
              academyName:
                args.data.academyName ?? lead.academyName ?? lead.name,
              slug,
              plan,
              primaryColor: args.data.primaryColor ?? undefined,
              secondaryColor: args.data.secondaryColor ?? undefined,
              businessType: args.data.businessType ?? undefined,
            });

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

          return {
            academy,
            passwordResetUrl,
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
