import Link from "next/link";
import { cn } from "@/lib/utils";

export function Brand({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-[0.6rem] font-display font-bold text-[1.2rem] text-ink-900 tracking-[-0.02em]",
        className,
      )}
    >
      <span className="w-8 h-8 rounded-[9px] bg-ink-900 text-paper flex items-center justify-center text-[1.1rem]">
        ◆
      </span>
      Gym
    </Link>
  );
}
