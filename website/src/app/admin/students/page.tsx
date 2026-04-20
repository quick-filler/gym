"use client";

import { useState } from "react";
import { Topbar } from "@/components/admin/Topbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { Avatar } from "@/components/admin/Avatar";
import {
  PaymentMethodLabel,
  StudentStatusPill,
} from "@/components/admin/StatusPill";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { useStudents } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import type { StudentStatus } from "@/lib/types";
import { useApolloClient } from "@apollo/client/react";
import { NewStudentDialog } from "./NewStudentDialog";

type Filter = "all" | StudentStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "suspended", label: "Suspensos" },
  { value: "inactive", label: "Inativos" },
];

export default function StudentsPage() {
  const { data, loading, error } = useStudents();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const apollo = useApolloClient();

  const filtered = (data ?? []).filter((s) => {
    if (filter !== "all" && s.status !== filter) return false;
    if (query && !`${s.name} ${s.email}`.toLowerCase().includes(query.toLowerCase()))
      return false;
    return true;
  });

  return (
    <>
      <Topbar title="Alunos" />
      <main className="flex-1 p-8 max-[720px]:p-4">
        <PageHeader
          title="Alunos"
          subtitle={`${data?.length ?? 0} cadastrados · atualizado agora`}
          actions={
            <Button variant="ink" onClick={() => setDialogOpen(true)}>
              <Icon name="plus" /> Adicionar aluno
            </Button>
          }
        />

        <NewStudentDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onCreated={() => apollo.refetchQueries({ include: ["Students"] })}
        />

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-4 py-2 rounded-full text-[0.82rem] font-medium transition-all font-mono uppercase tracking-[0.06em]",
                filter === f.value
                  ? "bg-ink-900 text-flame border border-ink-900"
                  : "bg-white border border-line text-ink-600 hover:border-ink-900",
              )}
            >
              {f.label}
            </button>
          ))}
          <div className="flex-1" />
          <div className="relative">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
              size="lg"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar aluno…"
              className="pl-10 pr-4 py-2 rounded-full bg-white border border-line text-[0.88rem] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-ink-900 transition-all w-[260px] max-[720px]:w-full"
            />
          </div>
        </div>

        {loading && <div className="text-ink-400">Carregando…</div>}
        {error && <div className="text-rose">{error.message}</div>}

        {filtered.length > 0 && (
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line bg-paper-50">
                    {[
                      "Aluno",
                      "Telefone",
                      "Plano",
                      "Status",
                      "Método",
                      "Próx. cobrança",
                      "",
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
                  {filtered.map((s) => (
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
                      <td className="px-6 py-4 font-mono text-[0.82rem] text-ink-600">
                        {s.phone}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[0.88rem] text-ink-900 font-semibold">
                          {s.plan}
                        </div>
                        <div className="font-mono text-[0.76rem] text-ink-400">
                          {s.planPrice}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StudentStatusPill status={s.status} />
                      </td>
                      <td className="px-6 py-4">
                        <PaymentMethodLabel method={s.paymentMethod} />
                      </td>
                      <td className="px-6 py-4 font-mono text-[0.82rem] text-ink-500">
                        {s.nextPayment}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-ink-400 hover:text-ink-900 transition-colors">
                          <Icon name="more" size="lg" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {!loading && filtered.length === 0 && (
          <Card className="text-center py-16">
            <div className="text-ink-400 mb-2">Nenhum aluno encontrado</div>
            <div className="text-[0.82rem] text-ink-300">
              Tente remover filtros ou limpar a busca
            </div>
          </Card>
        )}
      </main>
    </>
  );
}
