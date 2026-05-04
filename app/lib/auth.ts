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
