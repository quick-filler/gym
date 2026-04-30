/**
 * Unit tests for the Asaas client factory.
 *
 * We mock the global fetch so we can assert the request shape (URL, headers,
 * body) without actually calling Asaas. The point is to verify per-tenant
 * isolation: a client built with academy A's key MUST send academy A's key.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAsaasClient } from './asaas';

const okResponse = (body: unknown) =>
  ({
    ok: true,
    json: async () => body,
    text: async () => JSON.stringify(body),
  }) as unknown as Response;

const errResponse = (status: number, text: string) =>
  ({
    ok: false,
    status,
    json: async () => ({}),
    text: async () => text,
  }) as unknown as Response;

describe('createAsaasClient', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('throws when apiKey is missing', () => {
    expect(() => createAsaasClient({ apiKey: '' })).toThrow(/apiKey/);
  });

  it('uses the sandbox URL by default', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ id: 'cus_1' }));
    const client = createAsaasClient({ apiKey: 'tenant-A-key' });
    await client.createCustomer({ name: 'X', email: 'x@x.com' });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://sandbox.asaas.com/api/v3/customers',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('uses the production URL when environment="production"', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ id: 'cus_1' }));
    const client = createAsaasClient({
      apiKey: 'tenant-A-key',
      environment: 'production',
    });
    await client.createCustomer({ name: 'X', email: 'x@x.com' });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.asaas.com/v3/customers',
      expect.any(Object),
    );
  });

  it('respects an explicit baseUrl override', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ id: 'cus_1' }));
    const client = createAsaasClient({
      apiKey: 'k',
      baseUrl: 'https://custom.asaas.test/api/v3',
    });
    await client.createCustomer({ name: 'X', email: 'x@x.com' });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://custom.asaas.test/api/v3/customers',
      expect.any(Object),
    );
  });

  it('sends the per-tenant api key in the access_token header', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ id: 'cus_A' }));
    const a = createAsaasClient({ apiKey: 'tenant-A-key' });
    await a.createCustomer({ name: 'X', email: 'x@x.com' });

    const callA = fetchMock.mock.calls[0][1];
    expect(callA.headers).toMatchObject({ access_token: 'tenant-A-key' });

    fetchMock.mockResolvedValueOnce(okResponse({ id: 'cus_B' }));
    const b = createAsaasClient({ apiKey: 'tenant-B-key' });
    await b.createCustomer({ name: 'Y', email: 'y@y.com' });

    const callB = fetchMock.mock.calls[1][1];
    expect(callB.headers).toMatchObject({ access_token: 'tenant-B-key' });
  });

  it('throws a descriptive error when the gateway returns non-2xx', async () => {
    fetchMock.mockResolvedValueOnce(errResponse(400, '{"error":"bad"}'));
    const client = createAsaasClient({ apiKey: 'k' });
    await expect(
      client.createCustomer({ name: 'X', email: 'x@x.com' }),
    ).rejects.toThrow(/Asaas POST \/customers falhou: 400/);
  });

  it('createCustomerAndSubscription sends both calls with the same key', async () => {
    fetchMock
      .mockResolvedValueOnce(okResponse({ id: 'cus_1' }))
      .mockResolvedValueOnce(okResponse({ id: 'sub_1' }));
    const client = createAsaasClient({ apiKey: 'tenant-key' });
    const out = await client.createCustomerAndSubscription({
      name: 'X',
      email: 'x@x.com',
      value: 99,
      billingType: 'PIX',
      cycle: 'MONTHLY',
      nextDueDate: '2026-05-01',
    });
    expect(out).toEqual({ customerId: 'cus_1', subscriptionId: 'sub_1' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][1].headers.access_token).toBe('tenant-key');
    expect(fetchMock.mock.calls[1][1].headers.access_token).toBe('tenant-key');
  });

  it('cancelSubscription DELETEs to the right path', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ deleted: true }));
    const client = createAsaasClient({ apiKey: 'k' });
    await client.cancelSubscription('sub_42');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://sandbox.asaas.com/api/v3/subscriptions/sub_42',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});
