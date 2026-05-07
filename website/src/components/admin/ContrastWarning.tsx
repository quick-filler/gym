/**
 * Inline WCAG contrast feedback for the settings color pickers.
 *
 * Informational, not a guard: we let the academy admin pick whatever
 * they want (their brand may demand it) but call out when the choice
 * is going to hurt readability.
 *
 * Background defaults to white (#fff) — that's the surface buttons
 * and cards live on in /admin. Text on the colored swatch is assumed
 * white, which mirrors how the primary is used (filled buttons, badges).
 */

"use client";

import { contrastRatio, wcagLevel, type WcagLevel } from "@/lib/theme";

interface ContrastWarningProps {
  hex: string;
  /** Defaults to white — the surface buttons sit on. */
  background?: string;
  /** Label for the row (e.g. "Cor primária"). */
  label: string;
}

const TONE: Record<WcagLevel, { bg: string; fg: string; copy: string }> = {
  AAA: {
    bg: "bg-emerald-50",
    fg: "text-emerald",
    copy: "Excelente contraste",
  },
  AA: {
    bg: "bg-emerald-50",
    fg: "text-emerald",
    copy: "Contraste adequado (AA)",
  },
  "AA-large": {
    bg: "bg-amber-50",
    fg: "text-amber",
    copy: "Aceitável só para texto grande / ícones",
  },
  fail: {
    bg: "bg-rose-50",
    fg: "text-rose",
    copy: "Contraste baixo — texto pequeno ficará difícil de ler",
  },
};

export function ContrastWarning({
  hex,
  background = "#ffffff",
  label,
}: ContrastWarningProps) {
  const ratio = contrastRatio("#ffffff", hex);
  const level = wcagLevel(ratio);
  const tone = TONE[level];

  return (
    <div
      className={`flex items-center justify-between rounded-lg ${tone.bg} px-3 py-2 mt-2`}
      role="status"
      aria-label={`Contraste de ${label}: ${ratio.toFixed(2)} para 1, nível ${level}`}
    >
      <div className="flex items-center gap-2 text-[0.78rem]">
        <span
          className="inline-block w-3.5 h-3.5 rounded-full border border-line"
          style={{ background }}
          aria-hidden
        />
        <span className={`font-medium ${tone.fg}`}>{tone.copy}</span>
      </div>
      <span className="font-mono text-[0.72rem] text-ink-500">
        {ratio.toFixed(2)}:1
      </span>
    </div>
  );
}
