"use client";

/**
 * International phone input.
 *
 * Left: searchable country combobox (click to open, filter as you
 * type, "Outro país…" at the bottom for codes not in the built-in
 * list). Right: national number, formatted live with the selected
 * country's formatter.
 *
 * Default country is Brasil (+55). `value` is the raw national
 * digits; the parent converts to the DB format with
 * `toStored(country, value)` when submitting.
 */

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  OTHER_COUNTRY,
  digitsOnly,
  findCountry,
  makeOtherCountry,
  type Country,
} from "@/lib/phone";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

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
    const next = digitsOnly(e.target.value).slice(0, 16);
    onChange(next);
  }

  function handlePick(next: Country) {
    onCountryChange(next);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <div
      className={cn(
        "flex items-stretch border border-line-strong rounded-xl bg-white overflow-visible focus-within:border-ink-900 focus-within:shadow-[0_0_0_4px_var(--color-paper-2)] transition-all",
        className,
      )}
    >
      <CountryCombobox country={country} onPick={handlePick} />
      <div className="flex items-center text-ink-500 font-mono text-[0.95rem] pl-3 select-none">
        +{country.dial || "?"}
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

/* ------------------------------------------------------------------
 * Searchable country combobox
 * ------------------------------------------------------------------ */

function CountryCombobox({
  country,
  onPick,
}: {
  country: Country;
  onPick: (c: Country) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [otherMode, setOtherMode] = useState(country.code === "OTHER");
  const [otherDial, setOtherDial] = useState(
    country.code === "OTHER" ? country.dial : "",
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close on outside click + Escape.
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Autofocus the search when the panel opens.
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 20);
    } else {
      setQuery("");
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => {
      const hay = `${c.name} ${c.code} ${c.dial} +${c.dial}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  function commitOther() {
    const c = makeOtherCountry(otherDial);
    if (!c.dial) return;
    onPick(c);
    setOpen(false);
    setOtherMode(false);
  }

  return (
    // `flex` on the wrapper lets the button inside it stretch to the
    // wrapper's height — which the outer `items-stretch` row already
    // matched to the input sibling. Without this, the combobox button
    // collapses to its content height and looks tiny next to the input.
    <div ref={rootRef} className="relative flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="rounded-l-xl bg-paper-50 border-r border-line pl-3 pr-2 text-[0.9rem] font-mono text-ink-700 cursor-pointer focus:outline-none hover:bg-paper-2 transition-colors inline-flex items-center gap-1"
      >
        <span>{country.flag ?? "🌐"}</span>
        <span className="ml-1 text-ink-500 text-[0.78rem]">
          {country.code === "OTHER" ? "OTHER" : country.code}
        </span>
        <Icon name="arrow-right" className="rotate-90 text-ink-400" />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-50 bg-white border border-line rounded-xl shadow-[var(--shadow-gym-2)] w-[320px] overflow-hidden"
          role="listbox"
        >
          <div className="p-2 border-b border-line bg-paper-50">
            <div className="relative">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                size="lg"
              />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar país ou código (+55, BR…)"
                className="w-full pl-10 pr-3 py-2 rounded-lg bg-white border border-line-strong text-[0.88rem] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-ink-900"
              />
            </div>
          </div>

          <ul className="max-h-[260px] overflow-y-auto py-1">
            {filtered.map((c) => {
              const active = c.code === country.code;
              return (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => {
                      onPick(c);
                      setOpen(false);
                      setOtherMode(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-left text-[0.88rem] hover:bg-paper-50 transition-colors",
                      active && "bg-flame-50 text-flame font-medium",
                    )}
                    role="option"
                    aria-selected={active}
                  >
                    <span className="text-[1.1rem] leading-none">
                      {c.flag}
                    </span>
                    <span className="flex-1 text-ink-900 truncate">
                      {c.name}
                    </span>
                    <span className="font-mono text-[0.78rem] text-ink-400">
                      +{c.dial}
                    </span>
                  </button>
                </li>
              );
            })}

            {filtered.length === 0 && (
              <li className="px-3 py-3 text-[0.85rem] text-ink-400">
                Nenhum país com &ldquo;{query}&rdquo;.
              </li>
            )}
          </ul>

          {/* "Other" row — always at the bottom so the operator has an
              escape hatch even when the search turned up nothing. */}
          <div className="border-t border-line p-2 bg-paper-50">
            {!otherMode ? (
              <button
                type="button"
                onClick={() => setOtherMode(true)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-[0.88rem] text-ink-700 hover:bg-paper-2 transition-colors"
              >
                <span className="text-[1.1rem]">{OTHER_COUNTRY.flag}</span>
                <span className="flex-1">Outro país…</span>
                <Icon name="plus" className="text-ink-400" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[1.1rem]">{OTHER_COUNTRY.flag}</span>
                <span className="text-ink-500 text-[0.88rem]">+</span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  value={otherDial}
                  onChange={(e) =>
                    setOtherDial(digitsOnly(e.target.value).slice(0, 4))
                  }
                  placeholder="62"
                  aria-label="Código do país"
                  className="w-16 px-2 py-1.5 rounded-lg border border-line-strong text-[0.88rem] text-ink-900 placeholder:text-ink-300 focus:outline-none focus:border-ink-900"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitOther();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={commitOther}
                  disabled={!otherDial}
                  className="px-3 py-1.5 rounded-lg bg-ink-900 text-paper text-[0.82rem] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Usar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { DEFAULT_COUNTRY };
