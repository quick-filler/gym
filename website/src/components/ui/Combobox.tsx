"use client";

/**
 * Searchable select. Replaces <select> when the option list can grow
 * past ~20 items (students, plans, instructors, …) where scanning a
 * native dropdown gets painful.
 *
 * - Portal-rendered popover (works inside dialogs that use
 *   overflow-y-auto without being clipped).
 * - Fuzzy-enough filter: matches label + sublabel + id as a single
 *   lower-cased string.
 * - Keyboard: Escape closes. Arrow-key navigation deliberately not
 *   wired (admin forms, not a library primitive); add it when we
 *   actually need it.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  id: string;
  label: string;
  /** Secondary line under the label (email, dial code, etc.). */
  sublabel?: string;
  /** Right-aligned hint rendered in the option row (price, dial, …). */
  hint?: string;
  disabled?: boolean;
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder = "Selecione…",
  searchPlaceholder = "Buscar…",
  emptyMessage = "Nenhum resultado",
  disabled = false,
  required = false,
  id,
  className,
}: {
  value: string;
  onChange: (id: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
  }>({ top: 0, left: 0, width: 0 });

  const selected = options.find((o) => o.id === value);

  function recompute() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
  }

  useEffect(() => {
    if (!open) return;
    recompute();
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (popoverRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function reposition() {
      recompute();
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 20);
    } else {
      setQuery("");
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      const hay = `${o.label} ${o.sublabel ?? ""} ${o.hint ?? ""} ${o.id}`
        .toLowerCase();
      return hay.includes(q);
    });
  }, [options, query]);

  return (
    <>
      {/* Hidden native input so the surrounding <form> can enforce
          `required` without us re-implementing the HTML5 constraint. */}
      {required && (
        <input
          type="text"
          tabIndex={-1}
          aria-hidden
          required
          value={value}
          onChange={() => {}}
          style={{
            opacity: 0,
            height: 0,
            width: 0,
            position: "absolute",
            pointerEvents: "none",
          }}
        />
      )}
      <button
        id={id}
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "w-full text-left px-4 py-[0.85rem] rounded-xl border border-line-strong bg-white text-[0.95rem] transition-all placeholder:text-ink-300 focus:outline-none focus:border-ink-900 focus:shadow-[0_0_0_4px_var(--color-paper-2)] disabled:opacity-60 disabled:cursor-not-allowed",
          "flex items-center gap-2",
          className,
        )}
      >
        <span
          className={cn(
            "flex-1 min-w-0 truncate",
            selected ? "text-ink-900" : "text-ink-300",
          )}
        >
          {selected ? selected.label : placeholder}
        </span>
        {selected?.hint && (
          <span className="font-mono text-[0.78rem] text-ink-400 shrink-0">
            {selected.hint}
          </span>
        )}
        <Icon
          name="arrow-right"
          className={cn(
            "text-ink-400 shrink-0 transition-transform",
            open ? "-rotate-90" : "rotate-90",
          )}
        />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            className="fixed z-[200] bg-white border border-line rounded-xl shadow-[var(--shadow-gym-3)] overflow-hidden"
            style={{
              top: pos.top,
              left: pos.left,
              width: Math.max(pos.width, 280),
            }}
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
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 pr-3 py-2 rounded-lg bg-white border border-line-strong text-[0.88rem] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-ink-900"
                />
              </div>
            </div>

            <ul className="max-h-[280px] overflow-y-auto py-1">
              {filtered.map((o) => {
                const active = o.id === value;
                return (
                  <li key={o.id}>
                    <button
                      type="button"
                      disabled={o.disabled}
                      onClick={() => {
                        onChange(o.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-left text-[0.88rem] transition-colors",
                        o.disabled
                          ? "text-ink-300 cursor-not-allowed"
                          : "hover:bg-paper-50",
                        active && "bg-flame-50 text-flame",
                      )}
                      role="option"
                      aria-selected={active}
                    >
                      <div className="flex-1 min-w-0">
                        <div
                          className={cn(
                            "truncate",
                            active ? "font-semibold" : "text-ink-900",
                          )}
                        >
                          {o.label}
                        </div>
                        {o.sublabel && (
                          <div className="text-[0.74rem] text-ink-400 truncate">
                            {o.sublabel}
                          </div>
                        )}
                      </div>
                      {o.hint && (
                        <span className="font-mono text-[0.78rem] text-ink-400 shrink-0">
                          {o.hint}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}

              {filtered.length === 0 && (
                <li className="px-3 py-3 text-[0.85rem] text-ink-400">
                  {query
                    ? `${emptyMessage} para “${query}”.`
                    : emptyMessage}
                </li>
              )}
            </ul>
          </div>,
          document.body,
        )}
    </>
  );
}
