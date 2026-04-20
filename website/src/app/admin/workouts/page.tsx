"use client";

import { useState } from "react";
import { useApolloClient } from "@apollo/client/react";
import { Topbar } from "@/components/admin/Topbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/utils";
import type { WorkoutPlanCard, WorkoutTab } from "@/lib/types";
import { useWorkouts } from "@/lib/hooks";
import { NewWorkoutDialog } from "./NewWorkoutDialog";

function WorkoutCard({ plan }: { plan: WorkoutPlanCard }) {
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

      <div className="flex items-center gap-2 p-4 border-t border-line bg-paper-50">
        <button className="font-mono text-[0.72rem] uppercase tracking-[0.08em] font-semibold text-white bg-ink-900 hover:bg-ink-700 transition-colors px-3 py-2 rounded-lg">
          Editar
        </button>
        <button className="font-mono text-[0.72rem] uppercase tracking-[0.08em] font-semibold text-ink-900 border border-ink-900 hover:bg-ink-900 hover:text-paper transition-colors px-3 py-2 rounded-lg">
          Duplicar
        </button>
        <div className="ml-auto">
          {plan.status === "active" ? (
            <Pill tone="emerald">ATIVO</Pill>
          ) : (
            <Pill tone="ink">ARQUIVADO</Pill>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function WorkoutsPage() {
  const { data, loading, error } = useWorkouts();
  const [activeTab, setActiveTab] = useState<WorkoutTab>("active");
  const [dialogOpen, setDialogOpen] = useState(false);
  const apollo = useApolloClient();

  const visibleCards =
    data?.cards.filter((c) =>
      activeTab === "archived" ? c.status === "archived" : c.status === "active",
    ) ?? [];

  return (
    <>
      <Topbar title="Fichas de treino" />
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

        {loading && <div className="text-ink-400">Carregando…</div>}
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
                  <WorkoutCard key={plan.id} plan={plan} />
                ))}
              </div>
            )}
          </>
        )}

        <NewWorkoutDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onCreated={() =>
            apollo.refetchQueries({ include: ["AdminWorkouts"] })
          }
        />
      </main>
    </>
  );
}
