import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const inputBase =
  "w-full px-4 py-[0.85rem] rounded-xl border border-line-strong bg-white text-[0.95rem] text-ink-900 transition-all duration-200 placeholder:text-ink-300 focus:outline-none focus:border-ink-900 focus:shadow-[0_0_0_4px_var(--color-paper-2)]";

export function Field({
  label,
  help,
  error,
  children,
  className,
}: {
  label?: string;
  help?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2 mb-5", className)}>
      {label && (
        <label className="text-[0.82rem] font-medium text-ink-700">
          {label}
        </label>
      )}
      {children}
      {help && !error && (
        <span className="text-[0.78rem] text-ink-400">{help}</span>
      )}
      {error && <span className="text-[0.78rem] text-rose">{error}</span>}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input {...props} className={cn(inputBase, className)} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={cn(inputBase, "min-h-[140px] resize-y", className)}
    />
  );
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select {...props} className={cn(inputBase, className)} />;
}
