"use client";

/**
 * Portal-rendered dropdown menu anchored to a trigger button.
 *
 * Usage:
 *   <DropdownMenu
 *     trigger={<button>⋯</button>}
 *     items={[
 *       { label: "Editar", onSelect: () => … },
 *       { label: "Excluir", tone: "danger", onSelect: () => … },
 *     ]}
 *   />
 *
 * Close on outside click, Escape, or after any item fires. Items can
 * be disabled or marked `danger` (red text). Renders in a portal so
 * `overflow-y-auto` parents (Dialog body, scroll containers) don't
 * clip it.
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon, type IconName } from "./Icon";
import { cn } from "@/lib/utils";

export interface DropdownItem {
  label: string;
  icon?: IconName;
  onSelect: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
}

export function DropdownMenu({
  trigger,
  items,
  align = "end",
}: {
  trigger: React.ReactNode;
  items: DropdownItem[];
  /** Align the menu to the start (left edge) or end (right edge) of the trigger. */
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  function recompute() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = 208; // matches w-52 below
    const left =
      align === "end" ? rect.right - width : rect.left;
    setPos({ top: rect.bottom + 4, left });
  }

  useEffect(() => {
    if (!open) return;
    recompute();
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onScrollOrResize() {
      recompute();
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <span
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="inline-flex"
      >
        {trigger}
      </span>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[200] w-52 bg-white border border-line rounded-xl shadow-[var(--shadow-gym-3)] py-1 overflow-hidden"
            style={{ top: pos.top, left: pos.left }}
            role="menu"
          >
            {items.map((item, i) => (
              <button
                key={`${item.label}-${i}`}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.disabled) return;
                  setOpen(false);
                  item.onSelect();
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 text-left text-[0.88rem] transition-colors",
                  item.disabled
                    ? "text-ink-300 cursor-not-allowed"
                    : item.tone === "danger"
                      ? "text-rose hover:bg-rose-50"
                      : "text-ink-700 hover:bg-paper-50",
                )}
              >
                {item.icon && (
                  <Icon name={item.icon} className="shrink-0" size="lg" />
                )}
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
