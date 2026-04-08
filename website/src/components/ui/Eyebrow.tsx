import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Chip-style eyebrow with pulsing dot — matches `.eyebrow` in design-system.css */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-[0.85rem] py-[0.35rem] rounded-full bg-paper-2 border border-line-strong text-[0.75rem] font-medium text-ink-700 uppercase tracking-[0.06em]",
        className,
      )}
    >
      <span className="relative inline-block w-[6px] h-[6px] rounded-full bg-flame shadow-[0_0_0_4px_rgba(232,85,28,0.18)] animate-gym-pulse" />
      {children}
    </span>
  );
}

/** Mono-font eyebrow used inside section headers. */
export function SectionEyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block font-mono text-[0.72rem] font-medium text-flame uppercase tracking-[0.12em] mb-5",
        className,
      )}
    >
      {children}
    </span>
  );
}
