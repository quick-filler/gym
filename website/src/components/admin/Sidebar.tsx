"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { JWT_STORAGE_KEY } from "@/lib/config";

type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  badge?: number;
};

const PRIMARY: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "chart" },
  { href: "/admin/students", label: "Alunos", icon: "users" },
  { href: "/admin/dependents", label: "Dependentes", icon: "user" },
  { href: "/admin/finance", label: "Financeiro", icon: "money" },
  { href: "/admin/dre", label: "DRE / Custos", icon: "trending" },
  { href: "/admin/schedule", label: "Agenda", icon: "calendar" },
  { href: "/admin/workouts", label: "Treinos", icon: "dumbbell" },
];

const CONFIG: NavItem[] = [
  { href: "/admin/settings", label: "Configurações", icon: "settings" },
];

export function Sidebar() {
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
          <span className="w-8 h-8 rounded-[9px] bg-flame flex items-center justify-center">
            <Icon name="dumbbell" />
          </span>
          Gym
        </div>
        <div className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-300 mt-3">
          Gym Demo — Painel
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <NavSection title="Principal" items={PRIMARY} pathname={pathname} />
        <NavSection
          title="Configurações"
          items={CONFIG}
          pathname={pathname}
          className="mt-8"
        />
      </nav>

      <div className="border-t border-ink-700 p-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0 p-2 rounded-xl hover:bg-ink-700/40 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-flame to-flame-dark flex items-center justify-center font-mono text-[0.78rem] font-semibold text-white shrink-0">
              GD
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[0.9rem] font-semibold text-paper truncate">
                Gym Demo
              </div>
              <div className="font-mono text-[0.68rem] uppercase tracking-[0.08em] text-ink-300">
                Administrador
              </div>
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

function NavSection({
  title,
  items,
  pathname,
  className,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-400 px-3 mb-2">
        {title}
      </div>
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-[0.6rem] rounded-lg text-[0.88rem] font-medium transition-all relative",
                  active
                    ? "bg-flame/10 text-flame border-l-2 border-flame pl-[10px]"
                    : "text-ink-300 hover:text-paper hover:bg-ink-700/40",
                )}
              >
                <Icon name={item.icon} size="lg" />
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="font-mono text-[0.65rem] bg-flame text-white rounded-full px-2 py-[1px] font-semibold">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
