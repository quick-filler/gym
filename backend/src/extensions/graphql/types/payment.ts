/**
 * GraphQL schema for the Payment content type.
 *
 * Tenancy: payment → enrollment → student/dependent → academy. Read scope
 * via withPaymentScope; create/update validated through assertCanAccessDoc
 * on the linked enrollment.
 *
 * Payments are normally created by the Asaas webhook (REST). The GraphQL
 * createPayment is a manual escape hatch for academy_admins.
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
  withPaymentScope,
} from '../helpers';
import { resolveGateway, type ChargeRequest } from '../../../services/payment-gateway';

const UID = 'api::payment.payment';
const STUDENT_UID = 'api::student.student';

/* ------------------------------------------------------------------
 * Pure helpers (exported for unit tests)
 * ------------------------------------------------------------------ */

/** A Payment "belongs to" the caller when it points at them directly or
 *  via its enrollment. Dependents are handled in a later phase. */
export function paymentOwnedByStudent(
  payment: any,
  studentDocId: string,
): boolean {
  if (!payment || !studentDocId) return false;
  return (
    payment.student?.documentId === studentDocId ||
    payment.enrollment?.student?.documentId === studentDocId
  );
}

/** The next charge the caller should pay: the earliest unpaid (pending or
 *  overdue) instalment by dueDate. Returns null when nothing is open. */
export function selectNextPayment(payments: any[], _todayISO?: string): any | null {
  const open = (payments ?? []).filter(
    (p) => p?.status === 'pending' || p?.status === 'overdue',
  );
  if (open.length === 0) return null;
  return open.reduce((earliest, p) =>
    String(p.dueDate) < String(earliest.dueDate) ? p : earliest,
  );
}

interface CallerStudent {
  documentId: string;
  academyId: string | null;
  name: string | null;
  email: string | null;
}

async function resolveCallerStudent(
  strapi: Core.Strapi,
  ctx: any,
): Promise<CallerStudent | null> {
  const userId = ctx?.state?.user?.id;
  if (!userId) return null;
  const rows: any[] = await strapi.documents(STUDENT_UID).findMany({
    filters: { user: { id: userId } },
    fields: ['documentId', 'name'] as any,
    populate: {
      academy: { fields: ['documentId'] },
      user: { fields: ['email'] },
    } as any,
    limit: 1,
  });
  const me = rows[0];
  if (!me?.documentId) return null;
  return {
    documentId: me.documentId,
    academyId: me.academy?.documentId ?? null,
    name: me.name ?? null,
    email: me.user?.email ?? null,
  };
}

/** Loads a Payment the caller owns, or throws a uniform not-found. */
async function loadOwnedPayment(
  strapi: Core.Strapi,
  studentDocId: string,
  paymentId: string,
): Promise<any> {
  const payment: any = await strapi.documents(UID).findOne({
    documentId: paymentId,
    populate: {
      student: { fields: ['documentId'] },
      enrollment: { populate: { student: { fields: ['documentId'] } } },
    } as any,
  });
  if (!payment || !paymentOwnedByStudent(payment, studentDocId)) {
    throw new Error('Cobrança não encontrada.');
  }
  return payment;
}

function chargeRequestFor(me: CallerStudent, payment: any): ChargeRequest {
  return {
    paymentId: payment.documentId,
    amount: Number(payment.amount),
    dueDate: String(payment.dueDate),
    description: payment.description ?? undefined,
    customer: { documentId: me.documentId, name: me.name ?? 'Aluno', email: me.email },
  };
}

