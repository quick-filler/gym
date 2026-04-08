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
        "rounded-[var(--radius-lg)] p-6 border transition-all",
        metric.highlighted
          ? "bg-ink-900 text-paper border-ink-700 shadow-[var(--shadow-gym-2)] relative overflow-hidden"
          : "bg-white border-line shadow-[var(--shadow-gym-1)]",
      )}
    >
      {metric.highlighted && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,85,28,0.2),transparent_60%)] pointer-events-none" />
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
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center",
              metric.highlighted
                ? "bg-flame/20 text-flame"
                : "bg-paper-2 text-ink-700",
            )}
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
