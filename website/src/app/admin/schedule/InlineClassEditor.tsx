"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery } from "@apollo/client/react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/LoadingState";
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

export function InlineClassEditor({
  documentId,
  anchorRect,
  align = "left",
  onClose,
  onSaved,
  onShowBookings,
}: {
  documentId: string;
  /** Viewport-space rect of the anchor cell (use getBoundingClientRect).
   *  Required: the popover renders in a portal so we can't rely on a
   *  positioned ancestor. */
  anchorRect: { top: number; left: number; right: number; bottom: number };
  /** Anchor side. Use "right" on cells near the right edge so the popover
   *  expands toward the page interior instead of overflowing. */
  align?: "left" | "right";
  onClose: () => void;
  onSaved?: () => void;
  onShowBookings?: () => void;
}) {
  const { data, loading: fetching } = useQuery(CLASS_SCHEDULE_BY_ID, {
    variables: { documentId },
    skip: USE_MOCKS,
  });
  const schedule = data?.classSchedule ?? null;
  const [updateClass, { loading: saving }] = useMutation(UPDATE_CLASS_SCHEDULE);

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

  useEffect(() => {
    if (!schedule) return;
    setName(schedule.name ?? "");
    setInstructor(schedule.instructor ?? "");
    setModality(schedule.modality === "online" ? "online" : "presential");
    setWeekdays(
      Array.isArray(schedule.weekdays) ? (schedule.weekdays as number[]) : [],
    );
    setStartTime(schedule.startTime ?? "07:00");
    setEndTime(schedule.endTime ?? "08:00");
    setMaxCapacity(String(schedule.maxCapacity ?? 20));
    setRoom(schedule.room ?? "");
    setError(null);
  }, [schedule]);

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    function onMouseDown(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [onClose]);

  function toggleDay(d: number) {
    setWeekdays((cur) =>
      cur.includes(d) ? cur.filter((v) => v !== d) : [...cur, d].sort(),
    );
  }

  async function persist(patch: Record<string, unknown>) {
    if (USE_MOCKS) {
      onSaved?.();
      onClose();
      return;
    }
    try {
      await updateClass({ variables: { documentId, data: patch } });
      onSaved?.();
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

  if (typeof document === "undefined") return null;

  const POPOVER_WIDTH = 340;
  const MARGIN = 8;
  const left =
    align === "right"
      ? Math.max(MARGIN, anchorRect.right - POPOVER_WIDTH)
      : Math.min(
          window.innerWidth - POPOVER_WIDTH - MARGIN,
          Math.max(MARGIN, anchorRect.left),
        );
  // Clamp vertically so the popover never falls off the viewport — its
  // form is taller than typical screens, so it scrolls internally if
  // needed.
  const maxHeight = window.innerHeight - MARGIN * 2;
  const top = Math.max(
    MARGIN,
    Math.min(anchorRect.top, window.innerHeight - maxHeight - MARGIN),
  );

  return createPortal(
    <div
      ref={ref}
      onClick={(e) => e.stopPropagation()}
      style={{ top, left, maxHeight }}
      className="fixed z-50 w-[340px] max-w-[92vw] rounded-2xl border border-line-strong bg-white shadow-[0_24px_64px_-12px_rgba(28,25,23,0.18)] p-4 overflow-y-auto"
    >
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="min-w-0">
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-flame">
            Editar turma
          </div>
          <div className="font-display text-[0.95rem] font-semibold text-ink-900 mt-0.5 truncate">
            {name || "…"}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="w-7 h-7 rounded-full text-ink-400 hover:text-ink-900 hover:bg-paper-2 flex items-center justify-center shrink-0"
        >
          <Icon name="x" />
        </button>
      </div>

      {fetching && (
        <div className="flex items-center gap-2 py-6 justify-center text-ink-500">
          <Spinner size={14} />
          <span className="text-[0.82rem]">Carregando…</span>
        </div>
      )}

      {!fetching && (
        <form id={`inline-class-${documentId}`} onSubmit={handleSubmit}>
          <Field label="Nome">
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
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map((d) => {
                const active = weekdays.includes(d.value);
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDay(d.value)}
                    className={cn(
                      "w-9 h-8 rounded-full font-mono text-[0.7rem] font-semibold uppercase tracking-wider transition-colors",
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
          <div className="grid grid-cols-2 gap-3">
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
          <div className="grid grid-cols-2 gap-3">
            <Field label="Capacidade">
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

      <div className="flex items-center justify-between gap-2 pt-3 border-t border-line">
        <div className="flex items-center gap-2 flex-wrap">
          {onShowBookings && (
            <button
              type="button"
              onClick={onShowBookings}
              className="inline-flex items-center gap-1 text-[0.78rem] text-ink-700 hover:text-ink-900 hover:underline"
            >
              <Icon name="users" /> Presenças
            </button>
          )}
          <button
            type="button"
            onClick={handleDeactivate}
            disabled={saving || fetching}
            className="text-[0.78rem] text-rose hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Desativar
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            onClick={onClose}
            type="button"
            className="!px-3 !py-1.5 !text-[0.82rem]"
          >
            Cancelar
          </Button>
          <Button
            variant="ink"
            type="submit"
            form={`inline-class-${documentId}`}
            disabled={saving || fetching}
            className="!px-3.5 !py-1.5 !text-[0.82rem]"
          >
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
