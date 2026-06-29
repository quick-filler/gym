"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { graphql } from "@/gql";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Icon } from "@/components/ui/Icon";
import { LoadingState } from "@/components/ui/LoadingState";
import { USE_MOCKS } from "@/lib/config";
import { formatDate } from "@/lib/utils";
import { AssessmentDialog, type AssessmentRow } from "./AssessmentDialog";

const ADMIN_BODY_ASSESSMENTS = graphql(`
  query AdminBodyAssessments {
    bodyAssessments(pagination: { limit: 100 }) {
      documentId
      date
      instructor
      weight
      height
      bodyFat
      bmi
      notes
      measurements {
        chest
        waist
        hips
        arms
        thighs
        calves
        shoulders
      }
      student {
        documentId
        name
      }
    }
  }
`);

const DELETE_ASSESSMENT = graphql(`
  mutation AdminDeleteBodyAssessment($documentId: ID!) {
    deleteBodyAssessment(documentId: $documentId) {
      documentId
    }
  }
`);

const ADMIN_ASSESSMENT_REQUESTS = graphql(`
  query AdminAssessmentRequests {
    assessmentRequests(status: "pending") {
      documentId
      notes
      createdAt
      student {
        documentId
        name
      }
    }
  }
`);

const MEASURE_KEYS = [
  "chest",
  "waist",
  "hips",
  "arms",
  "thighs",
  "calves",
  "shoulders",
] as const;

const MOCK_ASSESSMENTS: AssessmentRow[] = [
  {
    documentId: "m1",
    date: "2026-06-01",
    instructor: "Rafael",
    weight: 78.4,
    height: 178,
    bodyFat: 18.2,
    bmi: 24.7,
    notes: null,
    measurements: null,
    student: { documentId: "s1", name: "João Silva" },
  },
  {
    documentId: "m2",
    date: "2026-05-01",
    instructor: "Rafael",
    weight: 80.1,
    height: 178,
    bodyFat: 19.5,
    bmi: 25.3,
    notes: null,
    measurements: null,
    student: { documentId: "s1", name: "João Silva" },
  },
];

const cell = (n: number | null, suffix = ""): string =>
  n == null ? "—" : `${n}${suffix}`;

