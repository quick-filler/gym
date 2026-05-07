/**
 * Loading state for data-driven pages. Replaces the bare
 * "Carregando…" text the admin pages used to render.
 *
 * Lives in a min-height container so the page doesn't visibly
 * "shrink" between loading and the loaded state — the layout is
 * stable. Spinner reads --color-flame, so it inherits the academy
 * branding when AcademyThemeProvider is active.
 */

"use client";

import { cn } from "@/lib/utils";

interface LoadingStateProps {
  /** Tagline below the spinner. Defaults to "Carregando". Pass null to hide. */
  message?: string | null;
  /** Vertical room reserved. Defaults to roughly half the viewport. */
  minHeight?: string | number;
  className?: string;
}

export function LoadingState({
  message = "Carregando",
  minHeight = "min(50vh, 360px)",
  className,
}: LoadingStateProps) {
  const minH =
    typeof minHeight === "number" ? `${minHeight}px` : minHeight;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "w-full flex flex-col items-center justify-center gap-4 text-ink-500",
        className,
      )}
      style={{ minHeight: minH }}
    >
      <Spinner />
      {message && (
        <span className="font-mono text-[0.78rem] tracking-[0.08em] uppercase text-ink-400">
          {message}
        </span>
      )}
    </div>
  );
}

/**
 * Simple ring spinner. Standalone (no message, no min-height) so it
 * can drop into inline contexts — saving buttons, toolbars, etc.
 */
export function Spinner({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-block", className)}
      style={{
        width: size,
        height: size,
        border: `${Math.max(2, Math.round(size / 12))}px solid var(--color-line)`,
        borderTopColor: "var(--color-flame)",
        borderRadius: "9999px",
        animation: "gym-spin 0.8s linear infinite",
      }}
      aria-hidden="true"
    />
  );
}
