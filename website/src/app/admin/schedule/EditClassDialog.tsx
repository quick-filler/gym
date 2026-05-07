"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { LoadingState } from "@/components/ui/LoadingState";
import { USE_MOCKS } from "@/lib/config";
import { CLASS_SCHEDULE_BY_ID, UPDATE_CLASS_SCHEDULE } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { ConflictWarning } from "./ConflictWarning";

const DAYS: Array<{ value: number; label: string }> = [
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
  { value: 0, label: "Dom" },
];

export function EditClassDialog({
  documentId,
  onClose,
  onUpdated,
}: {
  documentId: string | null;
  onClose: () => void;
  onUpdated?: () => void;
}) {
  const open = !!documentId;

  // Fetch the full schedule for the form. Skip when closed or in mock mode
  // — mock mode treats edit as a no-op (in-shape, not real persistence).
  const { data, loading: fetching } = useQuery(CLASS_SCHEDULE_BY_ID, {
    variables: { documentId: documentId ?? "" },
    skip: !documentId || USE_MOCKS,
  });
  const schedule = data?.classSchedule ?? null;

  const [name, setName] = useState("");
  const [instructor, setInstructor] = useState("");
  const [modality, setModality] = useState<"presential" | "online">(
    "presential",
  );
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("08:00");
  const [maxCapacity, setMaxCapacity] = useState("20");
  const [room, setRoom] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [updateClass, { loading: saving }] = useMutation(UPDATE_CLASS_SCHEDULE);

  // Repopulate form whenever a different schedule is loaded.
  useEffect(() => {
    if (!schedule) return;
    setName(schedule.name ?? "");
    setInstructor(schedule.instructor ?? "");
    setModality(
      schedule.modality === "online" ? "online" : "presential",
    );
    setWeekdays(
      Array.isArray(schedule.weekdays) ? (schedule.weekdays as number[]) : [],
    );
    setStartTime(schedule.startTime ?? "07:00");
    setEndTime(schedule.endTime ?? "08:00");
    setMaxCapacity(String(schedule.maxCapacity ?? 20));
    setRoom(schedule.room ?? "");
    setError(null);
  }, [schedule]);

  function toggleDay(d: number) {
    setWeekdays((cur) =>
      cur.includes(d) ? cur.filter((v) => v !== d) : [...cur, d].sort(),
    );
  }

  async function persist(patch: Record<string, unknown>) {
    if (USE_MOCKS) {
      onUpdated?.();
      onClose();
      return;
    }
    if (!documentId) return;
    try {
      await updateClass({ variables: { documentId, data: patch } });
      onUpdated?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (weekdays.length === 0) {
      setError("Escolha ao menos um dia da semana.");
      return;
    }
    await persist({
      name,
      instructor: instructor || null,
      modality,
      weekdays,
      startTime,
      endTime,
      maxCapacity: Number(maxCapacity) || 20,
      room: room || null,
    });
  }

  async function handleDeactivate() {
    if (
      !window.confirm(
        `Desativar "${name}"? A turma some da grade, mas o histórico de presenças é mantido.`,
      )
    )
      return;
    setError(null);
    await persist({ isActive: false });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Editar turma"
      subtitle="Alterações afetam todas as ocorrências futuras desta recorrência."
    >
      {fetching && <LoadingState />}
      {!fetching && (
        <form id="edit-class-form" onSubmit={handleSubmit}>
          <Field label="Nome da turma">
            <Input
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Instrutor" help="Opcional">
            <Input
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
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
                onChange={(e) =>
                  setModality(e.target.value as typeof modality)
                }
              >
                <option value="presential">Presencial</option>
                <option value="online">Online</option>
              </Select>
            </Field>
          </div>
          <Field label="Sala" help="Opcional">
            <Input value={room} onChange={(e) => setRoom(e.target.value)} />
          </Field>
          <ConflictWarning
            weekdays={weekdays}
            startTime={startTime}
            endTime={endTime}
            instructor={instructor}
            room={room}
            excludeDocumentId={documentId}
          />
          {error && (
            <div className="text-[0.82rem] text-rose mb-3">{error}</div>
          )}
        </form>
      )}

      <div className="flex items-center justify-between gap-3 -mt-3">
        <button
          type="button"
          onClick={handleDeactivate}
          disabled={saving || fetching}
          className="text-[0.82rem] text-rose hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Desativar turma
        </button>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button
            variant="ink"
            type="submit"
            form="edit-class-form"
            disabled={saving || fetching}
          >
            {saving ? "Salvando…" : "Salvar"}
            <Icon name="arrow-right" />
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
