/**
 * Client-side Apollo provider. Wraps the Next.js tree so every `'use client'`
 * component has access to the normalized GraphQL cache.
 *
 * Server components that need data should fetch it themselves via the
 * `fetch()` API pointed at the GraphQL endpoint — Apollo is a client-only
 * concern here. (Apollo's Next.js RSC integration is intentionally not
 * adopted until we actually need server-side hydration of client cache.)
 */

'use client';

import { ApolloProvider } from '@apollo/client/react';
import type { ReactNode } from 'react';
import { apolloClient } from './apollo';

/**
 * Always mounts ApolloProvider so `useQuery(..., { skip: USE_MOCKS })`
 * is valid in mock mode — no network calls happen, but the Apollo
 * context exists so hooks don't throw during SSR prerender.
 *
 * In mock mode, the client is never actually contacted (every hook
 * passes `skip: true`), but carrying the context costs nothing and
 * keeps the demo-mode fallback from diverging from API mode.
 */
export function ApolloClientProvider({ children }: { children: ReactNode }) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
