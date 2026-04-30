"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Topbar } from "@/components/admin/Topbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const ALL_ACADEMIES = gql`
  query AllAcademies($page: Int) {
    allAcademies(page: $page, pageSize: 20) {
      items {
        documentId
        name
        slug
        plan
        isActive
        email
        studentCount
        createdAt
      }
      total
    }
  }
`;

const PLAN_LABEL: Record<string, string> = {
  starter: "Starter",
  business: "Business",
  pro: "Pro",
};

const PLAN_COLOR: Record<string, string> = {
  starter: "bg-ink-50 text-ink-500",
  business: "bg-flame/10 text-flame",
  pro: "bg-pine/10 text-pine",
};

export default function PlatformAcademiesPage() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const { data, loading } = useQuery(ALL_ACADEMIES, {
    variables: { page },
    fetchPolicy: "cache-and-network",
  });

  const academies = (data?.allAcademies?.items ?? []).filter(
    (a: any) =>
      !query ||
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.slug.toLowerCase().includes(query.toLowerCase()),
  );
  const total = data?.allAcademies?.total ?? 0;
  const pageSize = 20;

  return (
    <>
      <Topbar
        title="Academias"
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Buscar academia…"
      />
      <main className="flex-1 p-8 max-[720px]:p-4">
        <PageHeader title="Academias" subtitle={`${total} academias cadastradas`} />

        {loading && <div className="text-ink-400">Carregando…</div>}

        <Card className="p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line bg-paper-50">
                {["Academia", "Slug", "Plano", "Alunos ativos", "Status", "Desde"].map((h) => (
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
              {academies.map((a: any) => (
                <tr
                  key={a.documentId}
                  className="border-b border-line/60 last:border-b-0 hover:bg-paper-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="text-[0.9rem] font-semibold text-ink-900">{a.name}</div>
                    {a.email && (
                      <div className="text-[0.78rem] text-ink-400">{a.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-[0.82rem] text-ink-500">
                    {a.slug}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "font-mono text-[0.72rem] font-semibold px-2.5 py-1 rounded-full",
                        PLAN_COLOR[a.plan] ?? "bg-ink-50 text-ink-500",
                      )}
                    >
                      {PLAN_LABEL[a.plan] ?? a.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-[0.88rem] text-ink-700">
                    {a.studentCount}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "font-mono text-[0.72rem] font-semibold px-2.5 py-1 rounded-full",
                        a.isActive
                          ? "bg-emerald/10 text-emerald"
                          : "bg-rose/10 text-rose",
                      )}
                    >
                      {a.isActive ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-[0.78rem] text-ink-400">
                    {new Date(a.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
              {!loading && academies.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-ink-400 text-[0.88rem]"
                  >
                    Nenhuma academia encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {total > pageSize && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-line">
              <span className="font-mono text-[0.75rem] text-ink-400">
                Página {page} de {Math.ceil(total / pageSize)}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded-lg border border-line text-[0.82rem] disabled:opacity-40 hover:bg-paper-50 transition-colors"
                >
                  Anterior
                </button>
                <button
                  disabled={page >= Math.ceil(total / pageSize)}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-line text-[0.82rem] disabled:opacity-40 hover:bg-paper-50 transition-colors"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </Card>
      </main>
    </>
  );
}
