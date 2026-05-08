"use client";

import { useMemo, useState } from "react";
import { useApolloClient } from "@apollo/client/react";
import { Topbar } from "@/components/admin/Topbar";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { HeroCard } from "@/components/admin/HeroCard";
import { Avatar } from "@/components/admin/Avatar";
import {
  PaymentMethodLabel,
  PaymentStatusPill,
} from "@/components/admin/StatusPill";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Field";
import { useFinance } from "@/lib/hooks";
import { formatBRL } from "@/lib/utils";
import { NewChargeDialog } from "./NewChargeDialog";

const METHOD_DEFS = [
  { method: "pix", label: "PIX", color: "var(--color-flame)" },
  { method: "credit_card", label: "Cartão de crédito", color: "var(--color-ink-900)" },
  { method: "boleto", label: "Boleto", color: "var(--color-pine)" },
] as const;

const METHOD_LABEL: Record<string, string> = {
  pix: "PIX",
  credit_card: "Cartão de crédito",
  boleto: "Boleto",
};

const STATUS_LABEL: Record<string, string> = {
  paid: "Pago",
  pending: "Pendente",
  overdue: "Vencido",
  cancelled: "Cancelado",
};

const MONTHS_PT = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 4 }, (_, i) => CURRENT_YEAR - i);

