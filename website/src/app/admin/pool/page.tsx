"use client";

/**
 * Gerenciamento de Piscina (módulo Natação).
 *
 * Mostra os dois registros do dia (manhã/tarde) lado a lado, com
 * status colorido baseado nas faixas configuradas em PoolSettings
 * (legislação brasileira: pH 7.2–7.8, cloro 1–3 mg/L, temp 28–31°C
 * são os defaults; admin pode ajustar em /admin/settings).
 *
 * Tabela de histórico abaixo dos cards. Click no card sem leitura
 * abre o form pra registrar; click num card preenchido abre pra editar.
 */

import { useMemo, useState } from "react";
import { useMutation, useApolloClient } from "@apollo/client/react";
import { graphql } from "@/gql";
import { Topbar } from "@/components/admin/Topbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { cn } from "@/lib/utils";
import { USE_MOCKS } from "@/lib/config";
import {
  DELETE_WORKOUT_PLAN,
  UPDATE_WORKOUT_PLAN,
  WORKOUT_PLAN_BY_ID,
  usePoolInspections,
  usePoolSettings,
  useWorkouts,
} from "@/lib/hooks";
import { WorkoutCard, type CardActions } from "@/components/admin/WorkoutCard";
import { NewWorkoutDialog } from "../workouts/NewWorkoutDialog";
import { EditWorkoutDialog } from "../workouts/EditWorkoutDialog";
import type { PoolInspection, PoolShift, PoolStatus } from "@/lib/types";

type PoolTab = "inspections" | "activities";

const CREATE_POOL_INSPECTION = graphql(`
  mutation AdminCreatePoolInspection($data: PoolInspectionInput!) {
    createPoolInspection(data: $data) {
      documentId
    }
  }
`);

const UPDATE_POOL_INSPECTION = graphql(`
  mutation AdminUpdatePoolInspection(
    $documentId: ID!
    $data: PoolInspectionInput!
  ) {
    updatePoolInspection(documentId: $documentId, data: $data) {
      documentId
    }
  }
`);

const DUPLICATE_POOL_ACTIVITY = graphql(`
  mutation AdminDuplicatePoolActivity($data: WorkoutPlanInput!) {
    createWorkoutPlan(data: $data) {
      documentId
      name
    }
  }
`);

const SHIFT_LABEL: Record<PoolShift, string> = {
  morning: "Manhã (08h)",
  evening: "Tarde (18h)",
};

const STATUS_TONE: Record<
  PoolStatus,
  { tone: "emerald" | "amber" | "rose" | "ink"; label: string }
