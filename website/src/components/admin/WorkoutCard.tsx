import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import type { WorkoutPlanCard as WorkoutPlanCardData } from "@/lib/types";

/**
 * Actions wired by the host page (Treinos or Piscina → Atividades). Both
 * reuse the same card + the same workout-plan mutations, so the card is a
 * shared component instead of being duplicated per page.
 */
export interface CardActions {
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onArchiveToggle: (id: string, currentlyActive: boolean) => void;
  onDelete: (id: string) => void;
  busyId: string | null;
}

export function WorkoutCard({
  plan,
  actions,
}: {
  plan: WorkoutPlanCardData;
  actions: CardActions;
}) {
  const busy = actions.busyId === plan.id;
  return (
    <Card className="p-0 overflow-hidden flex flex-col">
      <div className="flex items-center gap-3.5 p-5 border-b border-line">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-flame shrink-0"
          style={{ background: plan.iconBg }}
          aria-hidden
        >
          <Icon name={plan.icon} size="lg" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-ink-900 text-[0.95rem] truncate">
            {plan.name}
          </div>
          <div className="font-mono text-[0.68rem] text-ink-400 truncate mt-0.5">
            {plan.exerciseCount} exercícios · Criado {plan.createdAt} ·{" "}
            Instrutor {plan.instructorName}
          </div>
        </div>
        <div
          className="flex items-center shrink-0"
          title={`${plan.studentCount ?? 1} aluno(s) na turma`}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-mono text-[0.7rem] font-semibold"
            style={{ background: plan.student.gradient }}
          >
            {plan.student.initials || "?"}
          </div>
          {(plan.studentCount ?? 0) > 1 && (
            <span className="ml-1.5 font-mono text-[0.7rem] font-semibold text-ink-500">
              +{(plan.studentCount ?? 1) - 1}
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-4 flex flex-col gap-2 flex-1">
        {plan.exercises.map((ex) => (
          <div
            key={ex.name}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-paper-50"
          >
            <div className="min-w-0">
              <div className="text-[0.85rem] font-semibold text-ink-900 truncate">
                {ex.name}
              </div>
              <div className="font-mono text-[0.66rem] text-ink-400 mt-0.5">
                {ex.sets}
              </div>
            </div>
            <div className="font-mono text-[0.8rem] font-semibold text-ink-700 shrink-0 ml-3">
              {ex.load}
            </div>
          </div>
        ))}
      </div>

      {/* Footer in two rows so the status pill + actions never misalign when
          the card is narrow or when "ARQUIVADO" + the delete button appear. */}
      <div className="flex flex-col gap-3 p-4 border-t border-line bg-paper-50">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => actions.onEdit(plan.id)}
            disabled={busy}
            className="flex-1 font-mono text-[0.72rem] uppercase tracking-[0.08em] font-semibold text-white bg-ink-900 hover:bg-ink-700 transition-colors px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => actions.onDuplicate(plan.id)}
            disabled={busy}
            className="flex-1 font-mono text-[0.72rem] uppercase tracking-[0.08em] font-semibold text-ink-900 border border-ink-900 hover:bg-ink-900 hover:text-paper transition-colors px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Duplicar
          </button>
        </div>
        <div className="flex items-center gap-2">
          {plan.status === "active" ? (
            <Pill tone="emerald">ATIVO</Pill>
          ) : (
            <Pill tone="ink">ARQUIVADO</Pill>
          )}
          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                actions.onArchiveToggle(plan.id, plan.status === "active")
              }
              disabled={busy}
              title={plan.status === "active" ? "Arquivar" : "Restaurar"}
              aria-label={plan.status === "active" ? "Arquivar" : "Restaurar"}
              className="w-9 h-9 rounded-lg text-ink-500 hover:text-ink-900 hover:bg-paper-2 inline-flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Icon name={plan.status === "active" ? "eye-off" : "eye"} />
            </button>
            {plan.status === "archived" && (
              <button
                type="button"
                onClick={() => actions.onDelete(plan.id)}
                disabled={busy}
                title="Excluir definitivamente"
                aria-label="Excluir"
                className="w-9 h-9 rounded-lg text-rose hover:bg-rose/10 inline-flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <Icon name="trash" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
