/**
 * Mini admin chrome preview rendered inside the settings page.
 *
 * Scope: CSS vars are applied as inline style on the wrapper, NOT on
 * <html>, so the preview reflects the unsaved form state without
 * leaking to the rest of the page. This is the inverse of
 * AcademyThemeProvider, which writes to document.documentElement once
 * the values are persisted.
 */

"use client";

import type { CSSProperties } from "react";

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
  // Inline vars — Tailwind utilities like bg-[var(--color-primary)]
  // would read these, but we reference them directly via inline style
  // here to keep the preview self-contained.
  const style: CSSProperties = {
    ["--preview-primary" as string]: primaryColor,
    ["--preview-secondary" as string]: secondaryColor,
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
                style={{ background: "var(--preview-primary)" }}
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
                        color: "var(--preview-primary)",
                        borderLeft: "2px solid var(--preview-primary)",
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
                  style={{ color: "var(--preview-primary)" }}
                >
                  127
                </div>
              </div>
              <div className="rounded-lg border border-line p-2">
                <div className="text-[0.6rem] text-ink-400">Receita</div>
                <div
                  className="font-display text-[0.95rem] font-semibold"
                  style={{ color: "var(--preview-secondary)" }}
                >
                  R$ 18k
                </div>
              </div>
            </div>
            <button
              type="button"
              className="mt-1 w-full py-1.5 rounded-md text-white text-[0.72rem] font-medium"
              style={{ background: "var(--preview-primary)" }}
            >
              Novo aluno
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
