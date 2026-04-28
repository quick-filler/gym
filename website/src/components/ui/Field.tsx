import type { ComponentProps, ReactNode } from "react";
import { useState, useEffect } from "react";
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

function centsToDisplay(cents: number): string {
  const digits = String(cents).padStart(3, "0");
  const intPart = digits.slice(0, -2).replace(/^0+(?=\d)/, "") || "0";
  const decPart = digits.slice(-2);
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withThousands},${decPart}`;
}

export function CurrencyInput({
  value,
  onChange,
  className,
  ...props
}: Omit<ComponentProps<"input">, "value" | "onChange" | "type"> & {
  value: number;
  onChange: (value: number) => void;
}) {
  const [display, setDisplay] = useState(() => centsToDisplay(Math.round(value * 100)));

  useEffect(() => {
    setDisplay(centsToDisplay(Math.round(value * 100)));
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").replace(/^0+/, "") || "0";
    const cents = parseInt(digits, 10);
    const capped = Math.min(cents, 9_999_999); // R$ 99.999,99 max
    setDisplay(centsToDisplay(capped));
    onChange(capped / 100);
  }

  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[0.95rem] text-ink-400 pointer-events-none select-none">
        R$
      </span>
      <input
        {...props}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        className={cn(inputBase, "pl-10", className)}
      />
    </div>
  );
}
