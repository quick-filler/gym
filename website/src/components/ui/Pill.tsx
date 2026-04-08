import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "emerald" | "rose" | "amber" | "sky" | "ink" | "flame";

const tones: Record<Tone, string> = {
  emerald: "bg-emerald-50 text-emerald",
  rose: "bg-rose-50 text-rose",
  amber: "bg-amber-50 text-amber",
  sky: "bg-sky-50 text-sky",
  ink: "bg-paper-2 text-ink-700",
  flame: "bg-flame-50 text-flame",
};

export function Pill({
  tone = "ink",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[0.35rem] rounded-full px-[0.65rem] py-[0.28rem] text-[0.72rem] font-semibold font-mono tracking-[0.02em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
