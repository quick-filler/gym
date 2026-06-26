"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { LoadingState } from "@/components/ui/LoadingState";
import { graphql } from "@/gql";
import { USE_MOCKS } from "@/lib/config";
import { UPDATE_WORKOUT_PLAN, WORKOUT_PLAN_BY_ID } from "@/lib/hooks";
import {
  ExerciseEditor,
  emptyExercise,
  type ExerciseDraft,
} from "./ExerciseEditor";

const STUDENTS_FOR_WORKOUT = graphql(`
  query StudentsForWorkoutEdit {
    students(pagination: { limit: 200 }) {
      documentId
      name
    }
  }
`);

function rawToDrafts(
  exercises: Array<{
    name?: string | null;
    sets?: number | null;
    reps?: number | null;
    load?: string | null;
    notes?: string | null;
  } | null> | null | undefined,
): ExerciseDraft[] {
  return (exercises ?? [])
    .filter((e): e is NonNullable<typeof e> => !!e)
    .map((e) => ({
      name: e.name ?? "",
      sets: e.sets ?? 0,
      reps: e.reps ?? 0,
      load: e.load ?? "",
      notes: e.notes ?? "",
    }));
}

export function EditWorkoutDialog({
  documentId,
  onClose,
  onUpdated,
}: {
  documentId: string | null;
  onClose: () => void;
  onUpdated?: () => void;
}) {
  const open = !!documentId;

  const { data, loading: fetching } = useQuery(WORKOUT_PLAN_BY_ID, {
    variables: { documentId: documentId ?? "" },
    skip: !documentId || USE_MOCKS,
  });
  const { data: studentsData } = useQuery(STUDENTS_FOR_WORKOUT, {
    skip: USE_MOCKS || !open,
  });
  const plan = data?.workoutPlan ?? null;

  const [name, setName] = useState("");
  const [students, setStudents] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const [instructor, setInstructor] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [exercises, setExercises] = useState<ExerciseDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [updateWorkout, { loading: saving }] =
    useMutation(UPDATE_WORKOUT_PLAN);

  useEffect(() => {
    if (!plan) return;
    setName(plan.name ?? "");
    setStudents(
      (plan.students ?? [])
        .filter((s): s is NonNullable<typeof s> => !!s)
        .map((s) => ({ id: s.documentId, name: s.name ?? "" })),
    );
    setInstructor(plan.instructor ?? "");
    setValidFrom(plan.validFrom ?? "");
    const drafts = rawToDrafts(plan.exercises);
    setExercises(drafts.length > 0 ? drafts : [emptyExercise()]);
    setError(null);
  }, [plan]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (USE_MOCKS) {
      onUpdated?.();
      onClose();
      return;
    }
    if (!documentId) return;

    const valid = exercises.filter((e) => e.name.trim());
    if (valid.length === 0) {
      setError("Adicione ao menos um exercício com nome.");
      return;
    }
    if (students.length === 0) {
      setError("A turma precisa de ao menos um aluno.");
      return;
    }
    try {
      // The student roster is editable (manyToMany) — sending `students`
      // replaces the whole set, so members can join or leave the activity.
      await updateWorkout({
        variables: {
          documentId,
          data: {
            name,
            instructor: instructor || null,
            validFrom: validFrom || null,
            students: students.map((s) => s.id),
            exercises: valid.map((ex) => ({
              name: ex.name.trim(),
              sets: ex.sets,
              reps: ex.reps,
              load: ex.load,
              notes: ex.notes?.trim() || undefined,
            })),
          },
        },
      });
      onUpdated?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar ficha.");
    }
  }

  const studentOptions =
    studentsData?.students
      ?.filter((s): s is NonNullable<typeof s> => !!s)
      .map((s) => ({ id: s.documentId, name: s.name })) ?? [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Editar ficha"
      subtitle="Edite a turma (alunos entram/saem), os exercícios e a validade."
      wide
    >
      {fetching && <LoadingState />}
      {!fetching && (
        <form id="edit-workout-form" onSubmit={handleSubmit}>
          <Field label="Nome da ficha">
            <Input
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Turma" help="Adicione ou remova alunos a qualquer momento.">
              <Combobox
                value=""
                onChange={(id) => {
                  const opt = studentOptions.find((s) => s.id === id);
                  if (opt && !students.some((s) => s.id === id)) {
                    setStudents((prev) => [...prev, { id: opt.id, name: opt.name }]);
                  }
                }}
                placeholder={
                  students.length ? "Adicionar aluno…" : "Selecione os alunos…"
                }
                searchPlaceholder="Buscar aluno"
                emptyMessage="Nenhum aluno"
                options={studentOptions
                  .filter((s) => !students.some((sel) => sel.id === s.id))
                  .map((s) => ({ id: s.id, label: s.name }))}
              />
            </Field>
            <Field label="Instrutor">
              <Input
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
              />
            </Field>
          </div>

          {students.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 -mt-1">
              {students.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 text-paper text-[0.78rem] font-medium pl-3 pr-2 py-1"
                >
                  {s.name}
                  <button
                    type="button"
                    onClick={() =>
                      setStudents((prev) => prev.filter((x) => x.id !== s.id))
                    }
                    aria-label={`Remover ${s.name}`}
                    className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-paper/20 transition-colors"
                  >
                    <Icon name="x" size="sm" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <Field label="Válido a partir de">
            <Input
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
            />
          </Field>
          <Field
            label="Exercícios"
            help="Reordene com as setas e clique em Nota para adicionar uma instrução opcional."
          >
            <ExerciseEditor value={exercises} onChange={setExercises} />
          </Field>
          {error && (
            <div className="text-[0.82rem] text-rose mb-3">{error}</div>
          )}
        </form>
      )}

      <div className="flex items-center justify-end gap-3 -mt-3">
        <Button variant="ghost" onClick={onClose} type="button">
          Cancelar
        </Button>
        <Button
          variant="ink"
          type="submit"
          form="edit-workout-form"
          disabled={saving || fetching}
        >
          {saving ? "Salvando…" : "Salvar"}
          <Icon name="arrow-right" />
        </Button>
      </div>
    </Dialog>
  );
}
