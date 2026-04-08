import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Wrap({
  children,
  tight,
  narrow,
  className,
}: {
  children: ReactNode;
  tight?: boolean;
  narrow?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full mx-auto px-8 max-[720px]:px-5 relative z-[1]",
        narrow ? "max-w-[720px]" : tight ? "max-w-[960px]" : "max-w-[1280px]",
        className,
      )}
    >
      {children}
    </div>
  );
}
