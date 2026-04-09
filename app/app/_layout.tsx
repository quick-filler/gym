/**
 * Root expo-router layout.
 *
 * Mounts the Apollo provider (which degrades to a pass-through in mock
 * mode) and the safe-area provider, then lets the router render the
 * child routes. The actual tab bar lives in `(tabs)/_layout.tsx` — this
 * file only owns the app-wide providers.
 */

import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ApolloClientProvider } from '../lib/apollo-provider';

export default function RootLayout() {
  return (
    <ApolloClientProvider>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaProvider>
    </ApolloClientProvider>
  );
}
