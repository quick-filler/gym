"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { JWT_STORAGE_KEY } from "@/lib/config";
import { clearAuthCookies } from "@/lib/auth";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/platform/dashboard", label: "Dashboard", icon: "chart" },
  { href: "/platform/leads", label: "Leads", icon: "users" },
  { href: "/platform/academies", label: "Academias", icon: "trending" },
];

export function PlatformMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  function close() {
    setOpen(false);
  }

  function handleLogout() {
    localStorage.removeItem(JWT_STORAGE_KEY);
    clearAuthCookies();
    router.push("/login");
  }

  return (
    <>
      {/* Hamburger — only on mobile */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="fixed top-0 left-0 z-50 h-16 w-14 flex items-center justify-center text-ink-700 min-[981px]:hidden"
      >
        <Icon name="list" size="lg" />
      </button>

      {/* Backdrop */}
      <div
        onClick={close}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-[60] bg-ink-900/60 backdrop-blur-sm transition-opacity duration-300 min-[981px]:hidden",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />

      {/* Drawer */}
      <aside
        aria-hidden={!open}
        className={cn(
          "fixed top-0 left-0 z-[70] w-[280px] h-screen bg-ink-900 text-paper flex flex-col border-r border-ink-700 transition-transform duration-300 min-[981px]:hidden",
          open ? "translate-x-0" : "-translate-x-full pointer-events-none",
        )}
      >
        <div className="p-5 border-b border-ink-700 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display font-bold text-[1.15rem] text-paper">
            <span className="w-8 h-8 rounded-[9px] bg-pine flex items-center justify-center">
              <Icon name="shield" />
            </span>
            Gym
          </div>
          <button
            onClick={close}
            aria-label="Fechar menu"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-paper hover:bg-ink-700/60 transition-colors"
          >
            <Icon name="x" size="lg" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="font-mono text-[0.63rem] uppercase tracking-[0.12em] text-ink-400 px-3 mb-2">
            Gestão
          </div>
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    className={cn(
                      "flex items-center gap-3 px-3 py-[0.55rem] rounded-lg text-[0.88rem] font-medium transition-all",
                      active
                        ? "bg-pine/10 text-pine border-l-2 border-pine pl-[10px]"
                        : "text-ink-300 hover:text-paper hover:bg-ink-700/40",
                    )}
                  >
                    <Icon name={item.icon} size="lg" />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-ink-700 p-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 px-1">
              <div className="text-[0.88rem] font-semibold text-paper truncate">
                Super Admin
              </div>
              <div className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-pine">
                Plataforma
              </div>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Sair"
              title="Sair"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-400 hover:text-rose hover:bg-ink-700/60 transition-colors shrink-0"
            >
              <Icon name="log-out" size="lg" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
