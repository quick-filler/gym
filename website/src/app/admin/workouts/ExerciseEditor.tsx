"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export interface ExerciseDraft {
  name: string;
  sets: number;
  reps: number;
  load: string;
  notes?: string;
}

export function emptyExercise(): ExerciseDraft {
  return { name: "", sets: 3, reps: 12, load: "", notes: "" };
}

export function ExerciseEditor({
  value,
  onChange,
}: {
  value: ExerciseDraft[];
  onChange: (next: ExerciseDraft[]) => void;
}) {
  function patch(idx: number, patch: Partial<ExerciseDraft>) {
    onChange(value.map((e, i) => (i === idx ? { ...e, ...patch } : e)));
  }
  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }
  function move(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= value.length) return;
    const next = value.slice();
    const [item] = next.splice(idx, 1);
    next.splice(target, 0, item!);
    onChange(next);
  }
  function add() {
    onChange([...value, emptyExercise()]);
  }

  return (
    <div className="flex flex-col gap-3">
      {value.length === 0 && (
        <div className="text-[0.85rem] text-ink-400 px-3 py-4 rounded-xl border border-dashed border-line bg-paper-50 text-center">
          Nenhum exercício adicionado.
        </div>
      )}
      {value.map((ex, idx) => (
        <ExerciseRow
          key={idx}
          exercise={ex}
          index={idx}
          isFirst={idx === 0}
          isLast={idx === value.length - 1}
          onPatch={(p) => patch(idx, p)}
          onRemove={() => remove(idx)}
          onMove={(dir) => move(idx, dir)}
        />
      ))}
      <button
        type="button"
        onClick={add}
        className="self-start inline-flex items-center gap-2 text-[0.85rem] font-medium text-flame hover:text-flame-dark transition-colors"
      >
        <Icon name="plus" /> Adicionar exercício
      </button>
    </div>
  );
}

function ExerciseRow({
  exercise,
  index,
  isFirst,
  isLast,
  onPatch,
  onRemove,
  onMove,
}: {
  exercise: ExerciseDraft;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onPatch: (patch: Partial<ExerciseDraft>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  // Notes default to expanded when there's already content (editing an
  // existing workout). Otherwise hidden behind a "+ nota" toggle so the
  // row stays compact.
  const [notesOpen, setNotesOpen] = useState(!!exercise.notes);

  return (
    <div className="rounded-xl border border-line bg-white p-3 flex flex-col gap-2">
      <div className="flex items-start gap-2">
        <ReorderControls
          index={index}
          isFirst={isFirst}
          isLast={isLast}
          onMove={onMove}
        />
        <div className="flex-1 grid grid-cols-[1fr_64px_64px_96px] gap-2 max-[640px]:grid-cols-1">
          <input
            required
            value={exercise.name}
            onChange={(e) => onPatch({ name: e.target.value })}
            placeholder="Nome do exercício"
            className={inputCls}
          />
          <input
            type="number"
            min="1"
            value={exercise.sets || ""}
            onChange={(e) => onPatch({ sets: Number(e.target.value) || 0 })}
            placeholder="Séries"
            aria-label="Séries"
            className={cn(inputCls, "text-center")}
          />
          <input
            type="number"
            min="1"
            value={exercise.reps || ""}
            onChange={(e) => onPatch({ reps: Number(e.target.value) || 0 })}
            placeholder="Reps"
            aria-label="Repetições"
            className={cn(inputCls, "text-center")}
          />
          <input
            value={exercise.load}
            onChange={(e) => onPatch({ load: e.target.value })}
            placeholder="Carga"
            aria-label="Carga"
            className={inputCls}
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remover exercício"
          title="Remover"
          className="w-9 h-9 shrink-0 rounded-lg text-ink-400 hover:text-rose hover:bg-rose/10 inline-flex items-center justify-center transition-colors"
        >
          <Icon name="trash" />
        </button>
      </div>

      {!notesOpen ? (
        <button
          type="button"
          onClick={() => setNotesOpen(true)}
          className="self-start text-[0.78rem] text-ink-400 hover:text-ink-700 inline-flex items-center gap-1 px-1"
        >
          <Icon name="plus" /> Nota (opcional)
        </button>
      ) : (
        <input
          value={exercise.notes ?? ""}
          onChange={(e) => onPatch({ notes: e.target.value })}
          placeholder="Anotações (ex: cadência 3-1-1, foco em descida controlada)"
          className={cn(inputCls, "text-[0.85rem]")}
        />
      )}
    </div>
  );
}

function ReorderControls({
  index,
  isFirst,
  isLast,
  onMove,
}: {
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMove: (dir: -1 | 1) => void;
}) {
  return (
    <div className="flex flex-col gap-0.5 shrink-0 pt-1">
      <button
        type="button"
        onClick={() => onMove(-1)}
        disabled={isFirst}
        aria-label="Mover para cima"
        title="Mover para cima"
        className="w-7 h-5 rounded text-ink-400 hover:text-ink-900 hover:bg-paper-2 inline-flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Icon name="arrow-left" className="-rotate-90" />
      </button>
      <span className="font-mono text-[0.62rem] text-ink-400 text-center select-none">
        {index + 1}
      </span>
      <button
        type="button"
        onClick={() => onMove(1)}
        disabled={isLast}
        aria-label="Mover para baixo"
        title="Mover para baixo"
        className="w-7 h-5 rounded text-ink-400 hover:text-ink-900 hover:bg-paper-2 inline-flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Icon name="arrow-left" className="rotate-90" />
      </button>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-line-strong bg-white text-[0.9rem] text-ink-900 placeholder:text-ink-300 focus:outline-none focus:border-ink-900 focus:shadow-[0_0_0_3px_var(--color-paper-2)] transition-all";
