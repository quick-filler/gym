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
import { useMembershipPlans } from "@/lib/hooks";
import type { MembershipPlan } from "@/lib/types";
import { NewPlanDialog } from "./NewPlanDialog";
import { EditPlanDialog } from "./EditPlanDialog";

const CYCLE_TONE: Record<string, { pill: "amber" | "emerald" | "sky"; badge: string }> = {
  monthly: { pill: "amber", badge: "#fff7ed" },
  quarterly: { pill: "emerald", badge: "#f0fdf4" },
  annual: { pill: "sky", badge: "#f0f9ff" },
};

function PlanCard({
  plan,
  onEdit,
}: {
  plan: MembershipPlan;
  onEdit: (p: MembershipPlan) => void;
}) {
  const tones = CYCLE_TONE[plan.billingCycle] ?? CYCLE_TONE.monthly!;

  return (
    <Card
      className={cn(
        "p-0 overflow-hidden flex flex-col transition-opacity",
        !plan.isActive && "opacity-60",
      )}
    >
      {/* Header */}
      <div className="p-5 border-b border-line flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: tones.badge }}
        >
          <Icon name="credit" size="lg" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-ink-900 text-[1rem] truncate">
            {plan.name}
          </div>
          {plan.description && (
            <div className="text-[0.8rem] text-ink-400 mt-0.5 line-clamp-2">
              {plan.description}
            </div>
          )}
        </div>
        {!plan.isActive && <Pill tone="ink">INATIVO</Pill>}
      </div>

      {/* Price block */}
      <div className="px-5 pt-4 pb-3 flex items-end gap-2 border-b border-line">
        <span className="font-display text-[2rem] font-bold text-ink-900 leading-none">
          {plan.priceFormatted}
        </span>
        <span className="text-[0.8rem] text-ink-400 mb-1">
          /{plan.billingCycle === "monthly" ? "mês" : plan.billingCycle === "quarterly" ? "trimestre" : "ano"}
        </span>
        <div className="ml-auto">
          <Pill tone={tones.pill}>{plan.billingCycleLabel.toUpperCase()}</Pill>
        </div>
      </div>

      {/* Features */}
      <div className="px-5 py-4 flex flex-col gap-2 flex-1">
        {plan.features.length === 0 ? (
          <span className="text-[0.8rem] text-ink-300 italic">Sem benefícios listados</span>
        ) : (
          plan.features.map((f) => (
            <div key={f} className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-pine/10 flex items-center justify-center shrink-0">
                <Icon name="check" size="sm" />
              </span>
              <span className="text-[0.85rem] text-ink-700">{f}</span>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 px-5 py-4 border-t border-line bg-paper-50">
        <div className="flex items-center gap-1.5 text-ink-400">
          <Icon name="users" size="sm" />
          <span className="font-mono text-[0.72rem]">
            {plan.enrollmentCount} matriculado{plan.enrollmentCount !== 1 ? "s" : ""}
          </span>
        </div>
        {plan.maxStudents && (
          <span className="font-mono text-[0.72rem] text-ink-300">
            / {plan.maxStudents} máx
          </span>
        )}
        <button
          type="button"
          onClick={() => onEdit(plan)}
          className="ml-auto font-mono text-[0.72rem] uppercase tracking-[0.08em] font-semibold text-ink-900 border border-ink-900/20 hover:bg-ink-900 hover:text-paper hover:border-ink-900 transition-colors px-3 py-1.5 rounded-lg flex items-center gap-1.5"
        >
          <Icon name="edit" size="sm" /> Editar
        </button>
      </div>
    </Card>
  );
}

export default function PlansPage() {
  const { data, loading, error } = useMembershipPlans();
  const [query, setQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MembershipPlan | null>(null);
  const apollo = useApolloClient();

  function refetch() {
    apollo.refetchQueries({ include: ["AdminPlans"] });
  }

  const visible = (data?.plans ?? []).filter((p) => {
    const matchQuery = !query || p.name.toLowerCase().includes(query.toLowerCase());
    const matchStatus = showInactive ? true : p.isActive;
    return matchQuery && matchStatus;
  });

  const hasInactive = (data?.plans ?? []).some((p) => !p.isActive);

  return (
    <>
      <Topbar
        title="Planos de matrícula"
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Buscar plano…"
      />
      <main className="flex-1 p-8 max-[720px]:p-4">
        <PageHeader
          title="Planos de matrícula"
          subtitle={data?.subtitle}
          actions={
            <Button variant="ink" onClick={() => setNewDialogOpen(true)}>
              <Icon name="plus" /> Novo plano
            </Button>
          }
        />

        {hasInactive && (
          <div className="mb-5">
            <button
              type="button"
              onClick={() => setShowInactive((v) => !v)}
              className={cn(
                "font-mono text-[0.72rem] uppercase tracking-[0.08em] font-semibold px-3 py-1.5 rounded-lg border transition-colors",
                showInactive
                  ? "bg-ink-900 text-paper border-ink-900"
                  : "text-ink-500 border-ink-200 hover:border-ink-400",
              )}
            >
              {showInactive ? "Ocultar inativos" : "Mostrar inativos"}
            </button>
          </div>
        )}

        {loading && <div className="text-ink-400">Carregando…</div>}
        {error && <div className="text-rose">{error.message}</div>}

        {data && visible.length === 0 && (
          <Card className="p-12 text-center">
            <div className="font-display text-[1.2rem] font-semibold text-ink-900 mb-2">
              Nenhum plano encontrado
            </div>
            <p className="text-[0.9rem] text-ink-500">
              {query ? "Tente outro termo de busca." : "Crie o primeiro plano de matrícula."}
            </p>
          </Card>
        )}

        {data && visible.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5 max-[720px]:grid-cols-1">
            {visible.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onEdit={(p) => setEditTarget(p)}
              />
            ))}
          </div>
        )}
      </main>

      <NewPlanDialog
        open={newDialogOpen}
        onClose={() => setNewDialogOpen(false)}
        onCreated={refetch}
      />

      {editTarget && (
        <EditPlanDialog
          plan={editTarget}
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          onUpdated={() => {
            refetch();
            setEditTarget(null);
          }}
        />
      )}
    </>
  );
}
