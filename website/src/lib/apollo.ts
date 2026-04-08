/**
 * Apollo Client instance for the website.
 *
 * Everything the marketing site + admin panel fetches goes through this
 * client — GraphQL is the only data API (see root CLAUDE.md / docs/
 * design-decisions.md §3.1). The single REST exception is the
 * users-permissions auth flow, which lives in `src/lib/auth.ts`.
 *
 * The cache is normalized on Strapi's `documentId`, never on the numeric
 * primary key (the schema doesn't expose it). Each content type gets an
 * explicit `keyFields: ['documentId']` entry so Apollo doesn't fall back
 * to `id` and silently break caching.
 */

'use client';

import { ApolloClient, InMemoryCache, HttpLink, from, ApolloLink } from '@apollo/client';

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? 'http://localhost:1337/graphql';

const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
});

/**
 * Auth middleware — reads the JWT from localStorage and attaches it to
 * every request. Server-side renders skip this (no `window`) and fall
 * through as unauthenticated, which is correct for the public surface.
 */
const authLink = new ApolloLink((operation, forward) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('jwt');
    if (token) {
      operation.setContext(({ headers = {} }: { headers?: Record<string, string> }) => ({
        headers: {
          ...headers,
          authorization: `Bearer ${token}`,
        },
      }));
    }
  }
  return forward(operation);
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
