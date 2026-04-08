import { cn } from "@/lib/utils";

export function Avatar({
  initials,
  color,
  size = "md",
}: {
  initials: string;
  color?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dimension =
    size === "sm"
      ? "w-8 h-8 text-[0.7rem]"
      : size === "lg"
        ? "w-12 h-12 text-[0.9rem]"
        : "w-10 h-10 text-[0.78rem]";
  return (
    <div
      className={cn(
        "rounded-full text-white flex items-center justify-center font-mono font-semibold shrink-0",
        dimension,
      )}
      style={{ background: color ?? "var(--color-ink-900)" }}
    >
      {initials}
    </div>
  );
}