> = {
  ok: { tone: "emerald", label: "OK" },
  warning: { tone: "amber", label: "ATENÇÃO" },
  critical: { tone: "rose", label: "CRÍTICO" },
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function PoolPage() {
  const today = todayIso();
  const { data: settings, loading: loadingSettings } = usePoolSettings();
  const { data: todayInspections, loading: loadingToday } =
    usePoolInspections(today);
  const { data: history, loading: loadingHistory } = usePoolInspections();
  const apollo = useApolloClient();
  const [tab, setTab] = useState<PoolTab>("inspections");
  const [editTarget, setEditTarget] = useState<
    | { mode: "create"; shift: PoolShift }
    | { mode: "edit"; inspection: PoolInspection }
    | null
  >(null);

  const morning = useMemo(
    () => (todayInspections ?? []).find((i) => i.shift === "morning") ?? null,
    [todayInspections],
  );
  const evening = useMemo(
    () => (todayInspections ?? []).find((i) => i.shift === "evening") ?? null,
    [todayInspections],
  );

  const refresh = () =>
    apollo.refetchQueries({ include: ["PoolInspections", "MyPoolSettings"] });

  const loading = loadingSettings || loadingToday;

  return (
    <>
      <Topbar title="Piscina" />
      <main className="flex-1 p-8 max-[720px]:p-4">
        <PageHeader
          title="Controle da piscina"
          subtitle={`Medições de hoje (${formatDateBR(today)}) · pH, cloro e temperatura conforme legislação`}
          actions={
            settings ? (
              <div className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-ink-500">
                Faixas ideais · pH {settings.phMin}–{settings.phMax} · Cloro{" "}
                {settings.chlorineMin}–{settings.chlorineMax} mg/L · Temp{" "}
                {settings.temperatureMin}–{settings.temperatureMax}°C
              </div>
            ) : undefined
          }
        />

        <div className="flex items-center gap-1 border-b border-line mb-6">
          {(
            [
              { id: "inspections", label: "Inspeções" },
              { id: "activities", label: "Atividades" },
            ] as Array<{ id: PoolTab; label: string }>
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "font-mono text-[0.76rem] uppercase tracking-[0.08em] font-semibold px-4 py-3 border-b-2 transition-colors -mb-px",
                t.id === tab
                  ? "border-flame text-flame"
                  : "border-transparent text-ink-400 hover:text-ink-700",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "activities" && <PoolActivities />}

        {tab === "inspections" && (
          <>
        {loading && <LoadingState />}

        <div className="grid grid-cols-2 gap-5 mb-8 max-[720px]:grid-cols-1">
          {(["morning", "evening"] as PoolShift[]).map((shift) => {
            const inspection = shift === "morning" ? morning : evening;
            return (
              <ShiftCard
                key={shift}
                shift={shift}
                inspection={inspection}
                onOpen={() =>
                  setEditTarget(
                    inspection
                      ? { mode: "edit", inspection }
                      : { mode: "create", shift },
                  )
                }
              />
            );
          })}
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-line">
            <div>
              <h3 className="font-display text-[1.1rem] font-semibold text-ink-900">
                Histórico
              </h3>
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-400 mt-1">
                Últimas {history?.length ?? 0} medições
              </p>
            </div>
          </div>
          {loadingHistory && !history && <LoadingState />}
          {history && history.length === 0 && (
            <div className="p-12 text-center text-ink-400 text-[0.92rem]">
              Nenhuma medição registrada ainda.
            </div>
          )}
          {history && history.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line bg-paper-50">
                    {["Data", "Turno", "pH", "Cloro", "Temp", "Pessoas", "Status"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left px-6 py-3 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-400 font-medium"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => (
                    <tr
                      key={row.documentId}
                      className="border-b border-line/60 last:border-b-0 hover:bg-paper-50 transition-colors cursor-pointer"
                      onClick={() =>
                        setEditTarget({ mode: "edit", inspection: row })
                      }
                    >
                      <td className="px-6 py-4 font-mono text-[0.82rem] text-ink-700">
                        {formatDateBR(row.date)}
                      </td>
                      <td className="px-6 py-4 text-[0.88rem] text-ink-700">
                        {SHIFT_LABEL[row.shift]}
                      </td>
                      <td className="px-6 py-4 font-mono text-[0.88rem] text-ink-900">
                        {row.ph ?? "—"}
                      </td>
                      <td className="px-6 py-4 font-mono text-[0.88rem] text-ink-900">
                        {row.chlorine ?? "—"}
                      </td>
                      <td className="px-6 py-4 font-mono text-[0.88rem] text-ink-900">
                        {row.temperature != null ? `${row.temperature}°C` : "—"}
                      </td>
                      <td className="px-6 py-4 font-mono text-[0.88rem] text-ink-900">
                        {row.peopleCount ?? 0}
                      </td>
                      <td className="px-6 py-4">
                        <Pill tone={STATUS_TONE[row.status].tone}>
                          {STATUS_TONE[row.status].label}
                        </Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
          </>
        )}

        <InspectionDialog
          target={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            void refresh();
          }}
        />
      </main>
    </>
  );
}

/**
 * Atividades de piscina = fichas (WorkoutPlan) com category 'pool'. Reusa o
 * WorkoutCard e os diálogos de Treinos; vive aqui porque o menu Piscina é
 * gated pelo módulo `pool`, então as atividades ficam atrás do gate correto.
 */
function PoolActivities() {
  const { data, loading, error } = useWorkouts();
  const apollo = useApolloClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [updateWorkout] = useMutation(UPDATE_WORKOUT_PLAN, {
    refetchQueries: ["AdminWorkouts"],
  });
  const [deleteWorkout] = useMutation(DELETE_WORKOUT_PLAN, {
    refetchQueries: ["AdminWorkouts"],
  });
  const [duplicateActivity] = useMutation(DUPLICATE_POOL_ACTIVITY, {
    refetchQueries: ["AdminWorkouts"],
  });

  const refetch = () => apollo.refetchQueries({ include: ["AdminWorkouts"] });
  const cards = (data?.cards ?? []).filter((c) => c.category === "pool");

  const cardActions: CardActions = {
    busyId,
    onEdit: (id) => setEditingId(id),
    onArchiveToggle: async (id, currentlyActive) => {
      if (USE_MOCKS) return;
      setBusyId(id);
      try {
        await updateWorkout({
          variables: { documentId: id, data: { isActive: !currentlyActive } },
        });
      } finally {
        setBusyId(null);
      }
    },
    onDelete: async (id) => {
      if (
        !window.confirm(
          "Excluir esta atividade definitivamente? A ação não pode ser desfeita.",
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
    },
    onDuplicate: async (id) => {
      if (USE_MOCKS) return;
      setBusyId(id);
      try {
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
        await duplicateActivity({
          variables: {
            data: {
              name: `Cópia de ${src.name ?? "Atividade"}`,
              instructor: src.instructor ?? undefined,
              students: roster,
              category: "pool",
              validFrom: src.validFrom ?? new Date().toISOString().slice(0, 10),
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
    },
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <p className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-ink-500">
          {cards.length} atividade{cards.length === 1 ? "" : "s"} de piscina
        </p>
        <Button variant="primary" onClick={() => setDialogOpen(true)}>
          <Icon name="plus" /> Nova atividade
        </Button>
      </div>

      {loading && !data && <LoadingState />}
      {error && <div className="text-rose">{error.message}</div>}

      {data && cards.length === 0 && (
        <Card className="p-12 text-center">
          <div className="font-display text-[1.2rem] font-semibold text-ink-900 mb-2">
            Nenhuma atividade de piscina
          </div>
          <p className="text-[0.9rem] text-ink-500">
            Crie uma atividade aquática (natação, hidroginástica…). O aluno a vê
            na aba Piscina do app.
          </p>
        </Card>
      )}

      {data && cards.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-5 max-[720px]:grid-cols-1">
          {cards.map((plan) => (
            <WorkoutCard key={plan.id} plan={plan} actions={cardActions} />
          ))}
        </div>
      )}

      <NewWorkoutDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={refetch}
        category="pool"
      />
      <EditWorkoutDialog
        documentId={editingId}
        onClose={() => setEditingId(null)}
        onUpdated={refetch}
      />
    </>
  );
}

function ShiftCard({
  shift,
  inspection,
  onOpen,
}: {
  shift: PoolShift;
  inspection: PoolInspection | null;
  onOpen: () => void;
}) {
  if (!inspection) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="text-left bg-white border border-line rounded-[var(--radius-lg)] shadow-[var(--shadow-gym-1)] p-6 hover:border-flame transition-colors"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-[1.1rem] font-semibold text-ink-900">
            {SHIFT_LABEL[shift]}
          </h3>
          <Pill tone="ink">PENDENTE</Pill>
        </div>
        <p className="text-[0.92rem] text-ink-500 mb-6">
          Nenhuma medição registrada pra este turno hoje.
        </p>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-flame text-white text-[0.88rem] font-medium">
          <Icon name="plus" /> Registrar medição
        </span>
      </button>
    );
  }

  const tone = STATUS_TONE[inspection.status];
  return (
    <button
      type="button"
      onClick={onOpen}
      className="text-left bg-white border border-line rounded-[var(--radius-lg)] shadow-[var(--shadow-gym-1)] p-6 hover:border-ink-700 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-[1.1rem] font-semibold text-ink-900">
          {SHIFT_LABEL[shift]}
        </h3>
        <Pill tone={tone.tone}>{tone.label}</Pill>
      </div>
      <div className="grid grid-cols-3 gap-4 my-6">
        <Metric label="pH" value={inspection.ph} />
        <Metric label="Cloro" value={inspection.chlorine} suffix=" mg/L" />
        <Metric label="Temp" value={inspection.temperature} suffix="°C" />
      </div>
      <div className="flex items-center justify-between text-[0.82rem] text-ink-500">
        <span>
          <Icon name="users" /> {inspection.peopleCount ?? 0} pessoas
        </span>
        <span className="text-flame hover:underline">Editar</span>
      </div>
    </button>
  );
}

function Metric({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number | null;
  suffix?: string;
}) {
  return (
    <div>
      <div className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-ink-400">
        {label}
      </div>
      <div className="font-display text-[1.4rem] font-semibold text-ink-900 mt-1">
        {value ?? "—"}
        {value != null && suffix ? (
          <span className="text-[0.78rem] text-ink-500 font-normal">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function InspectionDialog({
  target,
  onClose,
  onSaved,
}: {
  target:
    | { mode: "create"; shift: PoolShift }
    | { mode: "edit"; inspection: PoolInspection }
    | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = target?.mode === "edit";
  const existing = isEdit ? target.inspection : null;
  const [shift, setShift] = useState<PoolShift>(
    existing?.shift ?? (target?.mode === "create" ? target.shift : "morning"),
  );
  const [date, setDate] = useState(existing?.date ?? todayIso());
  const [ph, setPh] = useState<string>(existing?.ph?.toString() ?? "");
  const [chlorine, setChlorine] = useState<string>(
    existing?.chlorine?.toString() ?? "",
  );
  const [temperature, setTemperature] = useState<string>(
    existing?.temperature?.toString() ?? "",
  );
  const [peopleCount, setPeopleCount] = useState<string>(
    existing?.peopleCount?.toString() ?? "0",
  );
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  const [createInspection, { loading: creating }] = useMutation(
    CREATE_POOL_INSPECTION,
  );
  const [updateInspection, { loading: updating }] = useMutation(
    UPDATE_POOL_INSPECTION,
  );
  const saving = creating || updating;

  // Re-sincroniza se o target mudar (ex: abrir card diferente sem
  // desmontar). Usamos useMemo + key implícita no Dialog open prop.
  useMemo(() => {
    if (!target) return;
    if (target.mode === "edit") {
      setShift(target.inspection.shift);
      setDate(target.inspection.date);
      setPh(target.inspection.ph?.toString() ?? "");
      setChlorine(target.inspection.chlorine?.toString() ?? "");
      setTemperature(target.inspection.temperature?.toString() ?? "");
      setPeopleCount(target.inspection.peopleCount?.toString() ?? "0");
      setNotes(target.inspection.notes ?? "");
    } else {
      setShift(target.shift);
      setDate(todayIso());
      setPh("");
      setChlorine("");
      setTemperature("");
      setPeopleCount("0");
      setNotes("");
    }
    setError(null);
  }, [target]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = {
      date,
      shift,
      ph: ph ? parseFloat(ph) : null,
      chlorine: chlorine ? parseFloat(chlorine) : null,
      temperature: temperature ? parseFloat(temperature) : null,
      peopleCount: peopleCount ? parseInt(peopleCount, 10) : 0,
      peopleCountSource: "manual",
      notes: notes || null,
    };

    try {
      if (isEdit && existing) {
        await updateInspection({
          variables: { documentId: existing.documentId, data },
        });
      } else {
        await createInspection({ variables: { data } });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    }
  }

  return (
    <Dialog
      open={!!target}
      onClose={onClose}
      title={isEdit ? "Editar medição" : "Nova medição"}
      subtitle="Anote pH, cloro e temperatura conforme medidor. O status é calculado automaticamente."
    >
      <form id="pool-inspection-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Data">
            <Input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <Field label="Turno">
            <Select
              value={shift}
              onChange={(e) => setShift(e.target.value as PoolShift)}
            >
              <option value="morning">Manhã (08h)</option>
              <option value="evening">Tarde (18h)</option>
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Field label="pH">
            <Input
              type="number"
              step="0.1"
              min="0"
              max="14"
              placeholder="7.4"
              value={ph}
              onChange={(e) => setPh(e.target.value)}
            />
          </Field>
          <Field label="Cloro (mg/L)">
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder="2.0"
              value={chlorine}
              onChange={(e) => setChlorine(e.target.value)}
            />
          </Field>
          <Field label="Temp (°C)">
            <Input
              type="number"
              step="0.1"
              min="0"
              max="50"
              placeholder="29.5"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
            />
          </Field>
        </div>
        <Field
          label="Pessoas na piscina"
          help="Contagem manual no horário da medição."
        >
          <Input
            type="number"
            min="0"
            value={peopleCount}
            onChange={(e) => setPeopleCount(e.target.value)}
          />
        </Field>
        <Field label="Observações">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: água com aparência turva, adicionado cloro extra…"
            className="min-h-[80px]"
          />
        </Field>
        {error && <p className="text-rose text-[0.82rem] mb-2">{error}</p>}
      </form>
      <div className="flex items-center justify-end gap-3 -mt-3">
        <Button variant="ghost" onClick={onClose} type="button">
          Cancelar
        </Button>
        <Button
          variant="ink"
          type="submit"
          form="pool-inspection-form"
          disabled={saving}
        >
          {saving ? "Salvando…" : isEdit ? "Salvar" : "Registrar"}
          <Icon name="check" />
        </Button>
      </div>
    </Dialog>
  );
}
