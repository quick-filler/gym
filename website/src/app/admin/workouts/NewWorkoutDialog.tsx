"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { graphql } from "@/gql";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { USE_MOCKS } from "@/lib/config";
import {
  ExerciseEditor,
  emptyExercise,
  type ExerciseDraft,
} from "./ExerciseEditor";

const STUDENTS_FOR_WORKOUT = graphql(`
  query StudentsForWorkout {
    students(pagination: { limit: 200 }) {
      documentId
      name
    }
  }
`);

const CREATE_WORKOUT = graphql(`
  mutation AdminCreateWorkoutPlan($data: WorkoutPlanInput!) {
    createWorkoutPlan(data: $data) {
      documentId
      name
    }
  }
`);

export function NewWorkoutDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: studentsData } = useQuery(STUDENTS_FOR_WORKOUT, {
    skip: USE_MOCKS || !open,
  });

  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [instructor, setInstructor] = useState("");
  const [validFrom, setValidFrom] = useState(today);
  const [exercises, setExercises] = useState<ExerciseDraft[]>(() => [
    emptyExercise(),
  ]);
  const [error, setError] = useState<string | null>(null);
  const [createWorkout, { loading }] = useMutation(CREATE_WORKOUT);

  function reset() {
    setName("");
    setStudentId("");
    setInstructor("");
    setValidFrom(today);
    setExercises([emptyExercise()]);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (USE_MOCKS) {
      onCreated?.();
      reset();
      onClose();
      return;
    }

    const valid = exercises.filter((e) => e.name.trim());
    if (valid.length === 0) {
      setError("Adicione ao menos um exercício com nome.");
      return;
    }
    if (!studentId) {
      setError("Selecione um aluno.");
      return;
    }

    try {
      await createWorkout({
        variables: {
          data: {
            name,
            instructor: instructor || undefined,
            student: studentId,
            validFrom,
            isActive: true,
            exercises: valid.map((e) => ({
              name: e.name.trim(),
              sets: e.sets,
              reps: e.reps,
              load: e.load,
              notes: e.notes?.trim() || undefined,
            })),
          },
        },
      });
      onCreated?.();
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar ficha.");
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
      title="Nova ficha de treino"
      subtitle="Defina os exercícios, séries e cargas. O aluno vê a ficha no app."
      wide
    >
      <form id="new-workout-form" onSubmit={handleSubmit}>
        <Field label="Nome da ficha">
          <Input
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Treino A — Peito e Tríceps"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Aluno">
            <Combobox
              required
              value={studentId}
              onChange={setStudentId}
              placeholder="Selecione um aluno…"
              searchPlaceholder="Buscar aluno"
              emptyMessage="Nenhum aluno"
              options={studentOptions.map((s) => ({
                id: s.id,
                label: s.name,
              }))}
            />
          </Field>
          <Field label="Instrutor">
            <Input
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              placeholder="Rafael"
            />
          </Field>
        </div>
        <Field label="Válido a partir de">
          <Input
            required
            type="date"
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
          />
        </Field>
        <Field
          label="Exercícios"
          help="Use as setas para reordenar e clique em Nota para adicionar uma instrução opcional."
        >
          <ExerciseEditor value={exercises} onChange={setExercises} />
        </Field>
        {error && <div className="text-[0.82rem] text-rose mb-3">{error}</div>}
      </form>

      <div className="flex items-center justify-end gap-3 -mt-3">
        <Button variant="ghost" onClick={onClose} type="button">
          Cancelar
        </Button>
        <Button
          variant="ink"
          type="submit"
          form="new-workout-form"
          disabled={loading}
        >
          {loading ? "Criando…" : "Criar ficha"}
          <Icon name="arrow-right" />
        </Button>
      </div>
    </Dialog>
  );
}
