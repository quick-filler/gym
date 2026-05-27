"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { logoutAndRedirect } from "@/lib/auth";
import { useAcademy, useMe } from "@/lib/hooks";

const PRIMARY: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "chart" },
  { href: "/admin/students", label: "Alunos", icon: "users" },
  { href: "/admin/dependents", label: "Dependentes", icon: "user" },
  { href: "/admin/plans", label: "Planos", icon: "credit" },
  { href: "/admin/finance", label: "Financeiro", icon: "money" },
  { href: "/admin/dre", label: "DRE / Custos", icon: "trending" },
  { href: "/admin/schedule", label: "Agenda", icon: "calendar" },
  { href: "/admin/attendance", label: "Presenças", icon: "check" },
  { href: "/admin/workouts", label: "Treinos", icon: "heart-pulse" },
];

const CONFIG: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin/settings", label: "Configurações", icon: "settings" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: academy } = useAcademy();
  const { data: me } = useMe();

  function close() {
    setOpen(false);
  }

  function handleLogout() {
    logoutAndRedirect("/login");
  }

  const academyName = academy?.name ?? "";
  const academyLogo = academy?.logoSquareUrl ?? academy?.logoUrl ?? null;

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
          <div className="flex items-center gap-2 font-display font-bold text-[1.15rem] text-paper min-w-0">
            {academyLogo ? (
              <span className="w-8 h-8 rounded-[9px] overflow-hidden bg-paper-2 flex items-center justify-center shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={academyLogo}
                  alt={academyName}
                  className="w-full h-full object-cover"
                />
              </span>
            ) : (
              <span className="w-8 h-8 rounded-[9px] bg-flame flex items-center justify-center shrink-0">
                <Icon name="dumbbell" />
              </span>
            )}
            <span className="truncate">{academyName || "Gym"}</span>
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
          <NavGroup
            title="Principal"
            items={PRIMARY}
            pathname={pathname}
            onNavigate={close}
          />
          <NavGroup
            title="Configurações"
            items={CONFIG}
            pathname={pathname}
            onNavigate={close}
            className="mt-6"
          />
        </nav>

        <div className="border-t border-ink-700 p-4">
          <div className="flex items-center gap-2">
            {me?.photoUrl ? (
              <div className="w-10 h-10 rounded-full overflow-hidden bg-ink-700 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={me.photoUrl}
                  alt={me.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-flame to-flame-dark flex items-center justify-center font-mono text-[0.78rem] font-semibold text-white shrink-0">
                {me?.initials ?? "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-[0.88rem] font-semibold text-paper truncate">
                {me?.name ?? ""}
              </div>
              <div className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-ink-300">
                {me?.roleLabel ?? ""}
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

function NavGroup({
  title,
  items,
  pathname,
  onNavigate,
  className,
}: {
  title: string;
  items: { href: string; label: string; icon: IconName }[];
  pathname: string;
  onNavigate: () => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="font-mono text-[0.63rem] uppercase tracking-[0.12em] text-ink-400 px-3 mb-2">
        {title}
      </div>
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 px-3 py-[0.55rem] rounded-lg text-[0.88rem] font-medium transition-all",
                  active
                    ? "bg-flame/10 text-flame border-l-2 border-flame pl-[10px]"
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
    </div>
  );
}
