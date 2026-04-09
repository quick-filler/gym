/**
 * Apollo provider for the Expo student app.
 *
 * In mock mode the provider degrades to a pass-through so the dev
 * bundle never touches Apollo and the app renders instantly without
 * a running backend. In API mode it mounts the real client.
 *
 * Keeping the toggle inside this module (rather than at the call
 * site) means the route tree stays clean — `app/_layout.tsx` just
 * wraps everything unconditionally.
 */

import React from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { USE_MOCKS } from './config';

export function ApolloClientProvider({ children }: { children: React.ReactNode }) {
  if (USE_MOCKS) {
    return <>{children}</>;
  }
  // Lazy import so the Apollo client module only loads when we actually
  // need it. `require` is intentional — mocks-mode bundles must not
  // pull Apollo into the JS bundle at all.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { apolloClient } = require('./apollo');
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
