/**
 * payment controller
 */

import { factories } from '@strapi/strapi';
import asaasWebhook from '../../../services/asaas-webhook';

export default factories.createCoreController('api::payment.payment', ({ strapi }) => ({
  /**
   * Asaas webhook handler.
   * POST /payments/webhook
   *
   * Validates the webhook signature, then dispatches by event type.
   * Asaas events: PAYMENT_CREATED, PAYMENT_RECEIVED, PAYMENT_OVERDUE, PAYMENT_DELETED, etc.
   */
  async webhook(ctx) {
    const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
    const receivedToken = ctx.request.headers['asaas-access-token'];

    if (expectedToken && receivedToken !== expectedToken) {
      strapi.log.warn('[asaas-webhook] invalid token, rejecting');
      return ctx.unauthorized('Invalid webhook token');
    }

    const payload = ctx.request.body as any;
    if (!payload?.event || !payload?.payment) {
      return ctx.badRequest('Invalid payload');
    }

    try {
      await asaasWebhook.handle(payload);
      return { received: true };
    } catch (err: any) {
      strapi.log.error(`[asaas-webhook] handler failed: ${err.message}`);
      return ctx.internalServerError('Webhook processing failed');
    }
  },
}));
