"use client";

import { useMemo, useState } from "react";
import { useApolloClient } from "@apollo/client/react";
import { Topbar } from "@/components/admin/Topbar";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { useSchedule } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { NewClassDialog } from "./NewClassDialog";
import { EditClassDialog } from "./EditClassDialog";
import { InlineClassEditor } from "./InlineClassEditor";
import {
  BookingsDialog,
  type BookingsSelection,
} from "./BookingsDialog";

const WEEKDAY_LABELS = [
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
  { value: 0, label: "Dom" },
] as const;

const COLOR_CLS = {
  ink: "bg-ink-900 text-paper border-ink-700",
  flame: "bg-flame text-white border-flame-dark",
  pine: "bg-pine text-white border-pine",
};

/** Monday 00:00 of the week containing `d`. */
function startOfWeek(d: Date): Date {
  const m = new Date(d);
  m.setHours(0, 0, 0, 0);
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const SHORT_MONTHS_PT = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

function formatDayLabel(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")} ${SHORT_MONTHS_PT[d.getMonth()]}`;
}

export default function SchedulePage() {
  const [weekAnchor, setWeekAnchor] = useState<Date>(() => startOfWeek(new Date()));
  const weekStartIso = useMemo(() => toIsoDate(weekAnchor), [weekAnchor]);
  const { data, loading, error } = useSchedule({ weekStart: weekStartIso });
  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selection, setSelection] = useState<BookingsSelection | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingInline, setEditingInline] = useState<{
    scheduleDocumentId: string;
    weekday: number;
    hour: string;
    dayIso: string;
    dayLabel: string;
    anchorRect: { top: number; left: number; right: number; bottom: number };
  } | null>(null);
  const [modalityFilter, setModalityFilter] = useState<
    "" | "presential" | "online"
  >("");
  const [instructorFilter, setInstructorFilter] = useState<string>("");
  const apollo = useApolloClient();

  const weekDays = useMemo(
    () =>
      WEEKDAY_LABELS.map((day) => {
        const offset = day.value === 0 ? 6 : day.value - 1; // Mon=0 … Sun=6
        const date = addDays(weekAnchor, offset);
        return {
          value: day.value,
          label: day.label,
          dayOfMonth: String(date.getDate()).padStart(2, "0"),
          fullDate: date,
          iso: toIsoDate(date),
        };
      }),
    [weekAnchor],
  );

  const allClasses = data?.classes ?? [];

  // Instructor list, deduped, alphabetical, blanks filtered out — feeds
  // the instructor dropdown so we don't hardcode a roster.
  const instructorOptions = useMemo(() => {
    const set = new Set<string>();
    for (const c of allClasses) if (c.instructor) set.add(c.instructor);
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [allClasses]);

  const filteredClasses = allClasses.filter((c) => {
    if (modalityFilter && c.modality !== modalityFilter) return false;
    if (instructorFilter && c.instructor !== instructorFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      if (
        !c.name.toLowerCase().includes(q) &&
        !c.instructor.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const filteredUpcoming = (data?.upcoming ?? []).filter(
    (u) =>
      !query ||
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.instructor.toLowerCase().includes(query.toLowerCase()),
  );

  const hasActiveFilter = !!(modalityFilter || instructorFilter);

  function clearFilters() {
    setModalityFilter("");
    setInstructorFilter("");
  }

  // Derive the time rows from the actual classes so a 07:30 turma doesn't
  // get hidden by a hardcoded grid. Falls back to a sensible default while
  // the page is loading.
  const hours = useMemo(() => {
    const set = new Set<string>();
    for (const c of filteredClasses) set.add(c.startTime);
    if (set.size === 0) {
      return ["06:00", "08:00", "10:00", "17:00", "18:30", "19:30"];
    }
    return Array.from(set).sort();
  }, [filteredClasses]);

  function openBookings(
    cls: (typeof filteredClasses)[number],
    iso: string,
    dateLabel: string,
  ) {
    setSelection({
      scheduleDocumentId: cls.scheduleDocumentId,
      className: cls.name,
      date: iso,
      dateLabel: `${dateLabel} · ${cls.startTime}–${cls.endTime} · ${cls.instructor || "Sem instrutor"}`,
    });
  }

  function openInlineEditor(
    cls: (typeof filteredClasses)[number],
    day: (typeof weekDays)[number],
    hour: string,
    triggerEl: HTMLElement,
  ) {
    const rect = triggerEl.getBoundingClientRect();
    setEditingInline({
      scheduleDocumentId: cls.scheduleDocumentId,
      weekday: day.value,
      hour,
      dayIso: day.iso,
      dayLabel: `${day.label}, ${formatDayLabel(day.fullDate)}`,
      anchorRect: {
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
      },
    });
  }

  function showBookingsForInline() {
    if (!editingInline) return;
    const cls = filteredClasses.find(
      (c) =>
        c.scheduleDocumentId === editingInline.scheduleDocumentId &&
        c.weekday === editingInline.weekday &&
        c.startTime === editingInline.hour,
    );
    if (!cls) return;
    openBookings(cls, editingInline.dayIso, editingInline.dayLabel);
    setEditingInline(null);
  }

  return (
    <>
      <Topbar
        title="Agenda"
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Buscar aula…"
      />
      <main className="flex-1 p-8 max-[720px]:p-4">
        <PageHeader
          title="Agenda"
          subtitle={data ? `Semana ${data.weekNumber} · ${data.weekLabel}` : ""}
          actions={
            <>
              <div className="flex items-center bg-white border border-line rounded-full p-1">
                <button
                  onClick={() => setView("grid")}
                  className={cn(
                    "px-4 py-2 rounded-full text-[0.8rem] font-medium transition-colors inline-flex items-center gap-1",
                    view === "grid"
                      ? "bg-flame text-white"
                      : "text-ink-500 hover:text-ink-900",
                  )}
                >
                  <Icon name="grid" /> Grade
                </button>
                <button
                  onClick={() => setView("list")}
                  className={cn(
                    "px-4 py-2 rounded-full text-[0.8rem] font-medium transition-colors inline-flex items-center gap-1",
                    view === "list"
                      ? "bg-flame text-white"
                      : "text-ink-500 hover:text-ink-900",
                  )}
                >
                  <Icon name="list" /> Lista
                </button>
              </div>
              <Button variant="primary" onClick={() => setDialogOpen(true)}>
                <Icon name="plus" /> Nova aula
              </Button>
            </>
          }
        />

        {loading && <LoadingState />}
        {error && <div className="text-rose">{error.message}</div>}

        {data && (
          <>
            {/* Week navigator */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWeekAnchor((d) => addDays(d, -7))}
                  aria-label="Semana anterior"
                  className="w-10 h-10 rounded-full border border-line bg-white hover:border-ink-900 text-ink-700 flex items-center justify-center transition-colors"
                >
                  <Icon name="arrow-left" />
                </button>
                <div className="px-4">
                  <div className="font-display text-[1.05rem] font-semibold text-ink-900">
                    {data.weekLabel}
                  </div>
                  <div className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-flame">
                    Semana {data.weekNumber}
                  </div>
                </div>
                <button
                  onClick={() => setWeekAnchor((d) => addDays(d, 7))}
                  aria-label="Próxima semana"
                  className="w-10 h-10 rounded-full border border-line bg-white hover:border-ink-900 text-ink-700 flex items-center justify-center transition-colors"
                >
                  <Icon name="arrow-right" />
                </button>
                <button
                  onClick={() => setWeekAnchor(startOfWeek(new Date()))}
                  className="ml-2 px-3 py-2 rounded-full text-[0.78rem] font-medium text-ink-500 hover:text-ink-900 hover:bg-paper-2 transition-colors"
                >
                  Hoje
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <FilterPill
                  label="Modalidade"
                  value={modalityFilter}
                  onChange={(v) =>
                    setModalityFilter(v as "" | "presential" | "online")
                  }
                  options={[
                    { value: "", label: "Todas" },
                    { value: "presential", label: "Presencial" },
                    { value: "online", label: "Online" },
                  ]}
                />
                <FilterPill
                  label="Instrutor"
                  value={instructorFilter}
                  onChange={setInstructorFilter}
                  options={[
                    { value: "", label: "Todos" },
                    ...instructorOptions.map((i) => ({
                      value: i,
                      label: i,
                    })),
                  ]}
                />
                {hasActiveFilter && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-2 rounded-full text-[0.78rem] font-medium text-ink-500 hover:text-ink-900 hover:bg-paper-2 transition-colors inline-flex items-center gap-1"
                  >
                    <Icon name="x" /> Limpar
                  </button>
                )}
              </div>
            </div>

            {filteredClasses.length === 0 && (hasActiveFilter || query) && (
              <div className="mb-5 p-4 rounded-xl border border-line bg-paper-50 text-[0.88rem] text-ink-500">
                Nenhuma turma corresponde aos filtros aplicados.{" "}
                <button
                  onClick={clearFilters}
                  className="text-flame hover:underline font-medium"
                >
                  Limpar filtros
                </button>
              </div>
            )}

            <div className="grid grid-cols-[1fr_280px] gap-5 max-[980px]:grid-cols-1">
              {/* Week grid */}
              <Card className="p-0 overflow-hidden">
                {view === "grid" ? (
                  <div className="overflow-x-auto">
                    <div className="min-w-[900px]">
                      <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-line bg-paper-50">
                        <div className="p-3" />
                        {weekDays.map((day) => (
                          <div
                            key={day.value}
                            className="p-3 text-center border-l border-line"
                          >
                            <div className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-400">
                              {day.label}
                            </div>
                            <div className="font-display text-[1.25rem] font-semibold text-ink-900 mt-1">
                              {day.dayOfMonth}
                            </div>
                          </div>
                        ))}
                      </div>
                      {hours.map((hour) => (
                        <div
                          key={hour}
                          className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-line/60 last:border-b-0 min-h-[90px]"
                        >
                          <div className="p-3 font-mono text-[0.78rem] text-ink-400 border-r border-line">
                            {hour}
                          </div>
                          {weekDays.map((day, dayIdx) => {
                            const matches = filteredClasses.filter(
                              (c) =>
                                c.weekday === day.value && c.startTime === hour,
                            );
                            // When two or more classes share a slot,
                            // switch to a compact single-line layout
                            // (name + capacity badge) so they stay legible
                            // inside the 90px row instead of squashing
                            // the full card. Tooltip shows the instructor.
                            const compact = matches.length > 1;
                            const isEditingHere =
                              editingInline?.weekday === day.value &&
                              editingInline?.hour === hour &&
                              matches.some(
                                (c) =>
                                  c.scheduleDocumentId ===
                                  editingInline.scheduleDocumentId,
                              );
                            // Anchor the editor toward the right on the
                            // last three columns so it expands toward the
                            // page interior instead of overflowing.
                            const editorAlign = dayIdx >= 4 ? "right" : "left";
                            return (
                              <div
                                key={day.value}
                                className="relative p-2 border-l border-line/60 flex flex-col gap-1"
                              >
                                {matches.map((cls) =>
                                  compact ? (
                                    <button
                                      key={cls.id}
                                      type="button"
                                      title={
                                        cls.instructor
                                          ? `${cls.name} · ${cls.instructor}`
                                          : cls.name
                                      }
                                      onClick={(e) =>
                                        openInlineEditor(
                                          cls,
                                          day,
                                          hour,
                                          e.currentTarget,
                                        )
                                      }
                                      className={cn(
                                        "rounded-md px-2 py-1 border flex items-center gap-2 hover:brightness-110 transition-all cursor-pointer",
                                        COLOR_CLS[cls.color],
                                      )}
                                    >
                                      <span className="font-semibold text-[0.74rem] leading-tight truncate flex-1 text-left">
                                        {cls.name}
                                      </span>
                                      <span className="font-mono text-[0.66rem] opacity-90 shrink-0">
                                        {cls.booked}/{cls.capacity}
                                      </span>
                                    </button>
                                  ) : (
                                    <button
                                      key={cls.id}
                                      type="button"
                                      onClick={(e) =>
                                        openInlineEditor(
                                          cls,
                                          day,
                                          hour,
                                          e.currentTarget,
                                        )
                                      }
                                      className={cn(
                                        "rounded-lg p-2 border w-full text-left hover:brightness-110 transition-all cursor-pointer",
                                        COLOR_CLS[cls.color],
                                      )}
                                    >
                                      <div className="font-semibold text-[0.78rem] leading-tight">
                                        {cls.name}
                                      </div>
                                      {cls.instructor && (
                                        <div className="text-[0.68rem] opacity-85 mt-1 font-mono truncate">
                                          {cls.instructor}
                                        </div>
                                      )}
                                      <div className="font-mono text-[0.68rem] mt-1">
                                        {cls.booked}/{cls.capacity}
                                      </div>
                                    </button>
                                  ),
                                )}
                                {isEditingHere && editingInline && (
                                  <InlineClassEditor
                                    documentId={
                                      editingInline.scheduleDocumentId
                                    }
                                    anchorRect={editingInline.anchorRect}
                                    align={editorAlign}
                                    onClose={() => setEditingInline(null)}
                                    onSaved={() =>
                                      apollo.refetchQueries({
                                        include: ["ScheduleWeek"],
                                      })
                                    }
                                    onShowBookings={showBookingsForInline}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-line">
                    {filteredClasses.map((cls) => {
                      const day = weekDays.find((d) => d.value === cls.weekday);
                      return (
                        <button
                          key={cls.id}
                          type="button"
                          onClick={() => {
                            if (!day) return;
                            openBookings(
                              cls,
                              day.iso,
                              `${day.label}, ${formatDayLabel(day.fullDate)}`,
                            );
                          }}
                          className="flex items-center gap-4 p-4 hover:bg-paper-50 transition-colors w-full text-left"
                        >
                          <div
                            className={cn(
                              "w-1.5 h-12 rounded-full",
                              cls.color === "ink"
                                ? "bg-ink-900"
                                : cls.color === "flame"
                                  ? "bg-flame"
                                  : "bg-pine",
                            )}
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-[0.92rem] text-ink-900">
                              {cls.name}
                            </div>
                            <div className="font-mono text-[0.74rem] text-ink-400 mt-[2px]">
                              {day?.label} · {cls.startTime}–{cls.endTime} ·{" "}
                              {cls.instructor || "Sem instrutor"}
                            </div>
                          </div>
                          <div className="font-mono text-[0.82rem] text-ink-700">
                            {cls.booked}/{cls.capacity}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* Stats + upcoming */}
              <div className="flex flex-col gap-5">
                <Card className="p-6">
                  <h3 className="font-display text-[1rem] font-semibold text-ink-900 mb-4">
                    Resumo da semana
                  </h3>
                  <div className="flex flex-col gap-4">
                    <StatRow
                      label="Aulas programadas"
                      value={`${data.stats.totalClasses}`}
                    />
                    <StatRow
                      label="Reservas ativas"
                      value={`${data.stats.totalBookings}`}
                    />
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-400">
                          Ocupação
                        </div>
                        <div className="font-mono text-[0.82rem] text-ink-900 font-semibold">
                          {data.stats.capacityFill}%
                        </div>
                      </div>
                      <div className="h-2 bg-paper-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-flame rounded-full"
                          style={{ width: `${data.stats.capacityFill}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-display text-[1rem] font-semibold text-ink-900 mb-4">
                    Próximas aulas
                  </h3>
                  <div className="flex flex-col gap-3">
                    {filteredUpcoming.map((u) => (
                      <div
                        key={u.id}
                        className="p-3 rounded-xl border border-line bg-paper-50"
                      >
                        <div className="font-semibold text-[0.88rem] text-ink-900">
                          {u.name}
                        </div>
                        <div className="font-mono text-[0.72rem] text-ink-400 mt-1">
                          {u.time} · {u.instructor}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}

        <NewClassDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onCreated={() =>
            apollo.refetchQueries({ include: ["ScheduleWeek"] })
          }
        />
        <BookingsDialog
          selection={selection}
          onClose={() => setSelection(null)}
          onEdit={(id) => {
            setSelection(null);
            setEditingId(id);
          }}
        />
        <EditClassDialog
          documentId={editingId}
          onClose={() => setEditingId(null)}
          onUpdated={() =>
            apollo.refetchQueries({ include: ["ScheduleWeek"] })
          }
        />
      </main>
    </>
  );
}

function FilterPill({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  const active = !!value;
  return (
    <label
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[0.8rem] font-medium transition-colors cursor-pointer",
        active
          ? "bg-ink-900 text-paper border-ink-900"
          : "bg-white text-ink-700 border-line hover:border-ink-900",
      )}
    >
      <span
        className={cn(
          "font-mono text-[0.66rem] uppercase tracking-[0.1em]",
          active ? "text-paper/70" : "text-ink-400",
        )}
      >
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent outline-none cursor-pointer pr-1"
        style={{ color: "inherit" }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-ink-900">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink-400">
        {label}
      </div>
      <div className="font-display text-[1.2rem] font-semibold text-ink-900">
        {value}
      </div>
    </div>
  );
}
