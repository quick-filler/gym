/**
 * Pure academy-slug normalization (Fase 9). Kept free of native imports
 * (no expo-secure-store) so it's unit-testable under the Node vitest env —
 * `lib/academy.ts` re-exports it for app code.
 */

/**
 * Coerce arbitrary user input into a canonical academy slug.
 *
 * Accepts: a plain slug, a deep link with `/academy/<slug>`, or an
 * `https://<slug>.host` URL. Lowercases, turns spaces into hyphens, drops
 * anything that isn't `[a-z0-9-]`, and trims stray hyphens. Returns '' when
 * there's nothing usable.
 */
export function normalizeSlug(input: string | null | undefined): string {
  let s = (input ?? '').trim();
  if (!s) return '';

  const pathMatch = s.match(/academy\/([^/?#\s]+)/i);
  if (pathMatch) {
    s = pathMatch[1];
  } else {
    const subMatch = s.match(/^https?:\/\/([^./\s]+)\./i);
    if (subMatch) s = subMatch[1];
  }

  return s
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
