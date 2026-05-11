/**
 * Mini admin chrome preview rendered inside the settings page.
 *
 * Strategy: render a full-fidelity static replica of /admin/dre — the
 * sidebar, topbar, and the page body — at native desktop size, then
 * CSS-transform-scale the whole subtree down to fit the settings sidebar
 * slot. Layout, spacing, typography, and component styles match the live
 * page 1:1 because we use the same Tailwind classes and the same `Card`
 * / `HeroCard` components.
 *
 * Scope: the same design-system tokens AcademyThemeProvider writes to
 * <html> are applied as inline style on the wrapper, so the preview
 * reflects unsaved form state without leaking to the rest of the page.
 */

"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Card } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { HeroCard } from "@/components/admin/HeroCard";
import { cn } from "@/lib/utils";
import { derivePalette, deriveSecondaryPalette } from "@/lib/theme";

interface AdminPreviewProps {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
}

// Full-size dimensions of the rendered replica. Picked so the DRE
// 3-column hero + (1.3fr / 1fr) charts row lay out as on a typical
// 1280-1440px desktop.
const FULL_WIDTH = 1280;
const FULL_HEIGHT = 1100;
// Scale ceiling — even on a very wide column, don't blow the preview
// past half the live page (above this it stops feeling like a preview).
const MAX_SCALE = 0.55;
// Initial guess used during SSR / before ResizeObserver fires.
const INITIAL_SCALE = 0.36;

const PRIMARY_NAV: { href: string; label: string; icon: IconName }[] = [
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

const CONFIG_NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin/settings", label: "Configurações", icon: "settings" },
];

const ACTIVE_HREF = "/admin/dre";

// ----- Static DRE data (mirrors MOCK_DRE in src/lib/mock-data.ts) -----

const CASH_FLOW = [
  { label: "Nov", revenue: 14200, expenses: 8400, profit: 5800 },
  { label: "Dez", revenue: 15100, expenses: 8600, profit: 6500 },
  { label: "Jan", revenue: 16280, expenses: 8900, profit: 7380 },
  { label: "Fev", revenue: 15900, expenses: 9100, profit: 6800 },
  { label: "Mar", revenue: 17020, expenses: 9350, profit: 7670 },
  { label: "Abr", revenue: 18420, expenses: 9800, profit: 8620 },
];

const CATEGORY_BREAKDOWN = [
  { label: "Aluguel", amount: "R$ 4.500", percent: 45.9 },
  { label: "Salários", amount: "R$ 3.000", percent: 30.6 },
  { label: "Marketing", amount: "R$ 900", percent: 9.2 },
  { label: "Utilidades", amount: "R$ 800", percent: 8.2 },
  { label: "Equipamentos", amount: "R$ 350", percent: 3.6 },
  { label: "Outros", amount: "R$ 250", percent: 2.5 },
];

type ExpenseRow = {
  id: string;
  description: string;
  subtitle?: string;
  categoryLabel: string;
  type: "fixed" | "variable";
  dueDate: string;
  amount: string;
  status: "paid" | "pending" | "open";
};

const EXPENSE_ROWS: ExpenseRow[] = [
  {
    id: "e1",
    description: "Aluguel — Abril",
    subtitle: "Recorrente · Todo dia 5",
    categoryLabel: "Aluguel",
    type: "fixed",
    dueDate: "05/04/2026",
    amount: "R$ 4.500,00",
    status: "paid",
  },
  {
    id: "e2",
    description: "Folha de Pagamento",
    subtitle: "2 instrutores + 1 recepcionista",
    categoryLabel: "Salários",
    type: "fixed",
    dueDate: "05/04/2026",
    amount: "R$ 3.000,00",
    status: "paid",
  },
  {
    id: "e3",
    description: "Google Ads — Abril",
    subtitle: "Campanha matrícula nova turma",
    categoryLabel: "Marketing",
    type: "variable",
    dueDate: "30/04/2026",
    amount: "R$ 900,00",
    status: "pending",
  },
  {
    id: "e4",
    description: "Conta de Luz",
    subtitle: "CPFL — Referência Março/26",
    categoryLabel: "Utilidades",
    type: "fixed",
    dueDate: "10/04/2026",
    amount: "R$ 480,00",
    status: "paid",
  },
  {
    id: "e5",
    description: "Manutenção Esteira #3",
    subtitle: "Técnico agendado",
    categoryLabel: "Equipamentos",
    type: "variable",
    dueDate: "20/04/2026",
    amount: "R$ 350,00",
    status: "open",
  },
];

