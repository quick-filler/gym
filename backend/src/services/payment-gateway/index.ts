/**
 * Payment gateway resolver.
 *
 * Returns the active `PaymentGateway` implementation based on the
 * `PAYMENT_PROVIDER` env var. Defaults to the mock gateway — the product
 * hasn't picked a real provider yet (Asaas / Pagar.me / Stripe), so every
 * environment runs the mock until one is wired and the env flips.
 *
 * To add a real provider later:
 *   1. create `asaas-gateway.ts` implementing `PaymentGateway`
 *   2. add a `case 'asaas'` below
 *   3. set PAYMENT_PROVIDER=asaas in that environment
 * No resolver or app changes required.
 *
 * `academyId` is accepted now (unused by the mock) because real providers
 * are multi-tenant — each academy carries its own credentials, exactly
 * like asaasForAcademy() already does for subscriptions.
 */

import mockGateway from './mock-gateway';
import type { PaymentGateway } from './types';

export * from './types';

export function resolveGateway(_academyId?: string | null): PaymentGateway {
  const provider = (process.env.PAYMENT_PROVIDER ?? 'mock').toLowerCase();
  switch (provider) {
    case 'mock':
      return mockGateway;
    // case 'asaas':   return asaasGatewayFor(_academyId);
    // case 'pagarme': return pagarmeGatewayFor(_academyId);
    // case 'stripe':  return stripeGatewayFor(_academyId);
    default:
      strapi?.log?.warn?.(
        `[payment-gateway] unknown PAYMENT_PROVIDER="${provider}", falling back to mock`,
      );
      return mockGateway;
  }
}
