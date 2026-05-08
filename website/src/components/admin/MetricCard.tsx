import type { MetricCard as MetricCardType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MetricCard({
  metric,
  icon,
}: {
  metric: MetricCardType;
  icon?: React.ReactNode;
}) {
  const trendCls =
    metric.delta?.trend === "up"
      ? "text-emerald"
      : metric.delta?.trend === "down"
        ? "text-rose"
        : "text-ink-500";

  const arrow =
    metric.delta?.trend === "up"
      ? "↑"
      : metric.delta?.trend === "down"
        ? "↓"
        : "→";

  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] p-6 border transition-all relative overflow-hidden",
        metric.highlighted
          ? "bg-ink-900 text-paper border-ink-700 shadow-[var(--shadow-gym-2)]"
          : "bg-white border-line shadow-[var(--shadow-gym-1)]",
      )}
    >
      {metric.highlighted ? (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at top right, color-mix(in srgb, var(--color-flame) 28%, transparent), transparent 60%), radial-gradient(circle at bottom left, color-mix(in srgb, var(--color-pine) 22%, transparent), transparent 55%)",
          }}
        />
      ) : (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, var(--color-flame), var(--color-pine))",
          }}
        />
      )}
      <div className="flex items-start justify-between relative">
        <div
          className={cn(
            "font-mono text-[0.7rem] uppercase tracking-[0.1em]",
            metric.highlighted ? "text-ink-300" : "text-ink-400",
          )}
        >
          {metric.label}
        </div>
        {icon && (
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-flame"
            style={{
              background: metric.highlighted
                ? "linear-gradient(135deg, color-mix(in srgb, var(--color-flame) 25%, transparent), color-mix(in srgb, var(--color-pine) 25%, transparent))"
                : "linear-gradient(135deg, var(--color-flame-50), var(--color-pine-50))",
            }}
          >
            {icon}
          </div>
        )}
      </div>
      <div
        className={cn(
          "font-display text-[2rem] font-semibold mt-3 leading-none relative",
          metric.highlighted ? "text-paper" : "text-ink-900",
        )}
      >
        {metric.value}
      </div>
      {metric.delta && (
        <div
          className={cn(
            "text-[0.78rem] mt-2 font-medium relative",
            metric.highlighted ? "text-flame" : trendCls,
          )}
        >
          {arrow} {metric.delta.value}
        </div>
      )}
    </div>
  );
}
