/**
 * GraphQL schema for the Enrollment content type.
 *
 * Enrollment has no direct academy field — tenancy is inherited from the
 * student or dependent it belongs to. We validate that:
 *   - on read:   the enrollment's student/dependent academy === caller's
 *   - on create: the referenced student/dependent and plan are all in the
 *                same academy as the caller (prevents cross-tenant linking)
 *
 * asaasCustomerId/asaasSubId stay private — never exposed via GraphQL.
 */

import type { Core } from '@strapi/strapi';
import {
  assertCanAccessDoc,
  isPlatformAdmin,
  requireAcademyId,
  requireRole,
  requireActiveSubscription,
  resolveDocAcademyId,
  resolveUserAcademyId,
  withStudentScope,
} from '../helpers';

const UID = 'api::enrollment.enrollment';
const PAYMENT = 'api::payment.payment';

/** Today as `yyyy-mm-dd` in the academy timezone (pt-BR). */
function todayBR(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
  }).format(new Date());
}

/**
 * Derives a human payment health for an enrollment from its payments,
 * mapping to the app's EnrollmentStatus vocabulary. Precedence:
 *   atrasado  — any payment overdue, or pending past its due date
 *   pendente  — any payment pending (due today/future)
 *   em_dia    — all paid/cancelled, or no payments yet
 */
export function computeEnrollmentStatus(
  payments: Array<{ status?: string; dueDate?: string }>,
): 'em_dia' | 'pendente' | 'atrasado' {
  if (!payments?.length) return 'em_dia';
  const today = todayBR();
  let hasPending = false;
  for (const p of payments) {
    if (p.status === 'overdue') return 'atrasado';
    if (p.status === 'pending') {
      if (p.dueDate && p.dueDate < today) return 'atrasado';
      hasPending = true;
    }
  }
  return hasPending ? 'pendente' : 'em_dia';
}

