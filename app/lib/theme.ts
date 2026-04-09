/**
 * Shared visual tokens for the student app. Every route file imports
 * from here so the palette, the accent-alpha helper, and the shade
 * function only live in one place.
 *
 * These are the *fallbacks* — the per-academy accent color comes from
 * the dashboard query and overrides `primary`/`primaryDark` at render
 * time. The neutral ink/paper/line values are constant across tenants.
 */

export const theme = {
  paper:     '#faf8f5',
  paper2:    '#f3efe8',
  paper3:    '#e7e2d9',
  ink900:    '#0c0a09',
  ink700:    '#292524',
  ink600:    '#44403c',
  ink500:    '#57534e',
  ink400:    '#78716c',
  ink300:    '#a8a29e',
  emerald:   '#059669',
  emerald50: '#ecfdf5',
  line:      '#e7e2d9',
} as const;

/**
 * Mix a hex color with an alpha channel. Used everywhere we want a
 * tinted backdrop behind an icon or a badge without committing to a
 * second design token.
 */
export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return `rgba(239, 68, 68, ${alpha})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
