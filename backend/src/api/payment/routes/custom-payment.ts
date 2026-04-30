/**
 * Custom payment routes — Asaas webhook is public (signature-validated).
 *
 * Two surfaces:
 *   POST /payments/webhook            → legacy, env-token only
 *   POST /payments/webhook/:slug      → multi-tenant, validates the token
 *                                        against the academy's stored
 *                                        asaasWebhookToken (preferred for
 *                                        SaaS deployments)
 *
 * Asaas configures one webhook URL per account, so each academy registers
 * its slugged URL in their own Asaas dashboard with their own token.
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/payments/webhook',
      handler: 'payment.webhook',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/payments/webhook/:slug',
      handler: 'payment.webhookForAcademy',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
