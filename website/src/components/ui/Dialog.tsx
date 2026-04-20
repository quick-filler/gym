"use client";

/**
 * Lightweight modal. Uses a fixed overlay + centred panel (no portal
 * needed; the overlay is at the root of the React tree on open).
 * Clicking the backdrop or pressing Escape closes it.
 *
 * Escape handling + focus trap are intentionally minimal — this is
 * admin UI, not a library primitive. If accessibility becomes a
 * concern, swap for radix/shadcn.
 */

import type { ReactNode } from "react";
import { useEffect } from "react";
import { Icon } from "./Icon";

export function Dialog({
  open,
  onClose,
  title,
  subtitle,
  children,
  actions,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink-900/55 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        className={
          wide
            ? "relative bg-white border border-line rounded-[var(--radius-lg)] shadow-[var(--shadow-gym-3)] w-full max-w-[720px] max-h-[90vh] flex flex-col"
            : "relative bg-white border border-line rounded-[var(--radius-lg)] shadow-[var(--shadow-gym-3)] w-full max-w-[480px] max-h-[90vh] flex flex-col"
        }
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-6 border-b border-line">
          <div>
            <h2
              id="dialog-title"
              className="font-display text-[1.3rem] font-semibold text-ink-900 leading-tight"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-[0.88rem] text-ink-500 mt-1">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 w-8 h-8 rounded-full hover:bg-paper-2 flex items-center justify-center text-ink-500 hover:text-ink-900 transition-colors"
          >
            <Icon name="x" size="lg" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {actions && (
          <div className="flex items-center justify-end gap-3 p-5 border-t border-line bg-paper-50 rounded-b-[var(--radius-lg)]">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
