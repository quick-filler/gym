"use client";

import { Topbar } from "@/components/admin/Topbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import type { DRECashFlowPoint, DREExpenseRow, ExpenseStatus } from "@/lib/types";
import { useDRE } from "@/lib/hooks";

const TYPE_LABEL = { fixed: "Fixo", variable: "Variável" } as const;

function ExpenseStatusPill({ status }: { status: ExpenseStatus }) {
  if (status === "paid") return <Pill tone="emerald">PAGO</Pill>;
  if (status === "pending") return <Pill tone="amber">PENDENTE</Pill>;
  return <Pill tone="sky">EM ABERTO</Pill>;
}

function buildPolyline(
  points: DRECashFlowPoint[],
  accessor: (p: DRECashFlowPoint) => number,
  { width, height, pad }: { width: number; height: number; pad: number },
): string {
  const values = points.map(accessor);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const stepX = (width - pad * 2) / Math.max(points.length - 1, 1);
  return values
    .map((v, i) => {
      const x = pad + i * stepX;
      const y = height - pad - ((v - min) / range) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export default function DREPage() {
  const { data, loading, error } = useDRE();

  return (
    <>
      <Topbar title="DRE / Custos" />
      <main className="flex-1 p-8 max-[720px]:p-4">
        <PageHeader
          title="Demonstrativo de Resultado"
          subtitle={
            data
              ? `${data.monthLabel} · Receitas, despesas e lucro líquido do mês`
              : undefined
          }
          actions={
            <>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-paper-2 text-ink-900 font-mono text-[0.78rem]">
                <button
                  className="text-ink-500 hover:text-ink-900"
                  aria-label="Mês anterior"
                >
                  <Icon name="arrow-left" />
                </button>
                {data?.monthLabel ?? "—"}
                <button
                  className="text-ink-500 hover:text-ink-900"
                  aria-label="Próximo mês"
                >
                  <Icon name="arrow-right" />
                </button>
              </div>
              <Button variant="ink">
                <Icon name="plus" /> Nova despesa
              </Button>
            </>
          }
        />

        {loading && <div className="text-ink-400">Carregando…</div>}
        {error && <div className="text-rose">{error.message}</div>}

        {data && (
          <>
            {/* DRE hero */}
            <div className="grid grid-cols-3 gap-5 max-[980px]:grid-cols-1 mb-8">
              <div className="rounded-[var(--radius-lg)] p-6 relative overflow-hidden bg-gradient-to-br from-emerald to-pine text-white shadow-[var(--shadow-gym-2)]">
                <div className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-white/75">
                  Receita bruta
                </div>
                <div className="font-display text-[2.2rem] font-semibold mt-3 leading-none">
                  {data.revenue.total}
                </div>
                <div className="text-[0.82rem] mt-2 text-white/90">
                  ↑ {data.revenue.deltaLabel}
                </div>
                <Icon
                  name="trending"
                  size="xl"
                  className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 text-white"
                />
              </div>
              <div className="rounded-[var(--radius-lg)] p-6 relative overflow-hidden bg-ink-900 text-paper border border-ink-700 shadow-[var(--shadow-gym-2)]">
                <div className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-300">
                  Total de despesas
                </div>
                <div className="font-display text-[2.2rem] font-semibold mt-3 leading-none text-paper">
                  {data.expenses.total}
                </div>
                <div className="text-[0.82rem] mt-2 text-ink-300">
                  {data.expenses.fixed} fixos · {data.expenses.variable} variáveis
                </div>
                <Icon
                  name="money"
                  size="xl"
                  className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 text-paper"
                />
              </div>
              <div className="rounded-[var(--radius-lg)] p-6 relative overflow-hidden bg-gradient-to-br from-flame to-flame-dark text-white shadow-[var(--shadow-gym-2)]">
                <div className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-white/80">
                  Lucro líquido
                </div>
                <div className="font-display text-[2.2rem] font-semibold mt-3 leading-none">
                  {data.profit.total}
                </div>
                <div className="mt-3">
                  <div className="text-[0.78rem] text-white/85 mb-1.5">
                    Margem: {data.profit.marginPercent.toFixed(1)}%
                  </div>
                  <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full bg-white/85 rounded-full transition-all"
                      style={{ width: `${data.profit.marginPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cashflow + category breakdown */}
            <div className="grid grid-cols-[1.3fr_1fr] gap-5 mb-8 max-[980px]:grid-cols-1">
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
                      <span className="w-2.5 h-2.5 rounded-full bg-flame" /> Lucro
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
                        data.cashFlow,
                        (p) => p.revenue,
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
                        data.cashFlow,
                        (p) => p.expenses,
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
                        data.cashFlow,
                        (p) => p.profit,
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
                  {data.cashFlow.map((p) => (
                    <span key={p.label}>{p.label}</span>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-display text-[1.1rem] font-semibold text-ink-900">
                  Despesas por categoria
                </h3>
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-400 mt-1 mb-5">
                  {data.monthLabel} · total {data.expensesTotalLabel}
                </p>
                <div className="flex flex-col gap-4">
                  {data.categoryBreakdown.map((cat) => (
                    <div key={cat.category}>
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
                    {data.monthLabel} · {data.expenseRows.length} lançamentos
                  </p>
                </div>
                <Button variant="ink">
                  <Icon name="plus" /> Nova despesa
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-line bg-paper-50">
                      {["Descrição", "Categoria", "Tipo", "Vencimento", "Valor", "Status", ""].map(
                        (h) => (
                          <th
                            key={h || "actions"}
                            className="text-left px-6 py-3 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-400 font-medium"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {data.expenseRows.map((row: DREExpenseRow) => (
                      <tr
                        key={row.id}
                        className="border-b border-line/60 last:border-b-0 hover:bg-paper-50 transition-colors"
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
                          <button className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-ink-500 hover:text-ink-900">
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </main>
    </>
  );
}
