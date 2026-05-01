/**
 * Asaas API client.
 *
 * Multi-tenant: each Academy carries its own credentials
 * (`asaasApiKey`, `asaasEnvironment`). Use `createAsaasClient(config)` to
 * build a per-tenant client; the default export uses env-level fallbacks
 * (ASAAS_API_KEY / ASAAS_BASE_URL) for back-compat with single-tenant
 * setups and tests.
 *
 * Docs: https://docs.asaas.com/reference
 */

const SANDBOX_URL = 'https://sandbox.asaas.com/api/v3';
const PRODUCTION_URL = 'https://api.asaas.com/v3';

type AsaasBillingType = 'PIX' | 'BOLETO' | 'CREDIT_CARD';
type AsaasCycle =
  | 'WEEKLY'
  | 'BIWEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'SEMIANNUALLY'
  | 'YEARLY';

export interface AsaasConfig {
  apiKey: string;
  baseUrl?: string;
  environment?: 'sandbox' | 'production';
}

interface CreateCustomerInput {
  name: string;
  email: string;
  phone?: string;
}

interface CreateSubscriptionInput {
  customer: string;
  billingType: AsaasBillingType;
  value: number;
  cycle: AsaasCycle;
  nextDueDate: string;
  description?: string;
}

export interface AsaasClient {
  createCustomer(input: CreateCustomerInput): Promise<{ id: string }>;
  createSubscription(input: CreateSubscriptionInput): Promise<{ id: string }>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  getPayment(paymentId: string): Promise<any>;
  createCustomerAndSubscription(args: {
    name: string;
    email: string;
    phone?: string;
    value: number;
    billingType: AsaasBillingType;
    cycle: AsaasCycle;
    nextDueDate: string;
    description?: string;
  }): Promise<{ customerId: string; subscriptionId: string }>;
}

function resolveBaseUrl(config: AsaasConfig): string {
  if (config.baseUrl) return config.baseUrl;
  return config.environment === 'production' ? PRODUCTION_URL : SANDBOX_URL;
}

/**
 * Builds an Asaas client bound to a specific tenant's credentials.
 */
export function createAsaasClient(config: AsaasConfig): AsaasClient {
  if (!config.apiKey) {
    throw new Error('Asaas: apiKey é obrigatório.');
  }
  const baseUrl = resolveBaseUrl(config);

  async function request<T = any>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        access_token: config.apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Asaas ${method} ${path} falhou: ${res.status} ${text}`);
    }
    return res.json() as Promise<T>;
  }

  const createCustomer = (input: CreateCustomerInput) =>
    request<{ id: string }>('POST', '/customers', input);

  const createSubscription = (input: CreateSubscriptionInput) =>
    request<{ id: string }>('POST', '/subscriptions', input);

  const cancelSubscription = async (subscriptionId: string) => {
    await request('DELETE', `/subscriptions/${subscriptionId}`);
  };

  const getPayment = (paymentId: string) =>
    request<any>('GET', `/payments/${paymentId}`);

  const createCustomerAndSubscription: AsaasClient['createCustomerAndSubscription'] =
    async (args) => {
      const customer = await createCustomer({
        name: args.name,
        email: args.email,
        phone: args.phone,
      });
      const subscription = await createSubscription({
        customer: customer.id,
        billingType: args.billingType,
        value: args.value,
        cycle: args.cycle,
        nextDueDate: args.nextDueDate,
        description: args.description,
      });
      return { customerId: customer.id, subscriptionId: subscription.id };
    };

  return {
    createCustomer,
    createSubscription,
    cancelSubscription,
    getPayment,
    createCustomerAndSubscription,
  };
}

/**
 * Resolves the Asaas client for a given Academy. Looks up the academy by
 * documentId, returns a client bound to its credentials. Falls back to the
 * env-level config (ASAAS_API_KEY) when the academy has no key set —
 * useful for fresh installs and the demo seed.
 */
export async function asaasForAcademy(
  academyId: string | null | undefined,
): Promise<AsaasClient> {
  if (academyId) {
    const academy: any = await strapi
      .documents('api::academy.academy')
      .findOne({
        documentId: academyId,
        fields: ['asaasApiKey', 'asaasEnvironment'] as any,
      });
    if (academy?.asaasApiKey) {
      return createAsaasClient({
        apiKey: academy.asaasApiKey,
        environment: academy.asaasEnvironment ?? 'sandbox',
      });
    }
  }

  // Env fallback — single-tenant / dev mode.
  const envKey = process.env.ASAAS_API_KEY;
  if (!envKey) {
    throw new Error(
      'Asaas não configurado: defina asaasApiKey na academia ou ASAAS_API_KEY no .env.',
    );
  }
  return createAsaasClient({
    apiKey: envKey,
    baseUrl: process.env.ASAAS_BASE_URL,
  });
}

/**
 * Default export — a singleton client bound to env credentials. Kept for
 * back-compat; prefer `asaasForAcademy(documentId)` in new code so each
 * tenant uses its own gateway account.
 */
const envClient: AsaasClient = (() => {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) {
    // Defer the error until the client is actually invoked, so env-less
    // boots (tests, fresh clones) don't crash on import.
    const fail = (): never => {
      throw new Error('ASAAS_API_KEY is not configured');
    };
    return {
      createCustomer: fail,
      createSubscription: fail,
      cancelSubscription: fail,
      getPayment: fail,
      createCustomerAndSubscription: fail,
    } as unknown as AsaasClient;
  }
  return createAsaasClient({
    apiKey,
    baseUrl: process.env.ASAAS_BASE_URL,
  });
})();

export default envClient;
