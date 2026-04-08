/**
 * Asaas webhook event handler.
 *
 * Maps incoming Asaas events to Payment record changes. Asaas pushes the
 * full payment object alongside the event name, so we map by externalId
 * (the Asaas payment id we already stored when the charge was created).
 *
 * Event reference: https://docs.asaas.com/docs/webhooks
 */

interface AsaasWebhookPayload {
  event: string;
  payment: {
    id: string;
    subscription?: string;
    customer: string;
    value: number;
    netValue?: number;
    dueDate: string;
    paymentDate?: string;
    invoiceUrl?: string;
    bankSlipUrl?: string;
    transactionReceiptUrl?: string;
    billingType: string;
    status: string;
  };
}

async function handle(payload: AsaasWebhookPayload): Promise<void> {
  const { event, payment } = payload;

  // Find the linked enrollment via the Asaas subscription ID.
  const enrollments: any[] = payment.subscription
    ? await strapi.documents('api::enrollment.enrollment').findMany({
        filters: { asaasSubId: payment.subscription },
        limit: 1,
      })
    : [];

  const enrollment = enrollments[0];

  // Find or create the local Payment record (idempotent on externalId).
  const existing: any[] = await strapi.documents('api::payment.payment').findMany({
    filters: { externalId: payment.id },
    limit: 1,
  });

  const data = {
    enrollment: enrollment ? { documentId: enrollment.documentId } : undefined,
    amount: payment.value,
    dueDate: payment.dueDate,
    paidAt: payment.paymentDate ? new Date(payment.paymentDate).toISOString() : null,
    status: mapStatus(event, payment.status),
    method: mapBillingType(payment.billingType),
    externalId: payment.id,
    receiptUrl: payment.transactionReceiptUrl ?? payment.bankSlipUrl ?? payment.invoiceUrl,
  };

  if (existing.length > 0) {
    await strapi.documents('api::payment.payment').update({
      documentId: existing[0].documentId,
      data,
    });
    strapi.log.info(`[asaas-webhook] payment ${payment.id} updated (${event})`);
  } else {
    await strapi.documents('api::payment.payment').create({ data });
    strapi.log.info(`[asaas-webhook] payment ${payment.id} created (${event})`);
  }
}

function mapStatus(event: string, asaasStatus: string): 'pending' | 'paid' | 'overdue' | 'cancelled' {
  if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') return 'paid';
  if (event === 'PAYMENT_OVERDUE') return 'overdue';
  if (event === 'PAYMENT_DELETED' || event === 'PAYMENT_REFUNDED') return 'cancelled';

  switch (asaasStatus) {
    case 'RECEIVED':
    case 'CONFIRMED':
    case 'RECEIVED_IN_CASH':
      return 'paid';
    case 'OVERDUE':
      return 'overdue';
    case 'REFUNDED':
    case 'DELETED':
      return 'cancelled';
    default:
      return 'pending';
  }
}

function mapBillingType(billingType: string): 'pix' | 'credit_card' | 'boleto' {
  switch (billingType) {
    case 'PIX':
      return 'pix';
    case 'CREDIT_CARD':
      return 'credit_card';
    case 'BOLETO':
    default:
      return 'boleto';
  }
}

export default { handle };
