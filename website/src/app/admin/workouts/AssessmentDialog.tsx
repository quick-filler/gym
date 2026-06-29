"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { graphql } from "@/gql";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { USE_MOCKS } from "@/lib/config";

/** A row from the `bodyAssessments` listing — also the edit payload. */
export interface AssessmentRow {
  documentId: string;
  date: string;
  instructor: string | null;
  weight: number | null;
  height: number | null;
  bodyFat: number | null;
  bmi: number | null;
  notes: string | null;
  measurements: Record<string, number | null> | null;
  student: { documentId: string; name: string } | null;
}

const STUDENTS_FOR_ASSESSMENT = graphql(`
  query StudentsForAssessment {
    students(pagination: { limit: 200 }) {
      documentId
      name
    }
  }
`);

const CREATE_ASSESSMENT = graphql(`
  mutation AdminCreateBodyAssessment($data: BodyAssessmentInput!) {
    createBodyAssessment(data: $data) {
      documentId
    }
  }
`);

const UPDATE_ASSESSMENT = graphql(`
  mutation AdminUpdateBodyAssessment(
    $documentId: ID!
    $data: BodyAssessmentUpdateInput!
  ) {
    updateBodyAssessment(documentId: $documentId, data: $data) {
      documentId
    }
  }
`);

const MEASURE: Array<{ key: string; label: string }> = [
  { key: "chest", label: "Peito" },
  { key: "waist", label: "Cintura" },
  { key: "hips", label: "Quadril" },
  { key: "arms", label: "Braços" },
  { key: "thighs", label: "Coxas" },
  { key: "calves", label: "Panturrilhas" },
  { key: "shoulders", label: "Ombros" },
];

const numStr = (n: number | null | undefined): string => (n == null ? "" : String(n));

/** Parse a pt-BR-friendly number ("72,5") to a float, or undefined when blank. */
function numOrUndef(s: string): number | undefined {
  const v = parseFloat(String(s).replace(",", "."));
  return Number.isFinite(v) ? v : undefined;
}

function measurementsToStrings(
  m: Record<string, number | null> | null | undefined,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const { key } of MEASURE) out[key] = numStr(m?.[key] ?? null);
  return out;
}

function buildMeasurements(
  m: Record<string, string>,
): Record<string, number> | undefined {
  const out: Record<string, number> = {};
  let any = false;
  for (const { key } of MEASURE) {
    const v = numOrUndef(m[key] ?? "");
    if (v !== undefined) {
      out[key] = v;
      any = true;
    }
  }
  return any ? out : undefined;
}

