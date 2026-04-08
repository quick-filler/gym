/**
 * Apollo provider for the Expo student app — only imported when the
 * app is in API mode (USE_MOCKS=false). Wraps the tree with the
 * Apollo Client instance so `useQuery` / `useMutation` work.
 */

import React from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from './apollo';

export function ApolloClientProvider({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
