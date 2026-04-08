"use client";

import { Topbar } from "@/components/admin/Topbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { MetricCard } from "@/components/admin/MetricCard";
import { Avatar } from "@/components/admin/Avatar";
import {
  PaymentMethodLabel,
  StudentStatusPill,
} from "@/components/admin/StatusPill";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { useDashboard } from "@/lib/hooks";

export default function DashboardPage() {
  const { data, loading, error } = useDashboard();

  return (
    <>
      <Topbar title="Dashboard" />
      <main className="flex-1 p-8 max-[720px]:p-4">
        <PageHeader
          title="Visão geral"
          subtitle="Segunda-feira, 07 de abril de 2026"
          actions={
            <Button variant="ink" href="/admin/students">
              <Icon name="plus" /> Adicionar aluno
            </Button>
          }
        />

        {loading && <div className="text-ink-400">Carregando…</div>}
        {error && <div className="text-rose">{error.message}</div>}
        {data && (
          <>
            <div className="grid grid-cols-4 gap-5 max-[880px]:grid-cols-2 max-[540px]:grid-cols-1">
              {data.metrics.map((metric) => (
                <MetricCard
                  key={metric.id}
                  metric={metric}
                  icon={
                    <Icon
                      name={
                        metric.id === "students"
                          ? "users"
                          : metric.id === "mrr"
                            ? "money"
                            : metric.id === "overdue"
                              ? "chart"
                              : "calendar"
                      }
                    />
                  }
                />
              ))}
            </div>

            <div className="grid grid-cols-[1.5fr_1fr] gap-5 mt-8 max-[980px]:grid-cols-1">
              {/* Recent students */}
              <Card className="p-0 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-line">
                  <h3 className="font-display text-[1.1rem] font-semibold text-ink-900">
                    Alunos recentes
                  </h3>
                  <a
                    href="/admin/students"
                    className="text-[0.82rem] text-flame font-medium hover:underline"
                  >
                    Ver todos →
                  </a>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-line">
                        {["Aluno", "Plano", "Status", "Cadastro"].map((h) => (
                          <th
                            key={h}
                            className="text-left px-6 py-3 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-400 font-medium"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentStudents.map((s) => (
                        <tr
                          key={s.id}
                          className="border-b border-line/60 last:border-b-0 hover:bg-paper-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar
                                initials={s.initials}
                                color={s.avatarColor}
                              />
                              <div>
                                <div className="font-semibold text-[0.9rem] text-ink-900">
                                  {s.name}
                                </div>
                                <div className="text-[0.78rem] text-ink-400">
                                  {s.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[0.88rem] text-ink-600">
                            {s.plan}
                          </td>
                          <td className="px-6 py-4">
                            <StudentStatusPill status={s.status} />
                          </td>
                          <td className="px-6 py-4 font-mono text-[0.78rem] text-ink-500">
                            {s.joinedAt}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Side: today's classes */}
              <Card className="p-6">
                <h3 className="font-display text-[1.1rem] font-semibold text-ink-900 mb-1">
                  Aulas de hoje
                </h3>
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-400 mb-5">
                  {data.todayClasses.length} turmas programadas
                </p>
                <div className="flex flex-col gap-3">
                  {data.todayClasses.map((cls) => {
                    const fill = Math.round((cls.booked / cls.capacity) * 100);
                    return (
                      <div
                        key={cls.id}
                        className="p-3 rounded-xl border border-line bg-paper-50"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-semibold text-[0.88rem] text-ink-900 truncate">
                              {cls.name}
                            </div>
                            <div className="text-[0.76rem] text-ink-400">
                              {cls.instructor} · {cls.time}
                            </div>
                          </div>
                          <div className="font-mono text-[0.78rem] text-ink-700 shrink-0">
                            {cls.booked}/{cls.capacity}
                          </div>
                        </div>
                        <div className="h-[3px] bg-paper-3 rounded-full mt-2 overflow-hidden">
                          <div
                            className="h-full bg-flame rounded-full"
                            style={{ width: `${fill}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Upcoming payments */}
            <Card className="mt-5 p-0 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-line">
                <h3 className="font-display text-[1.1rem] font-semibold text-ink-900">
                  Próximas cobranças
                </h3>
                <a
                  href="/admin/finance"
                  className="text-[0.82rem] text-flame font-medium hover:underline"
                >
                  Ver financeiro →
                </a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-line">
                      {["Aluno", "Valor", "Vencimento", "Método"].map((h) => (
                        <th
                          key={h}
                          className="text-left px-6 py-3 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-400 font-medium"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.upcomingPayments.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-line/60 last:border-b-0 hover:bg-paper-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-[0.9rem] text-ink-900 font-semibold">
                          {p.student}
                        </td>
                        <td className="px-6 py-4 font-mono text-[0.9rem] text-ink-900">
                          {p.amount}
                        </td>
                        <td className="px-6 py-4 font-mono text-[0.82rem] text-ink-500">
                          {p.dueDate}
                        </td>
                        <td className="px-6 py-4">
                          <PaymentMethodLabel method={p.method} />
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
