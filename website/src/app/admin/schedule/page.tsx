"use client";

import { useState } from "react";
import { useApolloClient } from "@apollo/client/react";
import { Topbar } from "@/components/admin/Topbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { useSchedule } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { NewClassDialog } from "./NewClassDialog";

const WEEKDAYS = [
  { value: 1, label: "Seg", date: "07" },
  { value: 2, label: "Ter", date: "08" },
  { value: 3, label: "Qua", date: "09" },
  { value: 4, label: "Qui", date: "10" },
  { value: 5, label: "Sex", date: "11" },
  { value: 6, label: "Sáb", date: "12" },
  { value: 0, label: "Dom", date: "13" },
];

const HOURS = ["06:00", "08:00", "10:00", "17:00", "18:30", "19:30"];

const COLOR_CLS = {
  ink: "bg-ink-900 text-paper border-ink-700",
  flame: "bg-flame text-white border-flame-dark",
  pine: "bg-pine text-white border-pine",
};

export default function SchedulePage() {
  const { data, loading, error } = useSchedule();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [dialogOpen, setDialogOpen] = useState(false);
  const apollo = useApolloClient();

  return (
    <>
      <Topbar title="Agenda" />
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
                      ? "bg-ink-900 text-paper"
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
                      ? "bg-ink-900 text-paper"
                      : "text-ink-500 hover:text-ink-900",
                  )}
                >
                  <Icon name="list" /> Lista
                </button>
              </div>
              <Button variant="ink" onClick={() => setDialogOpen(true)}>
                <Icon name="plus" /> Nova aula
              </Button>
            </>
          }
        />

        {loading && <div className="text-ink-400">Carregando…</div>}
        {error && <div className="text-rose">{error.message}</div>}

        {data && (
          <>
            {/* Week navigator */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <button className="w-10 h-10 rounded-full border border-line bg-white hover:border-ink-900 text-ink-700 flex items-center justify-center transition-colors">
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
                <button className="w-10 h-10 rounded-full border border-line bg-white hover:border-ink-900 text-ink-700 flex items-center justify-center transition-colors">
                  <Icon name="arrow-right" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_280px] gap-5 max-[980px]:grid-cols-1">
              {/* Week grid */}
              <Card className="p-0 overflow-hidden">
                {view === "grid" ? (
                  <div className="overflow-x-auto">
                    <div className="min-w-[900px]">
                      <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-line bg-paper-50">
                        <div className="p-3" />
                        {WEEKDAYS.map((day) => (
                          <div
                            key={day.value}
                            className="p-3 text-center border-l border-line"
                          >
                            <div className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-400">
                              {day.label}
                            </div>
                            <div className="font-display text-[1.25rem] font-semibold text-ink-900 mt-1">
                              {day.date}
                            </div>
                          </div>
                        ))}
                      </div>
                      {HOURS.map((hour) => (
                        <div
                          key={hour}
                          className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-line/60 last:border-b-0 min-h-[90px]"
                        >
                          <div className="p-3 font-mono text-[0.78rem] text-ink-400 border-r border-line">
                            {hour}
                          </div>
                          {WEEKDAYS.map((day) => {
                            const cls = data.classes.find(
                              (c) =>
                                c.weekday === day.value && c.startTime === hour,
                            );
                            return (
                              <div
                                key={day.value}
                                className="p-2 border-l border-line/60"
                              >
                                {cls && (
                                  <div
                                    className={cn(
                                      "rounded-lg p-2 border h-full",
                                      COLOR_CLS[cls.color],
                                    )}
                                  >
                                    <div className="font-semibold text-[0.78rem] leading-tight">
                                      {cls.name}
                                    </div>
                                    <div className="text-[0.68rem] opacity-85 mt-1 font-mono">
                                      {cls.instructor}
                                    </div>
                                    <div className="font-mono text-[0.68rem] mt-1">
                                      {cls.booked}/{cls.capacity}
                                    </div>
                                  </div>
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
                    {data.classes.map((cls) => (
                      <div
                        key={cls.id}
                        className="flex items-center gap-4 p-4 hover:bg-paper-50 transition-colors"
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
                            {WEEKDAYS.find((d) => d.value === cls.weekday)?.label}{" "}
                            · {cls.startTime}–{cls.endTime} · {cls.instructor}
                          </div>
                        </div>
                        <div className="font-mono text-[0.82rem] text-ink-700">
                          {cls.booked}/{cls.capacity}
                        </div>
                      </div>
                    ))}
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
                    {data.upcoming.map((u) => (
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
      </main>
    </>
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
