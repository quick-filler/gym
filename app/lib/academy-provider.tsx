/**
 * AcademyProvider — exposes the active academy slug to the app (Fase 9).
 *
 * Loads the persisted slug from SecureStore on mount (falling back to a
 * build-time baked slug, then null), and lets the picker set/clear it. The
 * entry gate in `(tabs)/_layout.tsx` reads `slug`/`ready` to decide whether
 * to send a fresh install to the academy picker before login.
 *
 * In mock mode there's no real tenant — we report a placeholder slug and
 * `ready` immediately so the demo never sees the picker.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { USE_MOCKS, ACADEMY_SLUG } from './config';
import {
  canSwitchAcademy,
  clearStoredAcademySlug,
  getStoredAcademySlug,
  storeAcademySlug,
} from './academy';

interface AcademyContextValue {
  /** Active slug, or null when none chosen yet (→ picker). */
  slug: string | null;
  /** False until the persisted slug has loaded. */
  ready: boolean;
  /** A single-tenant build can't switch academies. */
  canSwitch: boolean;
  setSlug: (slug: string) => Promise<void>;
  clearSlug: () => Promise<void>;
}

const AcademyContext = createContext<AcademyContextValue | null>(null);

export function AcademyProvider({ children }: { children: React.ReactNode }) {
  const [slug, setSlugState] = useState<string | null>(USE_MOCKS ? 'demo' : null);
  const [ready, setReady] = useState<boolean>(USE_MOCKS);

  useEffect(() => {
    if (USE_MOCKS) return;
    let active = true;
    (async () => {
      const stored = await getStoredAcademySlug();
      if (!active) return;
      // Persisted choice wins; otherwise a baked single-tenant slug; else null.
      setSlugState(stored || ACADEMY_SLUG || null);
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  const setSlug = useCallback(async (next: string) => {
    await storeAcademySlug(next);
    setSlugState(next);
  }, []);

  const clearSlug = useCallback(async () => {
    await clearStoredAcademySlug();
    // Fall back to a baked slug if this is a single-tenant build, else null.
    setSlugState(ACADEMY_SLUG || null);
  }, []);

  const value = useMemo<AcademyContextValue>(
    () => ({ slug, ready, canSwitch: canSwitchAcademy, setSlug, clearSlug }),
    [slug, ready, setSlug, clearSlug],
  );

  return <AcademyContext.Provider value={value}>{children}</AcademyContext.Provider>;
}

export function useActiveAcademy(): AcademyContextValue {
  const ctx = useContext(AcademyContext);
  if (!ctx) {
    throw new Error('useActiveAcademy must be used within an AcademyProvider');
  }
  return ctx;
}
