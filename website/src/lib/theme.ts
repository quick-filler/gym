/**
 * Pure color helpers for academy branding.
 *
 * The project's design system in src/app/globals.css uses these
 * concrete tokens per accent color:
 *   --color-flame, --color-flame-dark, --color-flame-50, --color-flame-100
 *   --color-pine, --color-pine-50
 *
 * derivePalette() takes a single hex picked by the academy admin and
 * returns the four shades the design system expects. Lightness math
 * runs in OKLCH so the output stays perceptually balanced regardless
 * of the input hue.
 *
 * No React imports here — file is unit-testable in isolation.
 */

import {
  formatHex,
  oklch,
  parse,
  wcagContrast,
  type Color,
} from "culori";

/* ============================================================
   Palette derivation
   ============================================================ */

export interface PrimaryPalette {
  base: string; // input, normalized to lowercase hex
  dark: string; // ~10% darker (button hover / pressed)
  l50: string; // very light tint (subtle backgrounds)
  l100: string; // light tint (chip / pill backgrounds)
}

export interface SecondaryPalette {
  base: string;
  dark: string;
  l50: string;
}

const FALLBACK = "#0a84ff";

function safeHex(input: string): string {
  const parsed = parse(input);
  return parsed ? formatHex(parsed) : FALLBACK;
}

function adjustL(input: Color, l: number): Color {
  const o = oklch(input);
  if (!o) return input;
  return { ...o, l };
}

/**
 * Derive a 4-stop palette compatible with the existing token shape.
 *
 * Lightness targets in OKLCH:
 *   dark  → ~0.55 (deepens for hover; safe even on dark hues)
 *   l100  → ~0.93 (chip background — visible but not loud)
 *   l50   → ~0.97 (page wash background — almost-paper)
 */
export function derivePalette(hex: string): PrimaryPalette {
  const safe = safeHex(hex);
  const parsed = parse(safe);
  if (!parsed) {
    return { base: FALLBACK, dark: FALLBACK, l50: FALLBACK, l100: FALLBACK };
  }
  return {
    base: safe,
    dark: formatHex(adjustL(parsed, 0.55)) ?? safe,
    l100: formatHex(adjustL(parsed, 0.93)) ?? safe,
    l50: formatHex(adjustL(parsed, 0.97)) ?? safe,
  };
}

export function deriveSecondaryPalette(hex: string): SecondaryPalette {
  const safe = safeHex(hex);
  const parsed = parse(safe);
  if (!parsed) return { base: FALLBACK, dark: FALLBACK, l50: FALLBACK };
  return {
    base: safe,
    dark: formatHex(adjustL(parsed, 0.4)) ?? safe,
    l50: formatHex(adjustL(parsed, 0.97)) ?? safe,
  };
}

/* ============================================================
   WCAG contrast
   ============================================================ */

/**
 * WCAG 2.1 contrast ratio. Returns 1..21.
 * Identical colors: 1. White on black: 21. Higher is more readable.
 */
export function contrastRatio(fg: string, bg: string): number {
  const fgC = parse(fg);
  const bgC = parse(bg);
  if (!fgC || !bgC) return 1;
  return wcagContrast(fgC, bgC);
}

export type WcagLevel = "AAA" | "AA" | "AA-large" | "fail";

/**
 * Maps a contrast ratio to a WCAG 2.1 level for normal text.
 *   AAA: ≥ 7
 *   AA: ≥ 4.5
 *   AA-large: ≥ 3 (only valid for large text/icons)
 *   fail: below 3
 */
export function wcagLevel(ratio: number): WcagLevel {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA-large";
  return "fail";
}
