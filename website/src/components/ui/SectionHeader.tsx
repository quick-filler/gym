import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SectionEyebrow } from "./Eyebrow";

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  className,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <header
      className={cn(
        "mb-16 max-w-[720px]",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && <SectionEyebrow>{eyebrow}</SectionEyebrow>}
      <h2 className="text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.03em] leading-[1.05]">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[1.1rem] text-ink-500 mt-5 max-w-[38rem]">
          {subtitle}
        </p>
      )}
    </header>
  );
}
