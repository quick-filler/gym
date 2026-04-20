"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { graphql } from "@/gql";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { USE_MOCKS } from "@/lib/config";
import { cn } from "@/lib/utils";

const CREATE_CLASS = graphql(`
  mutation AdminCreateClassSchedule($data: ClassScheduleInput!) {
    createClassSchedule(data: $data) {
      documentId
      name
      instructor
    }
  }
`);

const DAYS: Array<{ value: number; label: string }> = [
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
  { value: 0, label: "Dom" },
];

export function NewClassDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}) {
  const [name, setName] = useState("");
  const [instructor, setInstructor] = useState("");
  const [modality, setModality] = useState<"presential" | "online">(
    "presential",
  );
  const [weekdays, setWeekdays] = useState<number[]>([1, 3, 5]);
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("08:00");
  const [maxCapacity, setMaxCapacity] = useState("20");
  const [room, setRoom] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [createClass, { loading }] = useMutation(CREATE_CLASS);

  function reset() {
    setName("");
    setInstructor("");
    setModality("presential");
    setWeekdays([1, 3, 5]);
    setStartTime("07:00");
    setEndTime("08:00");
    setMaxCapacity("20");
    setRoom("");
    setError(null);
  }

  function toggleDay(d: number) {
    setWeekdays((cur) =>
      cur.includes(d) ? cur.filter((v) => v !== d) : [...cur, d].sort(),
    );
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

    if (weekdays.length === 0) {
      setError("Escolha ao menos um dia da semana.");
      return;
    }

    try {
      await createClass({
        variables: {
          data: {
            name,
            instructor: instructor || undefined,
            modality,
            weekdays,
            startTime,
            endTime,
            maxCapacity: Number(maxCapacity) || 20,
            room: room || undefined,
            isActive: true,
          },
        },
      });
      onCreated?.();
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar aula.");
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Nova aula"
      subtitle="Configure horário, capacidade e dias da semana. A grade é recorrente."
    >
      <form id="new-class-form" onSubmit={handleSubmit}>
        <Field label="Nome da turma">
          <Input
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="CrossFit — Turma 06h"
          />
        </Field>
        <Field label="Instrutor" help="Opcional">
          <Input
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
            placeholder="Carol M."
          />
        </Field>
        <Field label="Dias da semana">
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => {
              const active = weekdays.includes(d.value);
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDay(d.value)}
                  className={cn(
                    "w-12 h-10 rounded-full font-mono text-[0.75rem] font-semibold uppercase tracking-wider transition-colors",
                    active
                      ? "bg-ink-900 text-flame border border-ink-900"
                      : "bg-white text-ink-500 border border-line hover:border-ink-900",
                  )}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Início">
            <Input
              required
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </Field>
          <Field label="Fim">
            <Input
              required
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Capacidade máx.">
            <Input
              required
              type="number"
              min="1"
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(e.target.value)}
            />
          </Field>
          <Field label="Modalidade">
            <Select
              value={modality}
              onChange={(e) => setModality(e.target.value as typeof modality)}
            >
              <option value="presential">Presencial</option>
              <option value="online">Online</option>
            </Select>
          </Field>
        </div>
        <Field label="Sala" help="Opcional — ex. Sala 1, Piscina principal">
          <Input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Sala 1"
          />
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
          form="new-class-form"
          disabled={loading}
        >
          {loading ? "Criando…" : "Criar aula"}
          <Icon name="arrow-right" />
        </Button>
      </div>
    </Dialog>
  );
}
