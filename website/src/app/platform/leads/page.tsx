"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Topbar } from "@/components/admin/Topbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

const LEADS = gql`
  query PlatformLeads($status: String, $page: Int) {
    leads(status: $status, page: $page, pageSize: 25) {
      items {
        documentId
        name
        email
        phone
        academyName
        studentCount
        message
        status
        planInterest
        notes
        createdAt
      }
      total
      page
      pageSize
    }
  }
`;

const UPDATE_LEAD = gql`
  mutation UpdateLead($documentId: ID!, $data: UpdateLeadInput!) {
    updateLead(documentId: $documentId, data: $data) {
      documentId
      status
      notes
      planInterest
    }
  }
`;

const STATUS_LABEL: Record<string, string> = {
  new: "Novo",
  contacted: "Contactado",
  demo_scheduled: "Demo agendada",
  converted: "Convertido",
  lost: "Perdido",
};

const STATUS_COLOR: Record<string, string> = {
  new: "bg-sky/10 text-sky",
  contacted: "bg-amber/10 text-amber",
  demo_scheduled: "bg-pine/10 text-pine",
  converted: "bg-emerald/10 text-emerald",
  lost: "bg-rose/10 text-rose",
};

const PLAN_LABEL: Record<string, string> = {
  starter: "Starter",
  business: "Business",
  pro: "Pro",
};

const STUDENT_COUNT_LABEL: Record<string, string> = {
  menos_de_50: "< 50",
  de_50_a_200: "50–200",
  de_200_a_500: "200–500",
  mais_de_500: "> 500",
  ainda_nao_abri: "Ainda não abri",
};

export default function PlatformLeadsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const { data, loading, refetch } = useQuery(LEADS, {
    variables: { status: statusFilter || undefined, page },
    fetchPolicy: "cache-and-network",
  });

  const [updateLead, { loading: saving }] = useMutation(UPDATE_LEAD, {
    onCompleted: () => {
      refetch();
      setSelected(null);
    },
  });

  const leads = data?.leads?.items ?? [];
  const total = data?.leads?.total ?? 0;
  const pageSize = data?.leads?.pageSize ?? 25;

  function openLead(lead: any) {
    setSelected(lead);
    setEditStatus(lead.status);
    setEditNotes(lead.notes ?? "");
  }

  function handleSave() {
    if (!selected) return;
    updateLead({
      variables: {
        documentId: selected.documentId,
        data: { status: editStatus, notes: editNotes },
      },
    });
  }

  return (
    <>
      <Topbar title="Leads" />
      <main className="flex-1 p-8 max-[720px]:p-4">
        <PageHeader
          title="Leads"
          subtitle={`${total} requisições de teste`}
        />

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <Select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-[0.82rem] w-48"
          >
            <option value="">Todos os status</option>
            {Object.entries(STATUS_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </Select>
        </div>

        {loading && <div className="text-ink-400">Carregando…</div>}

        <Card className="p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line bg-paper-50">
                {["Nome", "Academia", "Alunos", "Plano", "Status", "Data"].map((h) => (
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
              {leads.map((lead: any) => (
                <tr
                  key={lead.documentId}
                  onClick={() => openLead(lead)}
                  className="border-b border-line/60 last:border-b-0 hover:bg-paper-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="text-[0.9rem] font-semibold text-ink-900">{lead.name}</div>
                    <div className="text-[0.78rem] text-ink-400">{lead.email}</div>
                  </td>
                  <td className="px-6 py-4 text-[0.88rem] text-ink-700">
                    {lead.academyName ?? "—"}
                  </td>
                  <td className="px-6 py-4 font-mono text-[0.82rem] text-ink-500">
                    {lead.studentCount ? STUDENT_COUNT_LABEL[lead.studentCount] ?? lead.studentCount : "—"}
                  </td>
                  <td className="px-6 py-4">
                    {lead.planInterest ? (
                      <span className="font-mono text-[0.75rem] bg-ink-900/5 px-2 py-0.5 rounded-full">
                        {PLAN_LABEL[lead.planInterest]}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("font-mono text-[0.72rem] font-semibold px-2.5 py-1 rounded-full", STATUS_COLOR[lead.status])}>
                      {STATUS_LABEL[lead.status] ?? lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-[0.78rem] text-ink-400">
                    {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
              {!loading && leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-ink-400 text-[0.88rem]">
                    Nenhum lead encontrado.
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

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={() => setSelected(null)}>
          <div
            className="w-full max-w-[480px] h-screen bg-paper border-l border-line shadow-[var(--shadow-gym-3)] overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-line">
              <h2 className="font-display text-[1.1rem] font-semibold text-ink-900">
                {selected.name}
              </h2>
              <button onClick={() => setSelected(null)} className="text-ink-400 hover:text-ink-900">
                <Icon name="x" size="lg" />
              </button>
            </div>

            <div className="flex-1 p-6 flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-3 text-[0.85rem]">
                <Info label="E-mail" value={selected.email} />
                <Info label="Telefone" value={selected.phone ?? "—"} />
                <Info label="Academia" value={selected.academyName ?? "—"} />
                <Info label="Alunos" value={selected.studentCount ? STUDENT_COUNT_LABEL[selected.studentCount] : "—"} />
              </div>

              <div>
                <div className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-400 mb-1">Mensagem</div>
                <p className="text-[0.88rem] text-ink-700 bg-paper-50 rounded-xl p-4 border border-line">
                  {selected.message}
                </p>
              </div>

              <div>
                <label className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-400 block mb-1">
                  Status
                </label>
                <Select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                  {Object.entries(STATUS_LABEL).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-400 block mb-1">
                  Notas internas
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={4}
                  placeholder="Observações sobre o contato…"
                  className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-[0.88rem] text-ink-900 placeholder:text-ink-300 focus:outline-none focus:border-ink-900 resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-line">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-ink-900 text-paper font-semibold text-[0.88rem] py-3 rounded-xl hover:bg-ink-700 transition-colors disabled:opacity-50"
              >
                {saving ? "Salvando…" : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-400 mb-0.5">{label}</div>
      <div className="text-[0.88rem] text-ink-900">{value}</div>
    </div>
  );
}
