import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  as: Component = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "section";
}) {
  return (
    <Component
      className={cn(
        "bg-white border border-line rounded-[28px] p-8 shadow-[var(--shadow-gym-1)]",
        className,
      )}
    >
      {children}
    </Component>
  );
}
