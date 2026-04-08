import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-8 max-[720px]:flex-col max-[720px]:items-start">
      <div>
        <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-semibold text-ink-900 tracking-[-0.02em] leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink-400 mt-2">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
