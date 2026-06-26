"use client";

import { useState } from "react";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { Topbar } from "@/components/admin/Topbar";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { WorkoutTab } from "@/lib/types";
import {
  DELETE_WORKOUT_PLAN,
  UPDATE_WORKOUT_PLAN,
  WORKOUT_PLAN_BY_ID,
  useWorkouts,
} from "@/lib/hooks";
import { graphql } from "@/gql";
import { USE_MOCKS } from "@/lib/config";
import { WorkoutCard, type CardActions } from "@/components/admin/WorkoutCard";
import { NewWorkoutDialog } from "./NewWorkoutDialog";
import { EditWorkoutDialog } from "./EditWorkoutDialog";

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
      const roster = (src?.students ?? [])
        .filter((s): s is NonNullable<typeof s> => !!s)
        .map((s) => s.documentId);
      if (!src || roster.length === 0) return;
      await createWorkout({
        variables: {
          data: {
            name: `Cópia de ${src.name ?? "Ficha"}`,
            instructor: src.instructor ?? undefined,
            students: roster,
            category: src.category ?? undefined,
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
    // Pool fichas are managed under /admin/pool → Atividades, not here.
    if (c.category === "pool") return false;
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
            <Button variant="primary" onClick={() => setDialogOpen(true)}>
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
