/**
 * Asaas API client.
 *
 * Asaas is the payment gateway used by the platform — supports PIX, boleto,
 * and credit card. Sandbox and production share the same shape; the base URL
 * and token differ via env vars.
 *
 * Docs: https://docs.asaas.com/reference
 */

const BASE_URL = process.env.ASAAS_BASE_URL || 'https://sandbox.asaas.com/api/v3';
const API_KEY = process.env.ASAAS_API_KEY || '';

type AsaasBillingType = 'PIX' | 'BOLETO' | 'CREDIT_CARD';
type AsaasCycle = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY';

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

async function request<T = any>(method: string, path: string, body?: unknown): Promise<T> {
  if (!API_KEY) {
    throw new Error('ASAAS_API_KEY is not configured');
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      access_token: API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Asaas ${method} ${path} failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

async function createCustomer(input: CreateCustomerInput): Promise<{ id: string }> {
  return request('POST', '/customers', input);
}

async function createSubscription(input: CreateSubscriptionInput): Promise<{ id: string }> {
  return request('POST', '/subscriptions', input);
}

async function cancelSubscription(subscriptionId: string): Promise<void> {
  await request('DELETE', `/subscriptions/${subscriptionId}`);
}

async function getPayment(paymentId: string): Promise<any> {
  return request('GET', `/payments/${paymentId}`);
}

/**
 * High-level helper used by the enrollment lifecycle hook.
 * Creates the customer and subscription in one call so the lifecycle
 * code stays focused on the business meaning.
 */
async function createCustomerAndSubscription(args: {
  name: string;
  email: string;
  phone?: string;
  value: number;
  billingType: AsaasBillingType;
  cycle: AsaasCycle;
  nextDueDate: string;
  description?: string;
}): Promise<{ customerId: string; subscriptionId: string }> {
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
}

export default {
  createCustomer,
  createSubscription,
  cancelSubscription,
  getPayment,
  createCustomerAndSubscription,
};
