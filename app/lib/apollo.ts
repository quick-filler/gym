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
  process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT ?? 'http://localhost:1337/graphql';

const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
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
  link: from([authLink, httpLink]),
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