export function AssessmentDialog({
  open,
  onClose,
  onSaved,
  editing,
  assessments,
}: {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  /** When set, the dialog edits this assessment (student is locked). */
  editing?: AssessmentRow | null;
  /** Existing assessments (date-desc) — used to prefill from the student's last one. */
  assessments?: AssessmentRow[];
}) {
  const today = new Date().toISOString().slice(0, 10);
  const isEdit = !!editing;
  const { data: studentsData } = useQuery(STUDENTS_FOR_ASSESSMENT, {
    skip: USE_MOCKS || !open,
  });

  const [studentId, setStudentId] = useState("");
  const [date, setDate] = useState(today);
  const [instructor, setInstructor] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [m, setM] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState(false);

  const [createAssessment, createState] = useMutation(CREATE_ASSESSMENT);
  const [updateAssessment, updateState] = useMutation(UPDATE_ASSESSMENT);
  const saving = createState.loading || updateState.loading;

  // When a student is picked (create mode), seed the metric fields from their
  // most recent assessment — the values usually change incrementally, so the
  // instructor just tweaks what moved. Date stays "today". Clears when the
  // student has no prior assessment.
  const onSelectStudent = (id: string) => {
    setStudentId(id);
    const last = (assessments ?? []).find((a) => a.student?.documentId === id);
    setInstructor(last?.instructor ?? "");
    setWeight(numStr(last?.weight ?? null));
    setHeight(numStr(last?.height ?? null));
    setBodyFat(numStr(last?.bodyFat ?? null));
    setM(measurementsToStrings(last?.measurements ?? null));
    setPrefilled(!!last);
  };

  // Hydrate on open: prefill from `editing`, or reset for a new assessment.
  useEffect(() => {
    if (!open) return;
    setError(null);
    setPrefilled(false);
    if (editing) {
      setStudentId(editing.student?.documentId ?? "");
      setDate(editing.date ?? today);
      setInstructor(editing.instructor ?? "");
      setWeight(numStr(editing.weight));
      setHeight(numStr(editing.height));
      setBodyFat(numStr(editing.bodyFat));
      setM(measurementsToStrings(editing.measurements));
      setNotes(editing.notes ?? "");
    } else {
      setStudentId("");
      setDate(today);
      setInstructor("");
      setWeight("");
      setHeight("");
      setBodyFat("");
      setM({});
      setNotes("");
    }
    // editing/today read once per open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (USE_MOCKS) {
      onSaved?.();
      onClose();
      return;
    }
    if (!isEdit && !studentId) {
      setError("Selecione o aluno.");
      return;
    }
    if (!date) {
      setError("Informe a data da avaliação.");
      return;
    }

    const common = {
      date,
      instructor: instructor.trim() || undefined,
      weight: numOrUndef(weight),
      height: numOrUndef(height),
      bodyFat: numOrUndef(bodyFat),
      measurements: buildMeasurements(m),
      notes: notes.trim() || undefined,
    };

    try {
      if (isEdit && editing) {
        await updateAssessment({
          variables: { documentId: editing.documentId, data: common },
        });
      } else {
        await createAssessment({
          variables: { data: { student: studentId, ...common } },
        });
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar a avaliação.");
    }
  }

  const studentOptions =
    studentsData?.students
      ?.filter((s): s is NonNullable<typeof s> => !!s)
      .map((s) => ({ id: s.documentId, label: s.name })) ?? [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar avaliação física" : "Nova avaliação física"}
      subtitle="Registre peso, altura, gordura e medidas. O aluno vê no Perfil do app."
      wide
    >
      <form id="assessment-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Aluno">
            {isEdit ? (
              <Input value={editing?.student?.name ?? "—"} disabled readOnly />
            ) : (
              <Combobox
                value={studentId}
                onChange={onSelectStudent}
                placeholder="Selecione o aluno…"
                searchPlaceholder="Buscar aluno"
                emptyMessage="Nenhum aluno"
                options={studentOptions}
              />
            )}
            {prefilled ? (
              <p className="text-[0.78rem] text-ink-400 mt-1.5">
                Preenchido com a última avaliação — ajuste o que mudou.
              </p>
            ) : null}
          </Field>
          <Field label="Data">
            <Input
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Peso (kg)">
            <Input
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="72,5"
            />
          </Field>
          <Field label="Altura (cm)">
            <Input
              inputMode="decimal"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="178"
            />
          </Field>
          <Field label="Gordura (%)">
            <Input
              inputMode="decimal"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              placeholder="18,4"
            />
          </Field>
        </div>

        <Field label="Instrutor">
          <Input
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
            placeholder="Rafael"
          />
        </Field>

        <Field label="Medidas (cm)" help="Opcional — circunferências corporais.">
          <div className="grid grid-cols-3 gap-3 max-[520px]:grid-cols-2">
            {MEASURE.map(({ key, label }) => (
              <Input
                key={key}
                inputMode="decimal"
                value={m[key] ?? ""}
                onChange={(e) => setM((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={label}
                aria-label={label}
              />
            ))}
          </div>
        </Field>

        <Field label="Observações">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas da avaliação (opcional)"
            rows={2}
          />
        </Field>

        {error && <div className="text-[0.82rem] text-rose mb-3">{error}</div>}
      </form>

      <div className="flex items-center justify-end gap-3 -mt-3">
        <Button variant="ghost" onClick={onClose} type="button">
          Cancelar
        </Button>
        <Button variant="ink" type="submit" form="assessment-form" disabled={saving}>
          {saving ? "Salvando…" : isEdit ? "Salvar" : "Criar avaliação"}
          <Icon name="arrow-right" />
        </Button>
      </div>
    </Dialog>
  );
}
