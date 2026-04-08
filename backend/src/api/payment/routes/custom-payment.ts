/**
 * Custom payment routes — Asaas webhook is public (signature-validated).
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
  ],
};