const TYPE_LABEL = { fixed: "Fixo", variable: "Variável" } as const;

function ExpenseStatusPill({ status }: { status: ExpenseRow["status"] }) {
  if (status === "paid") return <Pill tone="emerald">PAGO</Pill>;
  if (status === "pending") return <Pill tone="amber">PENDENTE</Pill>;
  return <Pill tone="sky">EM ABERTO</Pill>;
}

function buildPolyline(
  values: number[],
  { width, height, pad }: { width: number; height: number; pad: number },
): string {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const stepX = (width - pad * 2) / Math.max(values.length - 1, 1);
  return values
    .map((v, i) => {
      const x = pad + i * stepX;
      const y = height - pad - ((v - min) / range) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function AdminPreview({
  name,
  primaryColor,
  secondaryColor,
  logoUrl,
}: AdminPreviewProps) {
  const p = derivePalette(primaryColor);
  const s = deriveSecondaryPalette(secondaryColor);

  const tokenStyle: CSSProperties = {
    ["--color-flame" as string]: p.base,
    ["--color-flame-dark" as string]: p.dark,
    ["--color-flame-50" as string]: p.l50,
    ["--color-flame-100" as string]: p.l100,
    ["--color-pine" as string]: s.base,
    ["--color-pine-dark" as string]: s.dark,
    ["--color-pine-50" as string]: s.l50,
  };

  const academyName = name || "Sua academia";
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("") || "G";

  // Track the wrapper width and derive a scale so the replica fills its
  // column at any breakpoint (settings sidebar at desktop, full-width
  // below 980px). Capped by MAX_SCALE so it doesn't grow past preview-sized
  // on very wide layouts.
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(INITIAL_SCALE);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = (width: number) => {
      if (width <= 0) return;
      setScale(Math.min(width / FULL_WIDTH, MAX_SCALE));
    };
    update(el.clientWidth);
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) update(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} style={tokenStyle} className="w-full">
      <div
        className="rounded-2xl border border-line-strong overflow-hidden bg-paper shadow-[var(--shadow-gym-1)]"
        style={{
          width: FULL_WIDTH * scale,
          height: FULL_HEIGHT * scale,
          maxWidth: "100%",
        }}
      >
        <div
          style={{
            width: FULL_WIDTH,
            height: FULL_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <div className="flex h-full bg-paper">
            {/* ============ Sidebar (copied from components/admin/Sidebar.tsx) ============ */}
            <aside className="w-[248px] h-full bg-ink-900 text-paper flex flex-col border-r border-ink-700 shrink-0">
              <div className="h-1 bg-flame shrink-0" aria-hidden />
              <div className="p-6 border-b border-ink-700">
                <div className="flex items-center gap-2 font-display font-bold text-[1.25rem] text-paper">
                  {logoUrl ? (
                    <span className="w-8 h-8 rounded-[9px] overflow-hidden bg-paper-2 flex items-center justify-center shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logoUrl}
                        alt={academyName}
                        className="w-full h-full object-cover"
                      />
                    </span>
                  ) : (
                    <span className="w-8 h-8 rounded-[9px] bg-flame flex items-center justify-center shrink-0">
                      <Icon name="dumbbell" />
                    </span>
                  )}
                  <span className="truncate">{academyName}</span>
                </div>
                <div className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-300 mt-3">
                  {academyName} — Painel
                </div>
              </div>

              <nav className="flex-1 overflow-hidden px-3 py-6">
                <NavSection title="Principal" items={PRIMARY_NAV} />
                <NavSection
                  title="Configurações"
                  items={CONFIG_NAV}
                  className="mt-8"
                />
              </nav>

              <div className="border-t border-ink-700 p-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0 p-2 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-flame to-flame-dark flex items-center justify-center font-mono text-[0.78rem] font-semibold text-white shrink-0">
                      AC
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[0.9rem] font-semibold text-paper truncate">
                        Ana Costa
                      </div>
                      <div className="font-mono text-[0.68rem] uppercase tracking-[0.08em] text-ink-300">
                        Admin
                      </div>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-400 shrink-0">
                    <Icon name="log-out" size="lg" />
                  </div>
                </div>
              </div>
            </aside>

            {/* ============ Main column (Topbar + DRE body) ============ */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Topbar (copied from components/admin/Topbar.tsx) */}
              <header className="h-16 bg-paper/85 backdrop-blur-xl border-b border-line flex items-center gap-4 px-8 shrink-0">
                <h1 className="font-display text-[1.2rem] font-semibold text-ink-900 shrink-0">
                  DRE / Custos
                </h1>
                <div className="flex-1 max-w-[360px]">
                  <div className="relative">
                    <Icon
                      name="search"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                      size="lg"
                    />
                    <div className="w-full pl-10 pr-4 py-2 rounded-full bg-paper-2 text-[0.88rem] text-ink-400">
                      Buscar despesa…
                    </div>
                  </div>
                </div>
                <div className="flex-1" />
                <div className="relative w-10 h-10 rounded-full bg-paper-2 text-ink-700 flex items-center justify-center">
                  <Icon name="bell" size="lg" />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-flame" />
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-flame to-flame-dark text-white flex items-center justify-center font-mono text-[0.78rem] font-semibold">
                  AC
                </div>
              </header>

              {/* DRE page body (copied from app/admin/dre/page.tsx) */}
              <main className="flex-1 p-8 overflow-hidden">
                {/* PageHeader */}
                <div className="flex items-end justify-between gap-8 mb-8">
                  <div>
                    <h2 className="font-display text-[1.8rem] font-semibold text-ink-900 leading-tight">
                      Demonstrativo de Resultado
                    </h2>
                    <p className="font-mono text-[0.78rem] uppercase tracking-[0.1em] text-ink-400 mt-2">
                      Abril 2026 · Receitas, despesas e lucro líquido do mês
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-paper-2 text-ink-900 font-mono text-[0.78rem]">
                      <Icon name="arrow-left" />
                      Abril 2026
                      <Icon name="arrow-right" />
                    </div>
                    <div
                      className="inline-flex items-center gap-2 rounded-full font-medium px-[1.3rem] py-3 text-[0.92rem] text-white"
                      style={{ background: "var(--color-flame)" }}
                    >
                      <Icon name="plus" /> Nova despesa
                    </div>
                  </div>
                </div>

                {/* DRE hero */}
                <div className="grid grid-cols-3 gap-5 mb-8">
                  <HeroCard
                    variant="primary"
                    label="Receita bruta"
                    value="R$ 18.420"
                    icon="trending"
                  >
                    <div className="text-[0.82rem] mt-2 text-white/90 relative">
                      ↑ +8,2% vs março
                    </div>
                  </HeroCard>

                  <HeroCard
                    variant="secondary"
                    label="Total de despesas"
                    value="R$ 9.800"
                    icon="money"
                  >
                    <div className="text-[0.82rem] mt-2 text-white/90 relative">
                      R$ 7.500 fixos · R$ 2.300 variáveis
                    </div>
                  </HeroCard>

                  <HeroCard
                    variant="secondary"
                    label="Lucro líquido"
                    value="R$ 8.620"
                  >
                    <div className="mt-3 relative">
                      <div className="text-[0.78rem] text-white/85 mb-1.5">
                        Margem: 46.8%
                      </div>
                      <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                        <div
                          className="h-full bg-white/85 rounded-full"
                          style={{ width: "46.8%" }}
                        />
                      </div>
                    </div>
                  </HeroCard>
                </div>

                {/* Cashflow + category breakdown */}
                <div className="grid grid-cols-[1.3fr_1fr] gap-5 mb-8">
                  <Card className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-display text-[1.1rem] font-semibold text-ink-900">
                          Fluxo de caixa
                        </h3>
                        <p className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-400 mt-1">
                          Últimos 6 meses
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-[0.72rem] text-ink-500">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald" />{" "}
                          Receita
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-ink-900" />{" "}
                          Despesas
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-flame" />{" "}
                          Lucro
                        </span>
                      </div>
                    </div>
                    <div className="h-44">
                      <svg
                        className="w-full h-full"
                        viewBox="0 0 480 160"
                        preserveAspectRatio="none"
                      >
                        {[40, 80, 120].map((y) => (
                          <line
                            key={y}
                            x1={0}
                            x2={480}
                            y1={y}
                            y2={y}
                            stroke="var(--color-line)"
                            strokeWidth={1}
                          />
                        ))}
                        <polyline
                          points={buildPolyline(
                            CASH_FLOW.map((p) => p.revenue),
                            { width: 480, height: 160, pad: 16 },
                          )}
                          fill="none"
                          stroke="var(--color-emerald)"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <polyline
                          points={buildPolyline(
                            CASH_FLOW.map((p) => p.expenses),
                            { width: 480, height: 160, pad: 16 },
                          )}
                          fill="none"
                          stroke="var(--color-ink-900)"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <polyline
                          points={buildPolyline(
                            CASH_FLOW.map((p) => p.profit),
                            { width: 480, height: 160, pad: 16 },
                          )}
                          fill="none"
                          stroke="var(--color-flame)"
                          strokeWidth={2}
                          strokeDasharray="5 3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="flex justify-between mt-2 font-mono text-[0.7rem] text-ink-400">
                      {CASH_FLOW.map((p) => (
                        <span key={p.label}>{p.label}</span>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-display text-[1.1rem] font-semibold text-ink-900">
                      Despesas por categoria
                    </h3>
                    <p className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-400 mt-1 mb-5">
                      Abril 2026 · total R$ 9.800
                    </p>
                    <div className="flex flex-col gap-4">
                      {CATEGORY_BREAKDOWN.map((cat) => (
                        <div key={cat.label}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="text-[0.88rem] font-semibold text-ink-700">
                              {cat.label}
                            </div>
                            <div className="font-mono text-[0.78rem] text-ink-900">
                              {cat.amount}
                            </div>
                          </div>
                          <div className="h-2 bg-paper-2 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-flame to-flame-dark"
                              style={{ width: `${cat.percent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Expenses table */}
                <Card className="p-0 overflow-hidden">
                  <div className="flex items-center justify-between p-6 border-b border-line">
                    <div>
                      <h3 className="font-display text-[1.1rem] font-semibold text-ink-900">
                        Despesas do mês
                      </h3>
                      <p className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-400 mt-1">
                        Abril 2026 · {EXPENSE_ROWS.length} lançamentos
                      </p>
                    </div>
                    <div
                      className="inline-flex items-center gap-2 rounded-full font-medium px-[1.3rem] py-3 text-[0.92rem] text-white"
                      style={{ background: "var(--color-flame)" }}
                    >
                      <Icon name="plus" /> Nova despesa
                    </div>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-line bg-paper-50">
                        {[
                          "Descrição",
                          "Categoria",
                          "Tipo",
                          "Vencimento",
                          "Valor",
                          "Status",
                          "",
                        ].map((h) => (
                          <th
                            key={h || "actions"}
                            className="text-left px-6 py-3 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-400 font-medium"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {EXPENSE_ROWS.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-line/60 last:border-b-0"
                        >
                          <td className="px-6 py-4">
                            <div className="font-semibold text-ink-900 text-[0.9rem]">
                              {row.description}
                            </div>
                            {row.subtitle && (
                              <div className="font-mono text-[0.68rem] text-ink-400 mt-0.5">
                                {row.subtitle}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Pill tone="ink">{row.categoryLabel}</Pill>
                          </td>
                          <td className="px-6 py-4">
                            <Pill tone={row.type === "fixed" ? "sky" : "amber"}>
                              {TYPE_LABEL[row.type]}
                            </Pill>
                          </td>
                          <td className="px-6 py-4 font-mono text-[0.82rem] text-ink-500">
                            {row.dueDate}
                          </td>
                          <td className="px-6 py-4 font-mono text-[0.88rem] font-semibold text-ink-900">
                            {row.amount}
                          </td>
                          <td className="px-6 py-4">
                            <ExpenseStatusPill status={row.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-ink-500">
                              Ver
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavSection({
  title,
  items,
  className,
}: {
  title: string;
  items: typeof PRIMARY_NAV;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-400 px-3 mb-2">
        {title}
      </div>
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const active = item.href === ACTIVE_HREF;
          return (
            <li key={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-[0.6rem] rounded-lg text-[0.88rem] font-medium relative",
                  active
                    ? "bg-flame/10 text-flame border-l-2 border-flame pl-[10px]"
                    : "text-ink-300",
                )}
              >
                <Icon name={item.icon} size="lg" />
                <span className="flex-1">{item.label}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
