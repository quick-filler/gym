"use client";

import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Topbar } from "@/components/admin/Topbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { MetricCard } from "@/components/admin/MetricCard";
import { Icon } from "@/components/ui/Icon";

const PLATFORM_DASHBOARD = gql`
  query PlatformDashboard {
    platformDashboard {
      totalAcademies
      activeAcademies
      totalStudents
      mrr
      openLeads
      leadsThisMonth
    }
  }
`;

type PlatformDashboardData = {
  platformDashboard: {
    totalAcademies: number;
    activeAcademies: number;
    totalStudents: number;
    mrr: string;
    openLeads: number;
    leadsThisMonth: number;
  };
};

export default function PlatformDashboardPage() {
  const { data, loading, error } = useQuery<PlatformDashboardData>(PLATFORM_DASHBOARD, {
    fetchPolicy: "cache-and-network",
  });

  const d = data?.platformDashboard;

  const kpis = d
    ? [
        {
          id: "academies",
          label: "Academias ativas",
          value: String(d.activeAcademies),
          highlighted: true,
          delta: { value: `${d.totalAcademies} no total`, trend: "up" as const },
        },
        {
          id: "students",
          label: "Alunos ativos",
          value: String(d.totalStudents),
        },
        {
          id: "mrr",
          label: "MRR do mês",
          value: d.mrr,
        },
        {
          id: "leads",
          label: "Leads em aberto",
          value: String(d.openLeads),
          delta: { value: `${d.leadsThisMonth} este mês`, trend: "up" as const },
        },
      ]
    : [];

  return (
    <>
      <Topbar title="Plataforma" />
      <main className="flex-1 p-8 max-[720px]:p-4">
        <PageHeader
          title="Dashboard"
          subtitle="Visão geral da plataforma"
        />

        {loading && <div className="text-ink-400">Carregando…</div>}
        {error && <div className="text-rose">{error.message}</div>}

        {d && (
          <div className="grid grid-cols-4 gap-5 max-[980px]:grid-cols-2 max-[540px]:grid-cols-1">
            {kpis.map((kpi) => (
              <MetricCard
                key={kpi.id}
                metric={kpi}
                icon={
                  <Icon
                    name={
                      kpi.id === "academies"
                        ? "trending"
                        : kpi.id === "students"
                          ? "users"
                          : kpi.id === "mrr"
                            ? "money"
                            : "chart"
                    }
                  />
                }
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
