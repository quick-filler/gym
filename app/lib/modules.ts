/**
 * Per-academy module gating (mirrors backend `enabledModules`).
 *
 * The academy admin chooses which optional modules the student app exposes.
 * The app reads `DashboardData.academy.enabledModules` and shows only the
 * enabled ones; the backend `requireModule` enforces the same on the API.
 *
 * `null`/`undefined` means "never configured" → everything on (the
 * backward-compatible default), matching the admin UI and the backend.
 */

export type AppModule = 'dependents' | 'workouts' | 'classes' | 'pool';

export function hasModule(
  enabledModules: string[] | null | undefined,
  module: AppModule,
): boolean {
  if (enabledModules == null) return true;
  return enabledModules.includes(module);
}
