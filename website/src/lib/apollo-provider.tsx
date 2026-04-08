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
import { USE_MOCKS } from './config';

/**
 * In mock mode the Apollo provider degrades to a pass-through so demo
 * mode can render without a running backend. Apollo is still imported
 * (we're in the same module graph) but its client is never used.
 */
export function ApolloClientProvider({ children }: { children: ReactNode }) {
  if (USE_MOCKS) {
    return <>{children}</>;
  }
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
