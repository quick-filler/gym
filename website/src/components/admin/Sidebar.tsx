"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { JWT_STORAGE_KEY } from "@/lib/config";
import { clearAuthCookies } from "@/lib/auth";
import { useAcademy, useMe } from "@/lib/hooks";

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
  { href: "/admin/plans", label: "Planos", icon: "credit" },
  { href: "/admin/finance", label: "Financeiro", icon: "money" },
  { href: "/admin/dre", label: "DRE / Custos", icon: "trending" },
  { href: "/admin/schedule", label: "Agenda", icon: "calendar" },
  { href: "/admin/attendance", label: "Presenças", icon: "check" },
  { href: "/admin/workouts", label: "Treinos", icon: "dumbbell" },
];

const CONFIG: NavItem[] = [
  { href: "/admin/settings", label: "Configurações", icon: "settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: academy } = useAcademy();
  const { data: me } = useMe();

  function handleLogout() {
    localStorage.removeItem(JWT_STORAGE_KEY);
    clearAuthCookies();
    router.push("/login");
  }

  const academyName = academy?.name ?? "";
  const academyLogo = academy?.logoSquareUrl ?? academy?.logoUrl ?? null;

  return (
    <aside className="fixed top-0 left-0 w-[248px] h-screen bg-ink-900 text-paper flex flex-col border-r border-ink-700 max-[980px]:hidden">
      <div className="p-6 border-b border-ink-700">
        <div className="flex items-center gap-2 font-display font-bold text-[1.25rem] text-paper">
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
        <div className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-300 mt-3">
          {academyName ? `${academyName} — Painel` : "Painel"}
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
            <UserAvatar
              photoUrl={me?.photoUrl}
              initials={me?.initials ?? "?"}
              name={me?.name ?? ""}
            />
            <div className="flex-1 min-w-0">
              <div className="text-[0.9rem] font-semibold text-paper truncate">
                {me?.name ?? ""}
              </div>
              <div className="font-mono text-[0.68rem] uppercase tracking-[0.08em] text-ink-300">
                {me?.roleLabel ?? ""}
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

function UserAvatar({
  photoUrl,
  initials,
  name,
}: {
  photoUrl?: string;
  initials: string;
  name: string;
}) {
  if (photoUrl) {
    return (
      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-ink-700">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-flame to-flame-dark flex items-center justify-center font-mono text-[0.78rem] font-semibold text-white shrink-0">
      {initials}
    </div>
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
