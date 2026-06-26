/**
 * useModuleGuard — redirects to the dashboard when the academy hasn't
 * enabled `module`. Defense-in-depth behind the tab/link gating: a deep
 * link straight to a disabled module's screen bounces home.
 *
 * Waits for the dashboard query to resolve before bouncing, so it never
 * fires during the initial load (and `null` enabledModules = all on).
 * Returns whether the module is allowed so the screen can render null
 * while the redirect happens.
 */

import { useEffect } from 'react';
import { router } from 'expo-router';

import { useDashboard } from './useDashboard';
import { hasModule, type AppModule } from '../lib/modules';

export function useModuleGuard(module: AppModule): boolean {
  const { data, loading } = useDashboard();
  const allowed = hasModule(data?.academy.enabledModules ?? null, module);

  useEffect(() => {
    if (!loading && data && !allowed) {
      router.replace('/');
    }
  }, [loading, data, allowed]);

  return allowed;
}
