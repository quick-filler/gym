/**
 * payment controller
 *
 * Two webhook variants:
 *   webhook            — legacy single-tenant. Validates against
 *                        ASAAS_WEBHOOK_TOKEN env var. Kept for back-compat.
 *   webhookForAcademy  — multi-tenant. Slug in the URL identifies the
 *                        academy; the request token must match THAT
 *                        academy's stored asaasWebhookToken (with env
 *                        fallback for academies without their own token).
 */

import { factories } from '@strapi/strapi';
import asaasWebhook from '../../../services/asaas-webhook';

export default factories.createCoreController('api::payment.payment', ({ strapi }) => ({
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

  async webhookForAcademy(ctx) {
    const slug = ctx.params.slug as string;
    const receivedToken = ctx.request.headers['asaas-access-token'] as
      | string
      | undefined;

    // Look up academy + its webhook token. Cross-tenant safety: a webhook
    // for academy A cannot be processed with academy B's token.
    const academies: any[] = await strapi
      .documents('api::academy.academy')
      .findMany({
        filters: { slug, isActive: true },
        fields: ['documentId', 'asaasWebhookToken'] as any,
        limit: 1,
      });
    const academy = academies[0];
    if (!academy) {
      strapi.log.warn(`[asaas-webhook] unknown academy slug=${slug}`);
      return ctx.notFound('Academy not found');
    }

    // Token validation: prefer the academy's own token; fall back to env
    // for academies that haven't onboarded their own Asaas account yet.
    const expectedToken =
      academy.asaasWebhookToken || process.env.ASAAS_WEBHOOK_TOKEN;
    if (expectedToken && receivedToken !== expectedToken) {
      strapi.log.warn(
        `[asaas-webhook] invalid token for academy=${slug}, rejecting`,
      );
      return ctx.unauthorized('Invalid webhook token');
    }

    const payload = ctx.request.body as any;
    if (!payload?.event || !payload?.payment) {
      return ctx.badRequest('Invalid payload');
    }

    try {
      await asaasWebhook.handle(payload, { academyDocumentId: academy.documentId });
      return { received: true };
    } catch (err: any) {
      strapi.log.error(
        `[asaas-webhook] handler failed (academy=${slug}): ${err.message}`,
      );
      return ctx.internalServerError('Webhook processing failed');
    }
  },
}));
