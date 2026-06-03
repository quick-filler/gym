/**
 * Apollo Client instance for the student app.
 *
 * Identical data layer to the website (GraphQL-only, documentId-keyed
 * normalized cache) with one critical difference: the JWT is stored in
 * `expo-secure-store` (iOS keychain / Android EncryptedStore), not
 * `localStorage`. Secrets belong in the keychain.
 *
 * The auth middleware is async because SecureStore reads are async.
 * Apollo's ApolloLink supports returning a promise from a link handler,
 * so this just works without any context wiring.
 */

import { ApolloClient, InMemoryCache, HttpLink, from, ApolloLink } from '@apollo/client';
import { Observable } from '@apollo/client';
import * as SecureStore from 'expo-secure-store';

const GRAPHQL_ENDPOINT =
  process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT ?? 'http://localhost:7777/graphql';

const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
});

/**
 * Catches authentication errors (Strapi 401/403) and redirects to login.
 * Uses the same Observable + subscribe pattern as authLink to stay
 * compatible with Apollo's internal Observable (not RxJS).
 */
function bounceToLogin() {
  // Drop the bad token so the next launch starts clean, then send the
  // user to login. Wrapped in try/catch because the navigator may not be
  // mounted yet during startup.
  SecureStore.deleteItemAsync('jwt').catch(() => {});
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { router } = require('expo-router');
    router.replace('/login');
  } catch {
    // Navigator not mounted yet — safe to ignore.
  }
}

const errorLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    const sub = forward(operation).subscribe({
      next: (response) => {
        // GraphQL-level auth errors (HTTP 200 with an errors array) — e.g.
        // calling an auth:true resolver with no token → FORBIDDEN.
        const isAuthError = (response.errors ?? []).some((err: { extensions?: Record<string, unknown>; message?: string }) => {
          const code = String(err.extensions?.code ?? '').toUpperCase();
          const msg = (err.message ?? '').toLowerCase();
          return (
            code === 'UNAUTHORIZED' ||
            code === 'FORBIDDEN' ||
            msg.includes('unauthorized') ||
            msg.includes('forbidden') ||
            msg.includes('access denied')
          );
        });

        if (isAuthError) bounceToLogin();
        observer.next(response);
      },
      // Transport-level errors (no GraphQL body) — e.g. an expired or
      // invalid/stale JWT makes Strapi reply HTTP 401 before GraphQL runs.
      // Apollo surfaces these here, NOT in `next`, so we must handle them
      // too or the user gets stranded on an error screen.
      error: (err: any) => {
        const status =
          err?.statusCode ?? err?.networkError?.statusCode ?? err?.response?.status;
        const msg = String(err?.message ?? '').toLowerCase();
        if (
          status === 401 ||
          status === 403 ||
          msg.includes('invalid credentials') ||
          msg.includes('status code 401') ||
          msg.includes('status code 403')
        ) {
          bounceToLogin();
        }
        observer.error(err);
      },
      complete: observer.complete.bind(observer),
    });
    return () => sub.unsubscribe();
  });
});

/**
 * Async auth middleware — reads the JWT from SecureStore on every request
 * and attaches it to the outgoing operation.
 */
const authLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    SecureStore.getItemAsync('jwt')
      .then((token) => {
        if (token) {
          operation.setContext(({ headers = {} }: { headers?: Record<string, string> }) => ({
            headers: {
              ...headers,
              authorization: `Bearer ${token}`,
            },
          }));
        }
        const sub = forward(operation).subscribe({
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer),
        });
        return () => sub.unsubscribe();
      })
      .catch((err) => observer.error(err));
  });
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Academy:       { keyFields: ['documentId'] },
      Student:       { keyFields: ['documentId'] },
      Plan:          { keyFields: ['documentId'] },
      Enrollment:    { keyFields: ['documentId'] },
      ClassSchedule: { keyFields: ['documentId'] },
      ClassBooking:  { keyFields: ['documentId'] },
      Payment:       { keyFields: ['documentId'] },
      WorkoutPlan:   { keyFields: ['documentId'] },
      BodyAssessment:{ keyFields: ['documentId'] },
      Media:         { keyFields: ['documentId'] },
    },
  }),
});

/**
 * Convenience helpers for storing and clearing the JWT on login/logout.
 * Every call to this should invalidate the Apollo cache as well.
 */
export async function setAuthToken(token: string) {
  await SecureStore.setItemAsync('jwt', token);
}

export async function clearAuthToken() {
  await SecureStore.deleteItemAsync('jwt');
  await apolloClient.clearStore();
}
