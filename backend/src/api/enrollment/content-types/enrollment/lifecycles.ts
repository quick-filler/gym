/**
 * Enrollment lifecycle hooks.
 *
 * On create → create an Asaas customer + subscription, persist the IDs.
 * On cancelled update → cancel the Asaas subscription.
 *
 * External calls are fired with setImmediate so the HTTP request that
 * triggered the lifecycle is never blocked on the payment gateway.
 */

import asaas from '../../../../services/asaas';

export default {
  async afterCreate(event: any) {
    const { result } = event;

    setImmediate(async () => {
      try {
        // Fetch full enrollment with relations needed for Asaas call.
        const enrollment: any = await strapi.documents('api::enrollment.enrollment').findOne({
          documentId: result.documentId,
          populate: {
            student: { fields: ['name', 'email', 'phone'] },
            plan: { fields: ['name', 'price', 'billingCycle'] },
          },
        });

        if (!enrollment?.student || !enrollment?.plan) {
          strapi.log.warn(`[enrollment] skipping Asaas sync — missing relations for ${result.documentId}`);
          return;
        }

        const { customerId, subscriptionId } = await asaas.createCustomerAndSubscription({
          name: enrollment.student.name,
          email: enrollment.student.email,
          phone: enrollment.student.phone,
          value: Number(enrollment.plan.price),
          billingType: mapBillingType(enrollment.paymentMethod),
          cycle: mapCycle(enrollment.plan.billingCycle),
          nextDueDate: enrollment.startDate,
          description: `${enrollment.plan.name} — ${enrollment.student.name}`,
        });

        await strapi.documents('api::enrollment.enrollment').update({
          documentId: result.documentId,
          data: {
            asaasCustomerId: customerId,
            asaasSubId: subscriptionId,
          },
        });

        strapi.log.info(`[enrollment] synced with Asaas: sub=${subscriptionId}`);
      } catch (err: any) {
        strapi.log.error(`[enrollment] Asaas sync failed: ${err.message}`);
      }
    });
  },

  async afterUpdate(event: any) {
    const { result } = event;
    if (result.status !== 'cancelled' || !result.asaasSubId) return;

    setImmediate(async () => {
      try {
        await asaas.cancelSubscription(result.asaasSubId);
        strapi.log.info(`[enrollment] Asaas subscription cancelled: ${result.asaasSubId}`);
      } catch (err: any) {
        strapi.log.error(`[enrollment] failed to cancel Asaas sub: ${err.message}`);
      }
    });
  },
};

type AsaasBillingType = 'PIX' | 'BOLETO' | 'CREDIT_CARD';
type AsaasCycle = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

function mapBillingType(method: string): AsaasBillingType {
  const m: Record<string, AsaasBillingType> = {
    pix: 'PIX',
    boleto: 'BOLETO',
    credit_card: 'CREDIT_CARD',
  };
  return m[method] ?? 'PIX';
}

function mapCycle(cycle: string): AsaasCycle {
  const m: Record<string, AsaasCycle> = {
    monthly: 'MONTHLY',
    quarterly: 'QUARTERLY',
    annual: 'YEARLY',
  };
  return m[cycle] ?? 'MONTHLY';
}
