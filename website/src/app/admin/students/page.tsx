"use client";

import { useState } from "react";
import { Topbar } from "@/components/admin/Topbar";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { Avatar } from "@/components/admin/Avatar";
import {
  PaymentMethodLabel,
  StudentStatusPill,
} from "@/components/admin/StatusPill";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import { useStudents } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import type { StudentRow, StudentStatus } from "@/lib/types";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { graphql } from "@/gql";
import { NewStudentDialog } from "./NewStudentDialog";
import { EditStudentDialog } from "./EditStudentDialog";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Pill } from "@/components/ui/Pill";

type Filter = "all" | StudentStatus | "no_plan";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "suspended", label: "Suspensos" },
  { value: "inactive", label: "Inativos" },
  { value: "no_plan", label: "Sem plano" },
];

const UPDATE_STUDENT_STATUS = graphql(`
  mutation AdminUpdateStudentStatus(
    $documentId: ID!
    $data: StudentUpdateInput!
  ) {
    updateStudent(documentId: $documentId, data: $data) {
      documentId
      status
    }
  }
`);

const DELETE_STUDENT = graphql(`
  mutation AdminDeleteStudent($documentId: ID!) {
    deleteStudent(documentId: $documentId) {
      documentId
    }
  }
`);

export default function StudentsPage() {
  const { data, loading, error } = useStudents();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<{
    id: string;
    focusPlan: boolean;
  } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<StudentRow | null>(null);
  const apollo = useApolloClient();
  const [updateStatus] = useMutation(UPDATE_STUDENT_STATUS);
  const [deleteStudent, { loading: deleting }] = useMutation(DELETE_STUDENT);
  const refreshList = () =>
    apollo.refetchQueries({ include: ["Students"] });

  async function toggleStatus(row: StudentRow) {
    const next: StudentStatus =
      row.status === "suspended" ? "active" : "suspended";
    await updateStatus({
      variables: { documentId: row.id, data: { status: next } },
    });
    refreshList();
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    await deleteStudent({ variables: { documentId: confirmDelete.id } });
    setConfirmDelete(null);
    refreshList();
  }

  function copyEmail(row: StudentRow) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(row.email);
    }
  }

  const filtered = (data ?? []).filter((s) => {
    if (filter === "no_plan") {
      // hasActiveEnrollment é opcional — undefined nos mocks legados
      // assume "tem plano", então filtra só quem está explicitamente em false.
      if (s.hasActiveEnrollment !== false) return false;
    } else if (filter !== "all" && s.status !== filter) {
      return false;
    }
    if (query && !`${s.name} ${s.email}`.toLowerCase().includes(query.toLowerCase()))
      return false;
    return true;
  });

  return (
    <>
      <Topbar
        title="Alunos"
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Buscar aluno…"
      />
      <main className="flex-1 p-8 max-[720px]:p-4">
        <PageHeader
          title="Alunos"
          subtitle={`${data?.length ?? 0} cadastrados · atualizado agora`}
          actions={
            <div className="flex items-center gap-2">
              <Link
                href="/admin/students/import"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-line-strong text-ink-700 font-mono uppercase text-[0.78rem] tracking-[0.06em] hover:border-ink-900 hover:text-ink-900 transition-colors"
              >
                <Icon name="upload" /> Importar planilha
              </Link>
              <Button variant="primary" onClick={() => setDialogOpen(true)}>
                <Icon name="plus" /> Adicionar aluno
              </Button>
            </div>
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
                "px-4 py-2 rounded-full text-[0.82rem] font-medium transition-all font-mono uppercase tracking-[0.06em] border",
                filter === f.value
                  ? "bg-flame text-white border-flame"
                  : "bg-white border-line text-ink-600 hover:border-flame hover:text-flame",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && <LoadingState />}
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
                        {s.hasActiveEnrollment === false ? (
                          <button
                            type="button"
                            onClick={() =>
                              setEditTarget({ id: s.id, focusPlan: true })
                            }
                            className="inline-flex"
                            title="Vincular plano"
                          >
                            <Pill tone="amber">+ Atribuir plano</Pill>
                          </button>
                        ) : (
                          <>
                            <div className="text-[0.88rem] text-ink-900 font-semibold">
                              {s.plan}
                            </div>
                            <div className="font-mono text-[0.76rem] text-ink-400">
                              {s.planPrice}
                            </div>
                          </>
                        )}
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
                        <DropdownMenu
                          trigger={
                            <button
                              type="button"
                              aria-label={`Ações para ${s.name}`}
                              className="text-ink-400 hover:text-ink-900 transition-colors p-1 -m-1 rounded"
                            >
                              <Icon name="more" size="lg" />
                            </button>
                          }
                          items={[
                            {
                              label: "Editar",
                              icon: "edit",
                              onSelect: () =>
                                setEditTarget({ id: s.id, focusPlan: false }),
                            },
                            ...(s.hasActiveEnrollment === false
                              ? [
                                  {
                                    label: "Atribuir plano",
                                    icon: "plus",
                                    onSelect: () =>
                                      setEditTarget({
                                        id: s.id,
                                        focusPlan: true,
                                      }),
                                  } as const,
                                ]
                              : []),
                            {
                              label: "Copiar e-mail",
                              icon: "mail",
                              onSelect: () => copyEmail(s),
                            },
                            {
                              label:
                                s.status === "suspended"
                                  ? "Reativar"
                                  : "Suspender",
                              icon:
                                s.status === "suspended" ? "check" : "lock",
                              onSelect: () => void toggleStatus(s),
                            },
                            {
                              label: "Excluir",
                              icon: "trash",
                              tone: "danger",
                              onSelect: () => setConfirmDelete(s),
                            },
                          ]}
                        />
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

        <EditStudentDialog
          open={!!editTarget}
          documentId={editTarget?.id ?? null}
          focusPlan={editTarget?.focusPlan ?? false}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            refreshList();
          }}
        />

        <ConfirmDialog
          open={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={handleDelete}
          loading={deleting}
          tone="danger"
          title="Excluir aluno?"
          message={
            confirmDelete
              ? `${confirmDelete.name} será removido permanentemente. Matrículas, cobranças e histórico continuam no banco — apenas o aluno deixa de aparecer na listagem.`
              : ""
          }
          confirmLabel="Excluir"
        />
      </main>
    </>
  );
}
