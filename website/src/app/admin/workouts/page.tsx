"use client";

import { useState } from "react";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { Topbar } from "@/components/admin/Topbar";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/utils";
import type { WorkoutPlanCard, WorkoutTab } from "@/lib/types";
import {
  DELETE_WORKOUT_PLAN,
  UPDATE_WORKOUT_PLAN,
  WORKOUT_PLAN_BY_ID,
  useWorkouts,
} from "@/lib/hooks";
import { graphql } from "@/gql";
import { USE_MOCKS } from "@/lib/config";
import { NewWorkoutDialog } from "./NewWorkoutDialog";
import { EditWorkoutDialog } from "./EditWorkoutDialog";

interface CardActions {
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onArchiveToggle: (id: string, currentlyActive: boolean) => void;
  onDelete: (id: string) => void;
  busyId: string | null;
}

function WorkoutCard({
  plan,
  actions,
}: {
  plan: WorkoutPlanCard;
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
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-mono text-[0.7rem] font-semibold shrink-0"
          style={{ background: plan.student.gradient }}
          title={plan.student.initials}
        >
          {plan.student.initials}
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

      <div className="flex items-center gap-2 p-4 border-t border-line bg-paper-50 flex-wrap">
        <button
          type="button"
          onClick={() => actions.onEdit(plan.id)}
          disabled={busy}
          className="font-mono text-[0.72rem] uppercase tracking-[0.08em] font-semibold text-white bg-ink-900 hover:bg-ink-700 transition-colors px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => actions.onDuplicate(plan.id)}
          disabled={busy}
          className="font-mono text-[0.72rem] uppercase tracking-[0.08em] font-semibold text-ink-900 border border-ink-900 hover:bg-ink-900 hover:text-paper transition-colors px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Duplicar
        </button>
        <div className="ml-auto flex items-center gap-2">
          {plan.status === "active" ? (
            <Pill tone="emerald">ATIVO</Pill>
          ) : (
            <Pill tone="ink">ARQUIVADO</Pill>
          )}
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
            <Icon name={plan.status === "active" ? "download" : "upload"} />
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
    </Card>
  );
}

const CREATE_WORKOUT_PLAIN = graphql(`
  mutation AdminDuplicateWorkoutPlan($data: WorkoutPlanInput!) {
    createWorkoutPlan(data: $data) {
      documentId
      name
    }
  }
`);

export default function WorkoutsPage() {
  const { data, loading, error } = useWorkouts();
  const [activeTab, setActiveTab] = useState<WorkoutTab>("active");
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const apollo = useApolloClient();

  const refetch = () => apollo.refetchQueries({ include: ["AdminWorkouts"] });

  const [updateWorkout] = useMutation(UPDATE_WORKOUT_PLAN, {
    refetchQueries: ["AdminWorkouts"],
  });
  const [deleteWorkout] = useMutation(DELETE_WORKOUT_PLAN, {
    refetchQueries: ["AdminWorkouts"],
  });
  const [createWorkout] = useMutation(CREATE_WORKOUT_PLAIN, {
    refetchQueries: ["AdminWorkouts"],
  });

  async function handleArchiveToggle(id: string, currentlyActive: boolean) {
    if (USE_MOCKS) return; // mock contract
    setBusyId(id);
    try {
      await updateWorkout({
        variables: { documentId: id, data: { isActive: !currentlyActive } },
      });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (
      !window.confirm(
        "Excluir esta ficha definitivamente? A ação não pode ser desfeita.",
      )
    )
      return;
    if (USE_MOCKS) return;
    setBusyId(id);
    try {
      await deleteWorkout({ variables: { documentId: id } });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDuplicate(id: string) {
    if (USE_MOCKS) return;
    setBusyId(id);
    try {
      // Pull the full source so we copy exercises/notes verbatim — the
      // listing query doesn't include `notes`.
      const result = await apollo.query({
        query: WORKOUT_PLAN_BY_ID,
        variables: { documentId: id },
        fetchPolicy: "network-only",
      });
      const src = result.data?.workoutPlan;
      if (!src || !src.student?.documentId) return;
      await createWorkout({
        variables: {
          data: {
            name: `Cópia de ${src.name ?? "Ficha"}`,
            instructor: src.instructor ?? undefined,
            student: src.student.documentId,
            validFrom:
              src.validFrom ?? new Date().toISOString().slice(0, 10),
            isActive: true,
            exercises: (src.exercises ?? [])
              .filter((e): e is NonNullable<typeof e> => !!e)
              .map((e) => ({
                name: e.name ?? "",
                sets: e.sets ?? 0,
                reps: e.reps ?? 0,
                load: e.load ?? "—",
                notes: e.notes ?? undefined,
              })),
          },
        },
      });
    } finally {
      setBusyId(null);
    }
  }

  const visibleCards = (data?.cards ?? []).filter((c) => {
    const tabMatch =
      activeTab === "archived" ? c.status === "archived" : c.status === "active";
    const queryMatch =
      !query ||
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.instructorName.toLowerCase().includes(query.toLowerCase());
    return tabMatch && queryMatch;
  });

  const cardActions: CardActions = {
    onEdit: (id) => setEditingId(id),
    onDuplicate: handleDuplicate,
    onArchiveToggle: handleArchiveToggle,
    onDelete: handleDelete,
    busyId,
  };

  return (
    <>
      <Topbar
        title="Fichas de treino"
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Buscar ficha…"
      />
      <main className="flex-1 p-8 max-[720px]:p-4">
        <PageHeader
          title="Fichas de treino"
          subtitle={data?.subtitle}
          actions={
            <Button variant="ink" onClick={() => setDialogOpen(true)}>
              <Icon name="plus" /> Nova ficha
            </Button>
          }
        />

        {loading && <LoadingState />}
        {error && <div className="text-rose">{error.message}</div>}

        {data && (
          <>
            <div className="flex items-center gap-1 border-b border-line mb-6">
              {data.tabs.map((tab) => {
                const active = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "font-mono text-[0.76rem] uppercase tracking-[0.08em] font-semibold px-4 py-3 border-b-2 transition-colors -mb-px",
                      active
                        ? "border-flame text-flame"
                        : "border-transparent text-ink-400 hover:text-ink-700",
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {activeTab === "assessments" && (
              <Card className="p-12 text-center">
                <div className="font-display text-[1.2rem] font-semibold text-ink-900 mb-2">
                  Avaliações físicas
                </div>
                <p className="text-[0.9rem] text-ink-500">
                  Avaliações corporais e fotos de progresso aparecem aqui. Em
                  breve.
                </p>
              </Card>
            )}

            {activeTab !== "assessments" && visibleCards.length === 0 && (
              <Card className="p-12 text-center">
                <div className="font-display text-[1.2rem] font-semibold text-ink-900 mb-2">
                  Nada por aqui
                </div>
                <p className="text-[0.9rem] text-ink-500">
                  Nenhuma ficha {activeTab === "archived" ? "arquivada" : "ativa"}.
                </p>
              </Card>
            )}

            {activeTab !== "assessments" && visibleCards.length > 0 && (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-5 max-[720px]:grid-cols-1">
                {visibleCards.map((plan) => (
                  <WorkoutCard
                    key={plan.id}
                    plan={plan}
                    actions={cardActions}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <NewWorkoutDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onCreated={refetch}
        />
        <EditWorkoutDialog
          documentId={editingId}
          onClose={() => setEditingId(null)}
          onUpdated={refetch}
        />
      </main>
    </>
  );
}
