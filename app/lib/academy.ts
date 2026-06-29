/**
 * Active-academy persistence (Fase 9 — academy picker / multi-tenant).
 *
 * The app is white-label: which academy's branding + login it shows is
 * driven by a *slug*. There are two sources, in priority order:
 *
 *   1. A runtime choice the user made in the academy picker, persisted in
 *      SecureStore (`academySlug`). This is what makes one generic build
 *      serve any academy.
 *   2. A build-time `EXPO_PUBLIC_ACADEMY_SLUG` baked into a single-tenant
 *      build. When set, the picker is skipped and switching is disabled
 *      (`canSwitchAcademy` = false).
 *
 * `normalizeSlug` (re-exported from the native-free `./slug`) is pure +
 * unit-tested so the picker accepts a raw slug, a pasted deep link
 * (`gymapp://academy/<slug>`), or a branded URL (`https://<slug>.gym.app`)
 * and always lands on the canonical slug.
 */

import * as SecureStore from 'expo-secure-store';
import { ACADEMY_SLUG, USE_MOCKS } from './config';

export { normalizeSlug } from './slug';

const KEY = 'academySlug';

/**
 * Switching academies is only meaningful on a multi-tenant build: a baked
 * single-tenant slug can't change, and the demo (mock) build has no real
 * tenancy. Both hide the picker entry points.
 */
export const canSwitchAcademy: boolean = !ACADEMY_SLUG && !USE_MOCKS;

export async function getStoredAcademySlug(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(KEY);
  } catch {
    return null;
  }
}

export async function storeAcademySlug(slug: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY, slug);
  } catch {
    /* keychain unavailable — picker re-asks next launch */
  }
}

export async function clearStoredAcademySlug(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(KEY);
  } catch {
    /* ignore */
  }
}
