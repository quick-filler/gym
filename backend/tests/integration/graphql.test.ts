/**
 * Integration tests — hit a running Strapi at GRAPHQL_TEST_ENDPOINT
 * (default http://localhost:7777/graphql) and assert real responses.
 *
 * Prereq: `npm run develop` in another terminal with `SEED_DEMO=true`
 * on the first boot, so the Gym Demo academy exists.
 *
 * If the endpoint is unreachable, every test suite in this file is
 * skipped with a console hint instead of failing. Keeps CI green on
 * machines without a local backend while giving real signal when run
 * against a live instance.
 */

import { beforeAll, describe, expect, it } from 'vitest';

const ENDPOINT =
  process.env.GRAPHQL_TEST_ENDPOINT ?? 'http://localhost:7777/graphql';

let live = false;

interface GqlResp<T = unknown> {
  data?: T;
  errors?: Array<{ message: string }>;
}

async function gql<T = unknown>(
  query: string,
  variables: Record<string, unknown> = {},
  token?: string,
): Promise<GqlResp<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });
  return (await res.json()) as GqlResp<T>;
}

beforeAll(async () => {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ __typename }' }),
      signal: AbortSignal.timeout(2000),
    });
    live = res.ok;
  } catch {
    live = false;
  }
  if (!live) {
    console.warn(
      `[integration] Strapi not reachable at ${ENDPOINT}. Skipping suite.`,
    );
  }
});

describe('academyBySlug (public query)', () => {
  it('returns branding for gym-demo without auth', async ({ skip }) => {
    if (!live) return skip();
    const r = await gql<{ academyBySlug: unknown }>(
      `query Q($slug: String!) { academyBySlug(slug: $slug) { documentId name slug primaryColor plan } }`,
      { slug: 'gym-demo' },
    );
    expect(r.errors).toBeUndefined();
    expect(r.data?.academyBySlug).toMatchObject({
      slug: 'gym-demo',
      name: 'Gym Demo',
    });
  });

  it('returns null for an unknown slug', async ({ skip }) => {
    if (!live) return skip();
    const r = await gql<{ academyBySlug: unknown }>(
      `query Q($slug: String!) { academyBySlug(slug: $slug) { documentId } }`,
      { slug: 'does-not-exist' },
    );
    expect(r.errors).toBeUndefined();
    expect(r.data?.academyBySlug).toBeNull();
  });
});

describe('auth-required queries refuse anonymous callers', () => {
  const cases: Array<[string, string]> = [
    ['me', '{ me { documentId } }'],
    ['adminDashboard', '{ adminDashboard { metrics { id } } }'],
    ['dreOverview', '{ dreOverview { monthLabel } }'],
    ['financeOverview', '{ financeOverview { kpis { id } } }'],
    ['guardians', '{ guardians { guardian { id } } }'],
    ['students', '{ students { documentId } }'],
  ];

  for (const [name, query] of cases) {
    it(`${name} without a token → Forbidden`, async (ctx) => {
      if (!live) return ctx.skip();
      const r = await gql(query);
      expect(r.errors).toBeDefined();
      expect(r.errors![0]!.message).toMatch(/forbidden|unauthori[sz]ed/i);
    });
  }
});

describe('schema introspection', () => {
  it('exposes every query the frontend relies on', async ({ skip }) => {
    if (!live) return skip();
    const r = await gql<{
      __schema: { queryType: { fields: Array<{ name: string }> } };
    }>(`{ __schema { queryType { fields { name } } } }`);
    const names = new Set(
      (r.data?.__schema.queryType.fields ?? []).map((f) => f.name),
    );
    const required = [
      'academyBySlug',
      'me',
      'adminDashboard',
      'financeOverview',
      'dreOverview',
      'scheduleWeek',
      'guardians',
      'workoutPlans',
      'students',
      'plans',
      'expenses',
      'dependents',
      'myDependents',
    ];
    for (const name of required) {
      expect(names.has(name), `missing Query.${name}`).toBe(true);
    }
  });

  it('exposes the Expense and Dependent types', async ({ skip }) => {
    if (!live) return skip();
    const r = await gql<{
      __schema: { types: Array<{ name: string }> };
    }>(`{ __schema { types { name } } }`);
    const names = new Set(
      (r.data?.__schema.types ?? []).map((t) => t.name),
    );
    expect(names.has('Expense')).toBe(true);
    expect(names.has('Dependent')).toBe(true);
    expect(names.has('DREOverview')).toBe(true);
    expect(names.has('AdminDashboard')).toBe(true);
    expect(names.has('GuardianFamily')).toBe(true);
  });
});
