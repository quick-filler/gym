/**
 * Mini admin chrome preview rendered inside the settings page.
 *
 * Scope: the same design-system tokens AcademyThemeProvider writes to
 * <html> are applied as inline style on this wrapper instead, so the
 * preview reflects unsaved form state without leaking to the rest of
 * the page. After save, the global override takes over and the live
 * chrome matches what the preview shows.
 */

"use client";

import type { CSSProperties } from "react";
import { derivePalette, deriveSecondaryPalette } from "@/lib/theme";

interface AdminPreviewProps {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
}

export function AdminPreview({
  name,
  primaryColor,
  secondaryColor,
  logoUrl,
}: AdminPreviewProps) {
  const p = derivePalette(primaryColor);
  const s = deriveSecondaryPalette(secondaryColor);

  // Override the same tokens AcademyThemeProvider sets globally, but
  // scoped to this wrapper. Tailwind utilities (text-flame, bg-flame-50,
  // text-pine) inside this subtree read these instead of the cascade.
  const style: CSSProperties = {
    ["--color-flame" as string]: p.base,
    ["--color-flame-dark" as string]: p.dark,
    ["--color-flame-50" as string]: p.l50,
    ["--color-flame-100" as string]: p.l100,
    ["--color-pine" as string]: s.base,
    ["--color-pine-50" as string]: s.l50,
  };

  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("") || "G";

  return (
    <div style={style} className="w-full">
      <div className="rounded-2xl border border-line-strong overflow-hidden bg-white shadow-[var(--shadow-gym-1)]">
        {/* Topbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-line">
          <div className="flex items-center gap-2">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={`Logo ${name}`}
                className="h-7 max-w-[100px] object-contain"
              />
            ) : (
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[0.7rem] font-semibold"
                style={{ background: "var(--color-flame)" }}
              >
                {initials}
              </div>
            )}
            <span className="font-semibold text-[0.82rem] text-ink-900 truncate max-w-[140px]">
              {name || "Sua academia"}
            </span>
          </div>
          <div className="w-7 h-7 rounded-full bg-paper-2" aria-hidden />
        </div>

        <div className="grid grid-cols-[88px_1fr]">
          {/* Sidebar */}
          <div className="bg-paper-50 border-r border-line py-3 flex flex-col gap-1">
            {[
              { label: "Início", active: true },
              { label: "Alunos", active: false },
              { label: "Aulas", active: false },
              { label: "Financeiro", active: false },
            ].map((item) => (
              <div
                key={item.label}
                className="px-3 py-1.5 text-[0.7rem] font-medium"
                style={
                  item.active
                    ? {
                        color: "var(--color-flame)",
                        borderLeft: "2px solid var(--color-flame)",
                        marginLeft: "-2px",
                      }
                    : { color: "var(--ink-500, #6b7280)" }
                }
              >
                {item.label}
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="p-3 flex flex-col gap-2">
            <div className="text-[0.62rem] font-mono uppercase tracking-[0.1em] text-ink-400">
              Dashboard
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-line p-2">
                <div className="text-[0.6rem] text-ink-400">Alunos</div>
                <div
                  className="font-display text-[0.95rem] font-semibold"
                  style={{ color: "var(--color-flame)" }}
                >
                  127
                </div>
              </div>
              <div className="rounded-lg border border-line p-2">
                <div className="text-[0.6rem] text-ink-400">Receita</div>
                <div
                  className="font-display text-[0.95rem] font-semibold"
                  style={{ color: "var(--color-pine)" }}
                >
                  R$ 18k
                </div>
              </div>
            </div>
            <button
              type="button"
              className="mt-1 w-full py-1.5 rounded-md text-white text-[0.72rem] font-medium"
              style={{ background: "var(--color-flame)" }}
            >
              Novo aluno
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