/** Adds `n` days to a `yyyy-mm-dd` date, returns `yyyy-mm-dd`. TZ-safe via UTC. */
function addDaysISO(dateISO: string, n: number): string {
  const d = new Date(`${dateISO}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * Adds `n` billing cycles to a `yyyy-mm-dd` date. monthly (default) / quarterly
 * (3 months) / annual (12 months). Month overflow follows JS Date semantics.
 */
export function addBillingCycle(dateISO: string, cycle: string, n = 1): string {
  const d = new Date(`${dateISO}T00:00:00Z`);
  if (cycle === 'annual') d.setUTCFullYear(d.getUTCFullYear() + n);
  else if (cycle === 'quarterly') d.setUTCMonth(d.getUTCMonth() + 3 * n);
  else d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 10);
}

export interface NextChargeResult {
  date: string;
  amount: number;
  status: 'em_dia' | 'pendente' | 'atrasado';
}

/**
 * The enrollment's next charge, derived (no billing engine yet):
 *   - If there's an open charge (pending/overdue), that IS the next charge
 *     (earliest dueDate, its own amount).
 *   - Else it's one billing cycle after the last paid charge (or the
 *     enrollment start when nothing is paid yet), priced at the plan.
 * Status by the charge date vs `today`:
 *   atrasado — date already passed (unpaid)
 *   pendente — date within the next 7 days ("semana do pagamento")
 *   em_dia   — still further out
 */
export function computeNextCharge(args: {
  payments: Array<{ status?: string; dueDate?: string; amount?: number }>;
  startDate: string;
  billingCycle: string;
  planPrice: number;
  today: string;
}): NextChargeResult {
  const { payments, startDate, billingCycle, planPrice, today } = args;
  const list = payments ?? [];

  const open = list
    .filter((p) => (p.status === 'pending' || p.status === 'overdue') && p.dueDate)
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1));

  let date: string;
  let amount: number;
  if (open.length) {
    date = open[0].dueDate!;
    amount = open[0].amount ?? planPrice;
  } else {
    const lastPaid = list
      .filter((p) => p.status === 'paid' && p.dueDate)
      .sort((a, b) => (a.dueDate! > b.dueDate! ? -1 : 1))[0];
    date = addBillingCycle(lastPaid?.dueDate ?? startDate, billingCycle, 1);
    amount = planPrice;
  }

  const status: NextChargeResult['status'] =
    date < today ? 'atrasado' : date <= addDaysISO(today, 7) ? 'pendente' : 'em_dia';

  return { date, amount, status };
}

export function buildEnrollment({ nexus, strapi }: { nexus: any; strapi: Core.Strapi }) {
  const NextCharge = nexus.objectType({
    name: 'NextCharge',
    description:
      "The enrollment's next billing: derived date (open charge or startDate + cycle), amount, and financial status (em_dia / pendente / atrasado).",
    definition(t: any) {
      t.nonNull.string('date'); // yyyy-mm-dd
      t.nonNull.float('amount');
      t.nonNull.string('status'); // em_dia | pendente | atrasado
    },
  });

  const Enrollment = nexus.objectType({
    name: 'Enrollment',
    definition(t: any) {
      t.nonNull.id('documentId');
      t.nonNull.string('startDate');
      t.string('endDate');
      t.nonNull.string('status');
      t.string('paymentMethod');
      t.field('student', {
        type: 'Student',
        resolve: async (parent: any) => {
          if (parent.student !== undefined) return parent.student;
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { student: true },
          });
          return doc?.student ?? null;
        },
      });
      t.field('plan', {
        type: 'Plan',
        resolve: async (parent: any) => {
          if (parent.plan !== undefined) return parent.plan;
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { plan: true },
          });
          return doc?.plan ?? null;
        },
      });
      t.list.field('payments', {
        type: 'Payment',
        resolve: async (parent: any) => {
          if (parent.payments !== undefined) return parent.payments;
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { payments: true },
          });
          return doc?.payments ?? [];
        },
      });
      t.field('computedStatus', {
        type: 'String',
        description:
          "Payment health derived from this enrollment's payments: em_dia / pendente / atrasado. On-demand — only resolved when selected.",
        resolve: async (parent: any) => {
          let payments = parent.payments;
          if (payments === undefined) {
            payments = await strapi.documents(PAYMENT).findMany({
              filters: { enrollment: { documentId: parent.documentId } } as any,
              fields: ['status', 'dueDate'],
              limit: 200,
            });
          }
          return computeEnrollmentStatus(payments ?? []);
        },
      });
      t.field('nextCharge', {
        type: 'NextCharge',
        description:
          'Próxima cobrança derivada (data + valor + situação financeira). Null quando a matrícula não tem plano.',
        resolve: async (parent: any) => {
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            fields: ['startDate'],
            populate: {
              plan: { fields: ['price', 'billingCycle'] },
              payments: { fields: ['status', 'dueDate', 'amount'] },
            },
          });
          if (!doc?.plan) return null; // sem plano → sem próxima cobrança
          return computeNextCharge({
            payments: doc.payments ?? [],
            startDate: doc.startDate ?? parent.startDate,
            billingCycle: doc.plan.billingCycle ?? 'monthly',
            planPrice: Number(doc.plan.price ?? 0),
            today: todayBR(),
          });
        },
      });
    },
  });

  const EnrollmentInput = nexus.inputObjectType({
    name: 'EnrollmentInput',
    definition(t: any) {
      t.id('student');
      t.id('dependent');
      t.nonNull.id('plan');
      t.nonNull.string('startDate');
      t.string('endDate');
      t.string('status');
      t.string('paymentMethod');
    },
  });

  const EnrollmentUpdateInput = nexus.inputObjectType({
    name: 'EnrollmentUpdateInput',
    definition(t: any) {
      t.string('startDate');
      t.string('endDate');
      t.string('status');
      t.string('paymentMethod');
    },
  });

  const queries = nexus.extendType({
    type: 'Query',
    definition(t: any) {
      t.list.field('enrollments', {
        type: 'Enrollment',
        args: { pagination: 'PaginationInput' },
        resolve: async (_root: any, args: any, ctx: any) => {
          const academyId = await resolveUserAcademyId(strapi, ctx);
          const filters = (await isPlatformAdmin(strapi, ctx))
            ? {}
            : withStudentScope({}, academyId);
          return await strapi.documents(UID).findMany({
            filters,
            start: args.pagination?.start ?? 0,
            limit: Math.min(100, args.pagination?.limit ?? 25),
            sort: { startDate: 'desc' },
          });
        },
      });

      t.field('enrollment', {
        type: 'Enrollment',
        args: { documentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any, ctx: any) => {
          await assertCanAccessDoc(strapi, ctx, UID, args.documentId);
          return await strapi.documents(UID).findOne({ documentId: args.documentId });
        },
      });
    },
  });

  const mutations = nexus.extendType({
    type: 'Mutation',
    definition(t: any) {
      t.field('createEnrollment', {
        type: 'Enrollment',
        args: { data: nexus.nonNull(nexus.arg({ type: 'EnrollmentInput' })) },
        resolve: async (_root: any, args: any, ctx: any) => {
          await requireRole(strapi, ctx, ['academy_admin']);
          await requireActiveSubscription(strapi, ctx);
          const academyId = await requireAcademyId(strapi, ctx);

          // Either student OR dependent must be set, not both.
          if (!args.data.student && !args.data.dependent) {
            throw new Error('Informe o aluno ou o dependente.');
          }
          if (args.data.student && args.data.dependent) {
            throw new Error(
              'Matrícula deve ter apenas student ou dependent, não os dois.',
            );
          }

          // Validate every referenced relation belongs to the caller's tenant.
          if (args.data.student) {
            const a = await resolveDocAcademyId(
              strapi,
              'api::student.student',
              args.data.student,
            );
            if (a !== academyId) throw new Error('Aluno de outra academia.');
          }
          if (args.data.dependent) {
            const a = await resolveDocAcademyId(
              strapi,
              'api::dependent.dependent',
              args.data.dependent,
            );
            if (a !== academyId) throw new Error('Dependente de outra academia.');
          }
          const planAcademy = await resolveDocAcademyId(
            strapi,
            'api::plan.plan',
            args.data.plan,
          );
          if (planAcademy !== academyId) {
            throw new Error('Plano de outra academia.');
          }

          return await strapi.documents(UID).create({ data: args.data });
        },
      });

      t.field('updateEnrollment', {
        type: 'Enrollment',
        args: {
          documentId: nexus.nonNull(nexus.idArg()),
          data: nexus.nonNull(nexus.arg({ type: 'EnrollmentUpdateInput' })),
        },
        resolve: async (_root: any, args: any, ctx: any) => {
          await assertCanAccessDoc(strapi, ctx, UID, args.documentId);
          await requireRole(strapi, ctx, ['academy_admin']);
          await requireActiveSubscription(strapi, ctx);
          return await strapi.documents(UID).update({
            documentId: args.documentId,
            data: args.data,
          });
        },
      });

      t.field('deleteEnrollment', {
        type: 'Enrollment',
        args: { documentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any, ctx: any) => {
          await assertCanAccessDoc(strapi, ctx, UID, args.documentId);
          await requireRole(strapi, ctx, ['academy_admin']);
          await requireActiveSubscription(strapi, ctx);
          const doc = await strapi.documents(UID).findOne({ documentId: args.documentId });
          await strapi.documents(UID).delete({ documentId: args.documentId });
          return doc;
        },
      });
    },
  });

  return {
    types: [NextCharge, Enrollment, EnrollmentInput, EnrollmentUpdateInput, queries, mutations],
    resolversConfig: {
      'Query.enrollments': { auth: true },
      'Query.enrollment': { auth: true },
      'Mutation.createEnrollment': { auth: true },
      'Mutation.updateEnrollment': { auth: true },
      'Mutation.deleteEnrollment': { auth: true },
    },
  };
}
