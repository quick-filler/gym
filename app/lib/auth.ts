import { setAuthToken, clearAuthToken } from './apollo';
import { GRAPHQL_ENDPOINT, USE_MOCKS } from './config';

const REST_BASE = GRAPHQL_ENDPOINT.replace(/\/graphql$/, '');

export async function login(email: string, password: string): Promise<void> {
  if (USE_MOCKS) {
    await setAuthToken('mock-demo-token');
    return;
  }

  const res = await fetch(`${REST_BASE}/api/auth/local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: email, password }),
  });

  if (!res.ok) {
    let message = 'E-mail ou senha inválidos.';
    try {
      const body = await res.json();
      message = body?.error?.message ?? message;
    } catch { /* ignore parse errors */ }
    throw new Error(message);
  }

  const data = (await res.json()) as { jwt: string };
  await setAuthToken(data.jwt);
}

export async function logout(): Promise<void> {
  await clearAuthToken();
}

/**
 * Self-service first access: an imported student proves identity
 * (email + birthdate/phone) and sets a password. On success the backend
 * returns a JWT and we store it — the student lands logged in.
 *
 * Like `login`, this is a pre-auth bootstrap call so it goes over a plain
 * fetch against the GraphQL endpoint (no Apollo context needed yet).
 */
export async function activateAccount(params: {
  academySlug: string;
  email: string;
  birthdate?: string;
  phone?: string;
  password: string;
}): Promise<void> {
  if (USE_MOCKS) {
    await setAuthToken('mock-demo-token');
    return;
  }

  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query:
        'mutation Activate($data: ActivateAccountInput!) {\n' +
        '  activateAccount(data: $data) { jwt }\n' +
        '}',
      variables: { data: params },
    }),
  });

  const json = (await res.json()) as {
    data?: { activateAccount?: { jwt?: string } };
    errors?: Array<{ message?: string }>;
  };

  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message ?? 'Não foi possível ativar a conta.');
  }
  const jwt = json.data?.activateAccount?.jwt;
  if (!jwt) {
    throw new Error('Não foi possível ativar a conta.');
  }
  await setAuthToken(jwt);
}