export function AssessmentsTab() {
  const q = useQuery(ADMIN_BODY_ASSESSMENTS, {
    skip: USE_MOCKS,
    fetchPolicy: "cache-and-network",
  });
  const reqQ = useQuery(ADMIN_ASSESSMENT_REQUESTS, {
    skip: USE_MOCKS,
    fetchPolicy: "cache-and-network",
  });
  const [deleteAssessment] = useMutation(DELETE_ASSESSMENT, {
    refetchQueries: ["AdminBodyAssessments"],
  });

  const requests = USE_MOCKS
    ? []
    : (reqQ.data?.assessmentRequests ?? []).filter(
        (r): r is NonNullable<typeof r> => !!r,
      );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AssessmentRow | null>(null);
  const [deleting, setDeleting] = useState<AssessmentRow | null>(null);

  const rows: AssessmentRow[] = USE_MOCKS
    ? MOCK_ASSESSMENTS
    : (q.data?.bodyAssessments ?? [])
        .filter((a): a is NonNullable<typeof a> => !!a)
        .map((a) => ({
          documentId: a.documentId,
          date: a.date,
          instructor: a.instructor ?? null,
          weight: a.weight ?? null,
          height: a.height ?? null,
          bodyFat: a.bodyFat ?? null,
          bmi: a.bmi ?? null,
          notes: a.notes ?? null,
          measurements: a.measurements
            ? Object.fromEntries(
                MEASURE_KEYS.map((k) => [k, a.measurements?.[k] ?? null]),
              )
            : null,
          student: a.student
            ? { documentId: a.student.documentId, name: a.student.name }
            : null,
        }));

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (row: AssessmentRow) => {
    setEditing(row);
    setDialogOpen(true);
  };

  async function confirmDelete() {
    const target = deleting;
    setDeleting(null);
    if (!target || USE_MOCKS) return;
    await deleteAssessment({ variables: { documentId: target.documentId } });
  }

  return (
    <>
      {requests.length > 0 ? (
        <div className="mb-4 rounded-2xl border border-flame-100 bg-flame-50 p-4">
          <div className="font-semibold text-ink-900 text-[0.92rem] mb-1">
            {requests.length} solicitaç{requests.length > 1 ? "ões" : "ão"} de avaliação
          </div>
          <p className="text-[0.82rem] text-ink-500 mb-3">
            Estes alunos pediram uma avaliação. Registre abaixo — a solicitação é
            baixada automaticamente quando você cria a avaliação do aluno.
          </p>
          <div className="flex flex-wrap gap-2">
            {requests.map((r) => (
              <span
                key={r.documentId}
                className="inline-flex items-center rounded-full bg-white border border-line px-3 py-1 text-[0.8rem] font-medium text-ink-700"
              >
                {r.student?.name ?? "Aluno"}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between mb-4">
        <p className="text-[0.86rem] text-ink-500">
          Peso, altura, gordura e medidas dos alunos. O aluno vê no Perfil do app.
        </p>
        <Button variant="primary" onClick={openCreate}>
          <Icon name="plus" /> Nova avaliação
        </Button>
      </div>

      {q.loading && !q.data && !USE_MOCKS && <LoadingState />}
      {q.error && !USE_MOCKS && <div className="text-rose">{q.error.message}</div>}

      {rows.length === 0 && !q.loading ? (
        <Card className="p-12 text-center">
          <div className="font-display text-[1.2rem] font-semibold text-ink-900 mb-2">
            Nenhuma avaliação ainda
          </div>
          <p className="text-[0.9rem] text-ink-500">
            Clique em “Nova avaliação” para registrar o peso e as medidas de um aluno.
          </p>
        </Card>
      ) : rows.length > 0 ? (
        <Card className="p-0 overflow-x-auto">
          <table className="w-full text-[0.86rem] min-w-[640px]">
            <thead>
              <tr className="text-left text-ink-400 font-mono text-[0.7rem] uppercase tracking-[0.06em]">
                <th className="px-4 py-3 font-semibold">Aluno</th>
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 font-semibold">Peso</th>
                <th className="px-4 py-3 font-semibold">Altura</th>
                <th className="px-4 py-3 font-semibold">Gordura</th>
                <th className="px-4 py-3 font-semibold">IMC</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.documentId} className="border-t border-line">
                  <td className="px-4 py-3 font-medium text-ink-900">
                    {r.student?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-600">{formatDate(r.date)}</td>
                  <td className="px-4 py-3 text-ink-900 font-semibold">
                    {cell(r.weight, " kg")}
                  </td>
                  <td className="px-4 py-3 text-ink-600">{cell(r.height, " cm")}</td>
                  <td className="px-4 py-3 text-ink-600">{cell(r.bodyFat, "%")}</td>
                  <td className="px-4 py-3 text-ink-600">{cell(r.bmi)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        onClick={() => openEdit(r)}
                        aria-label={`Editar avaliação de ${r.student?.name ?? "aluno"}`}
                      >
                        <Icon name="edit" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setDeleting(r)}
                        aria-label={`Excluir avaliação de ${r.student?.name ?? "aluno"}`}
                      >
                        <Icon name="trash" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : null}

      <AssessmentDialog
        open={dialogOpen}
        editing={editing}
        assessments={rows}
        onClose={() => setDialogOpen(false)}
        onSaved={() => {
          if (!USE_MOCKS) {
            q.refetch();
            reqQ.refetch(); // creating an assessment auto-resolves the request
          }
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Excluir avaliação?"
        message={`A avaliação de ${deleting?.student?.name ?? "este aluno"} de ${
          deleting ? formatDate(deleting.date) : ""
        } será removida. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
      />
    </>
  );
}
