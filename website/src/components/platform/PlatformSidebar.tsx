"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { JWT_STORAGE_KEY } from "@/lib/config";

type NavItem = { href: string; label: string; icon: IconName };

const NAV: NavItem[] = [
  { href: "/platform/dashboard", label: "Dashboard", icon: "chart" },
  { href: "/platform/leads", label: "Leads", icon: "users" },
  { href: "/platform/academies", label: "Academias", icon: "trending" },
];

export function PlatformSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem(JWT_STORAGE_KEY);
    router.push("/login");
  }

  return (
    <aside className="fixed top-0 left-0 w-[248px] h-screen bg-ink-900 text-paper flex flex-col border-r border-ink-700 max-[980px]:hidden">
      <div className="p-6 border-b border-ink-700">
        <div className="flex items-center gap-2 font-display font-bold text-[1.25rem] text-paper">
          <span className="w-8 h-8 rounded-[9px] bg-pine flex items-center justify-center">
            <Icon name="shield" />
          </span>
          Gym
        </div>
        <div className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-pine mt-3">
          Super Admin — Plataforma
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <div className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-400 px-3 mb-2">
          Gestão
        </div>
        <ul className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-[0.6rem] rounded-lg text-[0.88rem] font-medium transition-all",
                    active
                      ? "bg-pine/10 text-pine border-l-2 border-pine pl-[10px]"
                      : "text-ink-300 hover:bg-ink-700/40 hover:text-paper",
                  )}
                >
                  <Icon name={item.icon} size="lg" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-ink-700 p-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 p-2 rounded-xl">
            <div className="text-[0.9rem] font-semibold text-paper truncate">
              Super Admin
            </div>
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.08em] text-ink-300">
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
  );
}
