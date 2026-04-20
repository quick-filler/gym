"use client";

/**
 * International phone input.
 *
 * Shows a country picker + a locally-formatted national number.
 * Default country is Brasil (+55). The `value` prop is the raw
 * national digits; the parent can convert to the DB format with
 * `toStored(country, value)` when submitting.
 */

import { useId, useRef } from "react";
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  findCountry,
  type Country,
  digitsOnly,
} from "@/lib/phone";
import { cn } from "@/lib/utils";

export function PhoneInput({
  country,
  onCountryChange,
  value,
  onChange,
  placeholder,
  required,
  autoFocus,
  className,
  id,
}: {
  country: Country;
  onCountryChange: (c: Country) => void;
  /** Raw national digits (no country code, no separators). */
  value: string;
  /** Called with raw national digits (no formatting). */
  onChange: (digits: string) => void;
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
  className?: string;
  id?: string;
}) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const inputRef = useRef<HTMLInputElement>(null);

  const display = country.format(value);
  const ph = placeholder ?? country.format(country.example);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const next = digitsOnly(e.target.value).slice(
      0,
      // give a generous cap — 11 digits for BR mobile, more for others
      16,
    );
    onChange(next);
  }

  function handleCountry(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = findCountry(e.target.value);
    onCountryChange(next);
    // Re-focus the number input so the user keeps typing.
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <div
      className={cn(
        "flex items-stretch border border-line-strong rounded-xl bg-white overflow-hidden focus-within:border-ink-900 focus-within:shadow-[0_0_0_4px_var(--color-paper-2)] transition-all",
        className,
      )}
    >
      <label htmlFor={`${inputId}-country`} className="sr-only">
        País
      </label>
      <select
        id={`${inputId}-country`}
        value={country.code}
        onChange={handleCountry}
        className="bg-paper-50 border-r border-line pl-3 pr-2 py-[0.85rem] text-[0.9rem] font-mono text-ink-700 cursor-pointer focus:outline-none hover:bg-paper-2 transition-colors"
        aria-label="Código do país"
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} +{c.dial} {c.name}
          </option>
        ))}
      </select>
      <div className="flex items-center text-ink-500 font-mono text-[0.95rem] pl-3 select-none">
        +{country.dial}
      </div>
      <input
        id={inputId}
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        required={required}
        autoFocus={autoFocus}
        value={display}
        onChange={handleInput}
        placeholder={ph}
        className="flex-1 min-w-0 px-3 py-[0.85rem] text-[0.95rem] text-ink-900 placeholder:text-ink-300 focus:outline-none bg-transparent"
      />
    </div>
  );
}

export { DEFAULT_COUNTRY };
