"use client";

import { useMemo, useState } from "react";
import { Topbar } from "@/components/admin/Topbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import {
  useDailyAttendance,
  useCheckInBooking,
  useUpdateBookingStatus,
} from "@/lib/hooks";
import { cn } from "@/lib/utils";
import type {
  DailyAttendanceClass,
  ScheduleBooking,
} from "@/lib/types";

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return toIsoDate(d);
}

function formatDateLong(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const STATUS_LABEL: Record<ScheduleBooking["status"], string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  attended: "Presente",
  missed: "Faltou",
};

const STATUS_TONE: Record<ScheduleBooking["status"], string> = {
  scheduled: "bg-paper-2 text-ink-700",
  confirmed: "bg-pine-50 text-pine",
  cancelled: "bg-paper-2 text-ink-400 line-through",
  attended: "bg-flame-50 text-flame-dark",
  missed: "bg-rose/10 text-rose",
};

export default function AttendancePage() {
  const [date, setDate] = useState<string>(() => toIsoDate(new Date()));
  const [query, setQuery] = useState("");
  const { data, loading, error } = useDailyAttendance(date);

  const filteredClasses = useMemo(() => {
    if (!data) return [];
    if (!query) return data.classes;
    const q = query.toLowerCase();
    return data.classes.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.bookings.some((b) => b.studentName.toLowerCase().includes(q)),
    );
  }, [data, query]);

  return (
    <>
      <Topbar
        title="Presenças"
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Buscar aluno ou turma…"
      />
      <main className="flex-1 p-8 max-[720px]:p-4">
        <PageHeader
          title="Lista de presença"
          subtitle={
            data
              ? `${data.weekdayLabel} · ${formatDateLong(data.date)}`
              : "Selecione um dia para ver as turmas e marcar presença."
          }
        />

        {/* Date navigator */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setDate(addDays(date, -1))}
            aria-label="Dia anterior"
            className="w-10 h-10 rounded-full border border-line bg-white hover:border-ink-900 text-ink-700 flex items-center justify-center transition-colors"
          >
            <Icon name="arrow-left" />
          </button>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 rounded-full border border-line bg-white text-[0.92rem] text-ink-900 focus:outline-none focus:border-ink-900"
          />
          <button
            onClick={() => setDate(addDays(date, 1))}
            aria-label="Próximo dia"
            className="w-10 h-10 rounded-full border border-line bg-white hover:border-ink-900 text-ink-700 flex items-center justify-center transition-colors"
          >
            <Icon name="arrow-right" />
          </button>
          <button
            onClick={() => setDate(toIsoDate(new Date()))}
            className="px-3 py-2 rounded-full text-[0.78rem] font-medium text-ink-500 hover:text-ink-900 hover:bg-paper-2 transition-colors"
          >
            Hoje
          </button>
        </div>

        {loading && <LoadingState />}
        {error && <div className="text-rose">{error.message}</div>}

        {data && !loading && (
          <>
            {filteredClasses.length === 0 && (
              <Card className="p-10 text-center">
                <div className="font-display text-[1.05rem] font-semibold text-ink-900">
                  {data.classes.length === 0
                    ? "Sem aulas neste dia"
                    : "Nenhuma turma corresponde à busca"}
                </div>
                <p className="text-[0.88rem] text-ink-500 mt-1">
                  {data.classes.length === 0
                    ? "Volte na grade da agenda para programar uma turma."
                    : "Limpe o filtro para ver todas as turmas do dia."}
                </p>
              </Card>
            )}

            <div className="flex flex-col gap-4">
              {filteredClasses.map((cls) => (
                <ClassCard key={cls.scheduleDocumentId} cls={cls} />
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}

function ClassCard({ cls }: { cls: DailyAttendanceClass }) {
  const [collapsed, setCollapsed] = useState(false);
  const fillPct =
    cls.capacity && cls.capacity > 0
      ? Math.min(100, Math.round((cls.bookedCount / cls.capacity) * 100))
      : 0;

  return (
    <Card className="p-0 overflow-hidden">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center gap-4 p-5 hover:bg-paper-50 transition-colors text-left"
      >
        <div className="font-mono text-[0.82rem] text-ink-400 shrink-0 w-20">
          {cls.startTime}–{cls.endTime}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-[1.05rem] font-semibold text-ink-900 truncate">
            {cls.name}
          </div>
          <div className="font-mono text-[0.74rem] text-ink-400 mt-[2px] truncate">
            {cls.instructor || "Sem instrutor"}
            {cls.room && ` · ${cls.room}`}
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
          <div className="font-mono text-[0.78rem] text-ink-700">
            {cls.bookedCount}
            {cls.capacity ? `/${cls.capacity}` : ""} reservas
          </div>
          {cls.capacity ? (
            <div className="w-32 h-1.5 bg-paper-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-flame rounded-full"
                style={{ width: `${fillPct}%` }}
              />
            </div>
          ) : null}
        </div>
        <AttendanceTally
          attended={cls.attendedCount}
          missed={cls.missedCount}
          remaining={cls.bookedCount - cls.attendedCount - cls.missedCount}
        />
        <Icon
          name={collapsed ? "arrow-right" : "arrow-left"}
          className={cn(
            "transition-transform shrink-0 text-ink-400",
            collapsed ? "" : "rotate-90",
          )}
        />
      </button>

      {!collapsed && (
        <div className="border-t border-line">
          {cls.bookings.length === 0 ? (
            <div className="p-6 text-center text-[0.88rem] text-ink-400">
              Sem reservas para esta aula.
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {cls.bookings.map((b) => (
                <BookingRow key={b.documentId} booking={b} />
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}

function AttendanceTally({
  attended,
  missed,
  remaining,
}: {
  attended: number;
  missed: number;
  remaining: number;
}) {
  return (
    <div className="hidden md:flex items-center gap-1 shrink-0">
      <Tally tone="bg-flame-50 text-flame-dark" value={attended} />
      <Tally tone="bg-rose/10 text-rose" value={missed} />
      <Tally tone="bg-paper-2 text-ink-500" value={remaining} />
    </div>
  );
}

function Tally({ tone, value }: { tone: string; value: number }) {
  return (
    <span
      className={cn(
        "font-mono text-[0.72rem] font-semibold w-7 h-7 rounded-full inline-flex items-center justify-center",
        tone,
      )}
    >
      {value}
    </span>
  );
}

function BookingRow({ booking }: { booking: ScheduleBooking }) {
  const [checkIn, { loading: checkingIn }] = useCheckInBooking();
  const [updateStatus, { loading: updating }] = useUpdateBookingStatus();
  const busy = checkingIn || updating;

  async function markAttended() {
    try {
      await checkIn({ variables: { documentId: booking.documentId } });
    } catch {
      /* surfaced via Apollo error link */
    }
  }
  async function markMissed() {
    try {
      await updateStatus({
        variables: {
          documentId: booking.documentId,
          data: { status: "missed" },
        },
      });
    } catch {
      /* swallow */
    }
  }
  async function reset() {
    try {
      await updateStatus({
        variables: {
          documentId: booking.documentId,
          data: { status: "confirmed", checkedInAt: null },
        },
      });
    } catch {
      /* swallow */
    }
  }

  const isFinal = booking.status === "attended" || booking.status === "missed";

  return (
    <li className="flex items-center gap-3 p-4">
      <Avatar booking={booking} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[0.92rem] text-ink-900 truncate">
          {booking.studentName}
        </div>
        {booking.checkedInAt && (
          <div className="font-mono text-[0.7rem] text-ink-400 mt-[2px]">
            Check-in {formatTime(booking.checkedInAt)}
          </div>
        )}
      </div>
      <span
        className={cn(
          "font-mono text-[0.66rem] uppercase tracking-[0.08em] px-2 py-1 rounded-full",
          STATUS_TONE[booking.status],
        )}
      >
        {STATUS_LABEL[booking.status]}
      </span>
      {!isFinal && booking.status !== "cancelled" && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={markAttended}
            disabled={busy}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-ink-900 text-paper text-[0.78rem] font-medium hover:bg-ink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Icon name="check" /> Presente
          </button>
          <button
            type="button"
            onClick={markMissed}
            disabled={busy}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-line text-ink-700 text-[0.78rem] font-medium hover:border-rose hover:text-rose disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Icon name="x" /> Faltou
          </button>
        </div>
      )}
      {isFinal && (
        <button
          type="button"
          onClick={reset}
          disabled={busy}
          aria-label="Desfazer marcação"
          title="Desfazer marcação"
          className="w-8 h-8 rounded-full text-ink-400 hover:text-ink-900 hover:bg-paper-2 inline-flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <Icon name="x" />
        </button>
      )}
    </li>
  );
}

function Avatar({ booking }: { booking: ScheduleBooking }) {
  if (booking.studentPhotoUrl) {
    return (
      <div className="w-10 h-10 rounded-full overflow-hidden bg-paper-2 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={booking.studentPhotoUrl}
          alt={booking.studentName}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-flame to-flame-dark text-white flex items-center justify-center font-mono text-[0.78rem] font-semibold shrink-0">
      {booking.studentInitials}
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