export function buildPayment({ nexus, strapi }: { nexus: any; strapi: Core.Strapi }) {
  const Payment = nexus.objectType({
    name: 'Payment',
    definition(t: any) {
      t.nonNull.id('documentId');
      t.nonNull.float('amount');
      t.nonNull.string('dueDate');
      t.string('paidAt');
      t.nonNull.string('status');
      t.string('method');
      t.string('externalId');
      t.string('receiptUrl');
      t.string('description');
      t.field('enrollment', {
        type: 'Enrollment',
        resolve: async (parent: any) => {
          if (parent.enrollment !== undefined) return parent.enrollment;
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { enrollment: true },
          });
          return doc?.enrollment ?? null;
        },
      });
      t.field('student', {
        type: 'Student',
        resolve: async (parent: any) => {
          if (parent.student !== undefined) return parent.student;
          // `populate` is cast as any because Strapi's generated types
          // (`types/generated/contentTypes.d.ts`) only refresh on the
          // next `strapi develop` boot. The new `student`/`dependent`
          // relations exist in schema.json but the d.ts hasn't caught
          // up yet — runtime is fine.
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { student: true } as any,
          });
          return doc?.student ?? null;
        },
      });
      t.field('dependent', {
        type: 'Dependent',
        resolve: async (parent: any) => {
          if (parent.dependent !== undefined) return parent.dependent;
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { dependent: true } as any,
          });
          return doc?.dependent ?? null;
        },
      });
    },
  });

  const PixCheckout = nexus.objectType({
    name: 'PixCheckout',
    definition(t: any) {
      t.nonNull.id('paymentId');
      t.nonNull.string('externalId');
      t.nonNull.string('qrCode');
      t.nonNull.string('copyPaste');
      t.nonNull.string('expiresAt');
    },
  });

  const BoletoCheckout = nexus.objectType({
    name: 'BoletoCheckout',
    definition(t: any) {
      t.nonNull.id('paymentId');
      t.nonNull.string('externalId');
      t.nonNull.string('boletoUrl');
      t.nonNull.string('barCode');
      t.nonNull.string('dueDate');
    },
  });

  const CardInput = nexus.inputObjectType({
    name: 'CardInput',
    definition(t: any) {
      t.nonNull.string('number');
      t.nonNull.string('holderName');
      t.nonNull.string('expiry');
      t.nonNull.string('cvv');
    },
  });

  const PaymentInput = nexus.inputObjectType({
    name: 'PaymentInput',
    definition(t: any) {
      // Pelo menos um de `enrollment` / `student` / `dependent` precisa
      // estar presente — validado no resolver (não dá pra expressar a
      // restrição "1-de-3" puramente no schema).
      t.id('enrollment');
      t.id('student');
      t.id('dependent');
      t.string('description');
      t.nonNull.float('amount');
      t.nonNull.string('dueDate');
      t.string('method');
      t.string('status');
      t.string('paidAt');
      t.string('receiptUrl');
    },
  });

  const PaymentUpdateInput = nexus.inputObjectType({
    name: 'PaymentUpdateInput',
    definition(t: any) {
      t.string('status');
      t.string('paidAt');
      t.string('receiptUrl');
    },
  });

  const queries = nexus.extendType({
    type: 'Query',
    definition(t: any) {
      t.list.field('payments', {
        type: 'Payment',
        args: { pagination: 'PaginationInput' },
        resolve: async (_root: any, args: any, ctx: any) => {
          const academyId = await resolveUserAcademyId(strapi, ctx);
          const filters = (await isPlatformAdmin(strapi, ctx))
            ? {}
            : withPaymentScope(academyId);
          return await strapi.documents(UID).findMany({
            filters,
            start: args.pagination?.start ?? 0,
            limit: Math.min(100, args.pagination?.limit ?? 25),
            sort: { dueDate: 'desc' },
          });
        },
      });

      t.field('payment', {
        type: 'Payment',
        args: { documentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any, ctx: any) => {
          await assertCanAccessDoc(strapi, ctx, UID, args.documentId);
          return await strapi.documents(UID).findOne({ documentId: args.documentId });
        },
      });

      // Student-facing: the caller's own charges (Finanças tab).
      t.list.field('myPayments', {
        type: 'Payment',
        args: { limit: 'Int', offset: 'Int' },
        resolve: async (_root: any, args: any, ctx: any) => {
          const me = await resolveCallerStudent(strapi, ctx);
          if (!me?.documentId) return [];
          return await strapi.documents(UID).findMany({
            filters: {
              $or: [
                { student: { documentId: me.documentId } },
                { enrollment: { student: { documentId: me.documentId } } },
              ],
            } as any,
            start: args.offset ?? 0,
            limit: Math.min(100, args.limit ?? 24),
            sort: { dueDate: 'desc' },
          });
        },
      });

      t.field('myNextPayment', {
        type: 'Payment',
        resolve: async (_root: any, _args: any, ctx: any) => {
          const me = await resolveCallerStudent(strapi, ctx);
          if (!me?.documentId) return null;
          const open: any[] = await strapi.documents(UID).findMany({
            filters: {
              status: { $in: ['pending', 'overdue'] },
              $or: [
                { student: { documentId: me.documentId } },
                { enrollment: { student: { documentId: me.documentId } } },
              ],
            } as any,
            sort: { dueDate: 'asc' },
            limit: 50,
          });
          return selectNextPayment(open);
        },
      });
    },
  });

  const mutations = nexus.extendType({
    type: 'Mutation',
    definition(t: any) {
      t.field('createPayment', {
        type: 'Payment',
        args: { data: nexus.nonNull(nexus.arg({ type: 'PaymentInput' })) },
        resolve: async (_root: any, args: any, ctx: any) => {
          await requireRole(strapi, ctx, ['academy_admin']);
          await requireActiveSubscription(strapi, ctx);
          const academyId = await requireAcademyId(strapi, ctx);

          const { enrollment, student, dependent } = args.data;
          if (!enrollment && !student && !dependent) {
            throw new Error(
              'Cobrança precisa estar vinculada a uma matrícula, aluno ou dependente.',
            );
          }

          // Cada ref informada precisa ser da mesma academia do caller.
          // Cobranças avulsas (sem matrícula) podem apontar direto pro
          // aluno/dependente, então validamos cada um que vier.
          if (enrollment) {
            const enrollmentAcademy = await resolveDocAcademyId(
              strapi,
              'api::enrollment.enrollment',
              enrollment,
            );
            if (enrollmentAcademy !== academyId) {
              throw new Error('Matrícula de outra academia.');
            }
          }
          if (student) {
            const studentAcademy = await resolveDocAcademyId(
              strapi,
              'api::student.student',
              student,
            );
            if (studentAcademy !== academyId) {
              throw new Error('Aluno de outra academia.');
            }
          }
          if (dependent) {
            const dependentAcademy = await resolveDocAcademyId(
              strapi,
              'api::dependent.dependent',
              dependent,
            );
            if (dependentAcademy !== academyId) {
              throw new Error('Dependente de outra academia.');
            }
          }

          return await strapi.documents(UID).create({
            data: {
              ...args.data,
              status: args.data.status ?? 'pending',
              method: args.data.method ?? 'pix',
            },
          });
        },
      });

      t.field('updatePayment', {
        type: 'Payment',
        args: {
          documentId: nexus.nonNull(nexus.idArg()),
          data: nexus.nonNull(nexus.arg({ type: 'PaymentUpdateInput' })),
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

      // --- Student checkout flows (provider-agnostic gateway) ---------

      t.field('payChargePix', {
        type: 'PixCheckout',
        args: { paymentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any, ctx: any) => {
          const me = await resolveCallerStudent(strapi, ctx);
          if (!me?.documentId) throw new Error('Aluno não encontrado.');
          const payment = await loadOwnedPayment(strapi, me.documentId, args.paymentId);
          if (payment.status === 'paid') throw new Error('Esta cobrança já foi paga.');

          const gateway = resolveGateway(me.academyId);
          const checkout = await gateway.createPixCharge(chargeRequestFor(me, payment));
          await strapi.documents(UID).update({
            documentId: payment.documentId,
            data: { method: 'pix', externalId: checkout.externalId },
          });
          return { paymentId: payment.documentId, ...checkout };
        },
      });

      t.field('payChargeBoleto', {
        type: 'BoletoCheckout',
        args: { paymentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any, ctx: any) => {
          const me = await resolveCallerStudent(strapi, ctx);
          if (!me?.documentId) throw new Error('Aluno não encontrado.');
          const payment = await loadOwnedPayment(strapi, me.documentId, args.paymentId);
          if (payment.status === 'paid') throw new Error('Esta cobrança já foi paga.');

          const gateway = resolveGateway(me.academyId);
          const checkout = await gateway.createBoletoCharge(chargeRequestFor(me, payment));
          await strapi.documents(UID).update({
            documentId: payment.documentId,
            data: { method: 'boleto', externalId: checkout.externalId },
          });
          return { paymentId: payment.documentId, ...checkout };
        },
      });

      t.field('payChargeCard', {
        type: 'Payment',
        args: {
          paymentId: nexus.nonNull(nexus.idArg()),
          card: nexus.nonNull(nexus.arg({ type: 'CardInput' })),
        },
        resolve: async (_root: any, args: any, ctx: any) => {
          const me = await resolveCallerStudent(strapi, ctx);
          if (!me?.documentId) throw new Error('Aluno não encontrado.');
          const payment = await loadOwnedPayment(strapi, me.documentId, args.paymentId);
          if (payment.status === 'paid') throw new Error('Esta cobrança já foi paga.');

          const gateway = resolveGateway(me.academyId);
          const result = await gateway.chargeCard(chargeRequestFor(me, payment), args.card);
          if (result.status !== 'approved') {
            throw new Error(result.declineReason ?? 'Cartão recusado.');
          }
          return await strapi.documents(UID).update({
            documentId: payment.documentId,
            data: {
              status: 'paid',
              method: 'credit_card',
              externalId: result.externalId,
              paidAt: new Date().toISOString(),
            },
          });
        },
      });

      // Dev/mock affordance: stand in for the gateway webhook so the PIX /
      // boleto cycle can be completed without a real provider. Refuses to
      // run against a real gateway — those confirm via webhook only.
      t.field('confirmMockCharge', {
        type: 'Payment',
        args: { paymentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any, ctx: any) => {
          const me = await resolveCallerStudent(strapi, ctx);
          if (!me?.documentId) throw new Error('Aluno não encontrado.');
          const gateway = resolveGateway(me.academyId);
          if (!gateway.isMock) {
            throw new Error('Confirmação manual só está disponível no modo mock.');
          }
          const payment = await loadOwnedPayment(strapi, me.documentId, args.paymentId);
          if (payment.status === 'paid') return payment;
          return await strapi.documents(UID).update({
            documentId: payment.documentId,
            data: { status: 'paid', paidAt: new Date().toISOString() },
          });
        },
      });
    },
  });

  return {
    types: [
      Payment,
      PixCheckout,
      BoletoCheckout,
      CardInput,
      PaymentInput,
      PaymentUpdateInput,
      queries,
      mutations,
    ],
    resolversConfig: {
      'Query.payments': { auth: true },
      'Query.payment': { auth: true },
      'Query.myPayments': { auth: true },
      'Query.myNextPayment': { auth: true },
      'Mutation.createPayment': { auth: true },
      'Mutation.updatePayment': { auth: true },
      'Mutation.payChargePix': { auth: true },
      'Mutation.payChargeBoleto': { auth: true },
      'Mutation.payChargeCard': { auth: true },
      'Mutation.confirmMockCharge': { auth: true },
    },
  };
}
