/**
 * Payment lifecycles (Fase 7b) — notify on confirmation.
 *
 * When a payment is marked paid (status set to 'paid' in an update), notify the
 * student (or the dependent's guardian) "Pagamento confirmado" and the academy
 * admins "Pagamento recebido". Best-effort — notification failures never block
 * the write (createInApp swallows errors).
 */

import { createInApp, notifyAcademyAdmins } from '../../../../services/notify';

const UID = 'api::payment.payment';

function brl(value: unknown): string {
  return `R$ ${Number(value ?? 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default {
  async afterUpdate(event: any) {
    // Only fire when this update set the status to 'paid'.
    if (event.params?.data?.status !== 'paid') return;
    const docId = event.result?.documentId;
    if (!docId) return;

    const p: any = await strapi.documents(UID).findOne({
      documentId: docId,
      populate: {
        student: { populate: { user: true, academy: true } },
        dependent: {
          populate: { guardian: { populate: { user: true } }, academy: true },
        },
        enrollment: {
          populate: {
            student: { populate: { user: true, academy: true } },
            dependent: {
              populate: { guardian: { populate: { user: true } }, academy: true },
            },
          },
        },
      },
    });
    if (!p) return;

    const student = p.student ?? p.enrollment?.student;
    const dependent = p.dependent ?? p.enrollment?.dependent;
    const userId = student?.user?.id ?? dependent?.guardian?.user?.id;
    const academyId = student?.academy?.id ?? dependent?.academy?.id ?? null;
    const amount = brl(p.amount);
    const desc = p.description || 'Mensalidade';

    if (userId) {
      await createInApp(strapi, {
        userId,
        academyId,
        kind: 'payment_paid',
        title: 'Pagamento confirmado',
        body: `${desc} · ${amount}`,
        data: { route: '/payment', paymentId: docId },
      });
    }
    const name = student?.name ?? dependent?.name ?? 'Aluno';
    await notifyAcademyAdmins(strapi, academyId, {
      kind: 'admin_payment',
      title: 'Pagamento recebido',
      body: `${name} · ${amount}`,
      data: { route: '/admin/finance', paymentId: docId },
    });
  },
};
