import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ink" | "secondary";

type HeroCardProps = {
  variant: Variant;
  label: string;
  value: string;
  /** Watermark icon rendered at the right side, faded. */
  icon?: IconName;
  /** Footer slot — delta line, breakdown, progress bar, etc. */
  children?: ReactNode;
};

const VARIANT_STYLE: Record<Variant, React.CSSProperties> = {
  primary: {
    background:
      "linear-gradient(135deg, var(--color-flame), var(--color-pine))",
  },
  secondary: {
    background:
      "linear-gradient(135deg, var(--color-pine), var(--color-flame))",
  },
  // ink uses tailwind bg-ink-900; the gradient is layered as an overlay below.
  ink: {},
};

const LABEL_TONE: Record<Variant, string> = {
  primary: "text-white/80",
  secondary: "text-white/85",
  ink: "text-ink-300",
};

const VALUE_TONE: Record<Variant, string> = {
  primary: "text-white",
  secondary: "text-white",
  ink: "text-paper",
};

export function HeroCard({
  variant,
  label,
  value,
  icon,
  children,
}: HeroCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] p-6 relative overflow-hidden shadow-[var(--shadow-gym-2)]",
        variant === "ink" && "bg-ink-900 border border-ink-700",
      )}
      style={VARIANT_STYLE[variant]}
    >
      {variant === "ink" && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at top right, color-mix(in srgb, var(--color-flame) 30%, transparent), transparent 55%), radial-gradient(circle at bottom left, color-mix(in srgb, var(--color-pine) 25%, transparent), transparent 55%)",
          }}
        />
      )}
      <div
        className={cn(
          "font-mono text-[0.7rem] uppercase tracking-[0.1em] relative",
          LABEL_TONE[variant],
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          "font-display text-[2.2rem] font-semibold mt-3 leading-none relative",
          VALUE_TONE[variant],
        )}
      >
        {value}
      </div>
      {children}
      {icon && (
        <Icon
          name={icon}
          size="xl"
          className={cn(
            "absolute right-6 top-1/2 -translate-y-1/2 opacity-25",
            variant === "ink" ? "text-paper" : "text-white",
          )}
        />
      )}
    </div>
  );
}