export default function FinancePage() {
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterOpen, setFilterOpen] = useState(false);
  const { data, loading, error } = useFinance({ month: filterMonth, year: filterYear });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [query, setQuery] = useState("");
  const apollo = useApolloClient();

  const isCurrentPeriod = filterMonth === now.getMonth() + 1 && filterYear === now.getFullYear();
  const subtitle = `${MONTHS_PT[filterMonth - 1]} ${filterYear}${isCurrentPeriod ? " · Atualizado agora" : " · Filtrado"}`;

  function resetFilter() {
    setFilterMonth(now.getMonth() + 1);
    setFilterYear(now.getFullYear());
  }

  function exportCSV() {
    const charges = data?.charges ?? [];
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = [
      ["Aluno", "Valor (R$)", "Método", "Status", "Vencimento", "Pago em"].map(escape).join(";"),
      ...charges.map((c) =>
        [
          c.student,
          c.amount.toFixed(2).replace(".", ","),
          METHOD_LABEL[c.method] ?? c.method,
          STATUS_LABEL[c.status] ?? c.status,
          c.dueDate,
          c.paidAt ?? "",
        ].map(escape).join(";"),
      ),
    ];
    const blob = new Blob(["﻿" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cobrancas-${MONTHS_PT[filterMonth - 1]}-${filterYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredCharges = (data?.charges ?? []).filter(
    (c) => !query || c.student.toLowerCase().includes(query.toLowerCase()),
  );

  const methodBreakdown = useMemo(() => {
    const totals: Record<string, number> = { pix: 0, credit_card: 0, boleto: 0 };
    (data?.charges ?? []).forEach((c) => {
      totals[c.method] = (totals[c.method] ?? 0) + c.amount;
    });
    const total = Object.values(totals).reduce((a, b) => a + b, 0);
    return METHOD_DEFS.map((m) => ({
      method: m.method,
      label: m.label,
      color: m.color,
      amount: formatBRL(totals[m.method] ?? 0),
      percent: total > 0 ? Math.round(((totals[m.method] ?? 0) / total) * 100) : 0,
    }));
  }, [data?.charges]);

  return (
    <>
      <Topbar
        title="Financeiro"
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Buscar cobrança…"
      />
      <main className="flex-1 p-8 max-[720px]:p-4">
        <PageHeader
          title="Financeiro"
          subtitle={subtitle}
          actions={
            <>
              <Button variant="line" onClick={exportCSV} disabled={!data || data.charges.length === 0}>
                <Icon name="download" /> Exportar CSV
              </Button>
              <Button variant="primary" onClick={() => setDialogOpen(true)}>
                <Icon name="plus" /> Nova cobrança
              </Button>
            </>
          }
        />

        {loading && <LoadingState />}
        {error && <div className="text-rose">{error.message}</div>}

        {data && (
          <>
            <div className="grid grid-cols-4 gap-5 max-[980px]:grid-cols-2 max-[540px]:grid-cols-1">
              {data.kpis.map((kpi, idx) => {
                const iconName =
                  kpi.id === "revenue"
                    ? "money"
                    : kpi.id === "overdue"
                      ? "chart"
                      : kpi.id === "processed"
                        ? "zap"
                        : "trending";
                return (
                  <HeroCard
                    key={kpi.id}
                    variant={idx % 2 === 0 ? "primary" : "secondary"}
                    label={kpi.label}
                    value={kpi.value}
                    icon={iconName}
                  >
                    {kpi.delta && (
                      <div className="text-[0.82rem] mt-2 text-white/90 relative">
                        {kpi.delta.trend === "up"
                          ? "↑"
                          : kpi.delta.trend === "down"
                            ? "↓"
                            : "→"}{" "}
                        {kpi.delta.value}
                      </div>
                    )}
                  </HeroCard>
                );
              })}
            </div>

            <div className="grid grid-cols-[1.5fr_1fr] gap-5 mt-8 max-[980px]:grid-cols-1">
              {/* Charges table */}
              <Card className="p-0 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-line">
                  <div>
                    <h3 className="font-display text-[1.1rem] font-semibold text-ink-900">
                      Cobranças recentes
                    </h3>
                    <p className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-400 mt-1">
                      {filteredCharges.length} registros
                    </p>
                  </div>
                  <button
                    onClick={() => setFilterOpen((v) => !v)}
                    className={`transition-colors ${filterOpen || !isCurrentPeriod ? "text-flame" : "text-ink-400 hover:text-ink-900"}`}
                    title="Filtrar por período"
                  >
                    <Icon name="filter" size="lg" />
                  </button>
                </div>

                {filterOpen && (
                  <div className="flex items-center gap-3 px-6 py-3 border-b border-line bg-paper-50">
                    <Select
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(Number(e.target.value))}
                      className="text-[0.82rem] py-1.5"
                    >
                      {MONTHS_PT.map((m, i) => (
                        <option key={i} value={i + 1}>{m}</option>
                      ))}
                    </Select>
                    <Select
                      value={filterYear}
                      onChange={(e) => setFilterYear(Number(e.target.value))}
                      className="text-[0.82rem] py-1.5"
                    >
                      {YEAR_OPTIONS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </Select>
                    {!isCurrentPeriod && (
                      <button
                        onClick={resetFilter}
                        className="font-mono text-[0.72rem] text-ink-400 hover:text-ink-900 underline underline-offset-2 whitespace-nowrap"
                      >
                        Limpar filtro
                      </button>
                    )}
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-line bg-paper-50">
                        {[
                          "Aluno",
                          "Valor",
                          "Método",
                          "Status",
                          "Vencimento",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left px-6 py-3 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-400 font-medium"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCharges.map((c) => (
                        <tr
                          key={c.id}
                          className="border-b border-line/60 last:border-b-0 hover:bg-paper-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar initials={c.studentInitials} size="sm" />
                              <span className="text-[0.9rem] font-semibold text-ink-900">
                                {c.student}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-[0.9rem] font-semibold text-ink-900">
                            {c.amountFormatted}
                          </td>
                          <td className="px-6 py-4">
                            <PaymentMethodLabel method={c.method} />
                          </td>
                          <td className="px-6 py-4">
                            <PaymentStatusPill status={c.status} />
                          </td>
                          <td className="px-6 py-4 font-mono text-[0.82rem] text-ink-500">
                            {c.dueDate}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Method breakdown */}
              <Card className="p-6">
                <h3 className="font-display text-[1.1rem] font-semibold text-ink-900 mb-1">
                  Métodos de pagamento
                </h3>
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-400 mb-6">
                  Distribuição do mês
                </p>
                <div className="flex flex-col gap-5">
                  {methodBreakdown.map((m) => (
                    <div key={m.method}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[0.88rem] font-semibold text-ink-900">
                          {m.label}
                        </div>
                        <div className="font-mono text-[0.82rem] text-ink-700">
                          {m.amount}
                        </div>
                      </div>
                      <div className="h-2 bg-paper-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${m.percent}%`,
                            background: m.color,
                          }}
                        />
                      </div>
                      <div className="font-mono text-[0.7rem] text-ink-400 mt-1">
                        {m.percent}% do total
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-line">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-400">
                        Taxa Asaas
                      </div>
                      <div className="font-mono text-[0.78rem] text-ink-600 mt-1">
                        1,99% PIX · R$ 1,99 boleto
                      </div>
                    </div>
                    <Icon name="shield" className="text-emerald" size="lg" />
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}

        <NewChargeDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onCreated={() =>
            // DREOverview + AdminDashboard also aggregate payments, so
            // they need to refetch too — otherwise a new charge shows
            // up on the finance page but the dashboard KPIs drift
            // stale until the next hard reload.
            apollo.refetchQueries({
              include: [
                "FinanceOverview",
                "DREOverview",
                "AdminDashboard",
              ],
            })
          }
        />
      </main>
    </>
  );
}
