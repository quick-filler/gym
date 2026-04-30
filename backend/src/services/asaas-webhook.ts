/**
 * Asaas webhook event handler.
 *
 * Maps incoming Asaas events to Payment record changes. Asaas pushes the
 * full payment object alongside the event name, so we map by externalId
 * (the Asaas payment id we already stored when the charge was created).
 *
 * Multi-tenant: when called from the slugged route, the caller passes
 * `options.academyDocumentId` and we cross-check that the resolved
 * enrollment actually belongs to that academy. This blocks a webhook
 * accepted with academy A's token from being applied to academy B's data
 * (e.g. if a token leaked or was reused incorrectly).
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

interface HandleOptions {
  /** When set, the handler refuses to apply the event to enrollments
   *  that don't belong to this academy. */
  academyDocumentId?: string;
}

async function handle(
  payload: AsaasWebhookPayload,
  options: HandleOptions = {},
): Promise<void> {
  const { event, payment } = payload;

  // Find the linked enrollment via the Asaas subscription ID, populating
  // the academy chain for the cross-tenant safety check.
  const enrollments: any[] = payment.subscription
    ? await strapi.documents('api::enrollment.enrollment').findMany({
        filters: { asaasSubId: payment.subscription },
        populate: {
          student: { populate: { academy: { fields: ['documentId'] } } },
          dependent: { populate: { academy: { fields: ['documentId'] } } },
        },
        limit: 1,
      })
    : [];

  const enrollment = enrollments[0];

  // Tenant cross-check — refuse mismatched events when invoked from a
  // slugged webhook URL.
  if (options.academyDocumentId && enrollment) {
    const enrAcademy =
      enrollment.student?.academy?.documentId ??
      enrollment.dependent?.academy?.documentId;
    if (enrAcademy && enrAcademy !== options.academyDocumentId) {
      strapi.log.warn(
        `[asaas-webhook] dropping event ${payment.id}: enrollment academy=${enrAcademy} but webhook tenant=${options.academyDocumentId}`,
      );
      return;
    }
  }

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
