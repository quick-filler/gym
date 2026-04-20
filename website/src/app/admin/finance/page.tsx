"use client";

import { useState } from "react";
import { useApolloClient } from "@apollo/client/react";
import { Topbar } from "@/components/admin/Topbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { MetricCard } from "@/components/admin/MetricCard";
import { Avatar } from "@/components/admin/Avatar";
import {
  PaymentMethodLabel,
  PaymentStatusPill,
} from "@/components/admin/StatusPill";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { useFinance } from "@/lib/hooks";
import { NewChargeDialog } from "./NewChargeDialog";

const METHOD_COLOR: Record<string, string> = {
  pix: "var(--color-flame)",
  credit_card: "var(--color-ink-900)",
  boleto: "var(--color-pine)",
};

export default function FinancePage() {
  const { data, loading, error } = useFinance();
  const [dialogOpen, setDialogOpen] = useState(false);
  const apollo = useApolloClient();

  return (
    <>
      <Topbar title="Financeiro" />
      <main className="flex-1 p-8 max-[720px]:p-4">
        <PageHeader
          title="Financeiro"
          subtitle="Abril 2026 · Atualizado agora"
          actions={
            <>
              <Button variant="line">
                <Icon name="download" /> Exportar CSV
              </Button>
              <Button variant="ink" onClick={() => setDialogOpen(true)}>
                <Icon name="plus" /> Nova cobrança
              </Button>
            </>
          }
        />

        {loading && <div className="text-ink-400">Carregando…</div>}
        {error && <div className="text-rose">{error.message}</div>}

        {data && (
          <>
            <div className="grid grid-cols-4 gap-5 max-[980px]:grid-cols-2 max-[540px]:grid-cols-1">
              {data.kpis.map((kpi) => (
                <MetricCard
                  key={kpi.id}
                  metric={kpi}
                  icon={
                    <Icon
                      name={
                        kpi.id === "revenue"
                          ? "money"
                          : kpi.id === "overdue"
                            ? "chart"
                            : kpi.id === "processed"
                              ? "zap"
                              : "trending"
                      }
                    />
                  }
                />
              ))}
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
                      {data.charges.length} registros
                    </p>
                  </div>
                  <button className="text-ink-400 hover:text-ink-900">
                    <Icon name="filter" size="lg" />
                  </button>
                </div>
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
                      {data.charges.map((c) => (
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
                  {data.methodBreakdown.map((m) => (
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
                            background: METHOD_COLOR[m.method],
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
