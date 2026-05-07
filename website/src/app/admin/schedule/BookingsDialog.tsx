"use client";

import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { LoadingState } from "@/components/ui/LoadingState";
import { useCheckInBooking, useScheduleBookings } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import type { ScheduleBooking } from "@/lib/types";

export interface BookingsSelection {
  scheduleDocumentId: string;
  className: string;
  /** ISO date "YYYY-MM-DD". */
  date: string;
  /** Human label, e.g. "Seg, 06 abr · 06:00–07:00". */
  dateLabel: string;
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

export function BookingsDialog({
  selection,
  onClose,
  onEdit,
}: {
  selection: BookingsSelection | null;
  onClose: () => void;
  onEdit?: (scheduleDocumentId: string) => void;
}) {
  const { data, loading, error, refetch } = useScheduleBookings(
    selection?.scheduleDocumentId ?? null,
    selection?.date ?? null,
  );
  const [checkIn, { loading: checkingIn }] = useCheckInBooking();

  async function handleCheckIn(documentId: string) {
    try {
      await checkIn({ variables: { documentId } });
      refetch?.();
    } catch {
      // The mutation surface already toasts via Apollo error link in
      // the wider app — swallow here to keep the row interaction tight.
    }
  }

  return (
    <Dialog
      open={!!selection}
      onClose={onClose}
      title={selection?.className ?? "Aula"}
      subtitle={selection?.dateLabel}
      wide
      actions={
        onEdit && selection ? (
          <button
            type="button"
            onClick={() => onEdit(selection.scheduleDocumentId)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[0.82rem] font-medium text-ink-700 hover:text-ink-900 hover:bg-paper-2 transition-colors"
          >
            <Icon name="edit" /> Editar turma
          </button>
        ) : undefined
      }
    >
      {loading && <LoadingState />}
      {error && (
        <div className="text-rose text-[0.88rem]">{error.message}</div>
      )}
      {!loading && !error && (
        <>
          {(data?.length ?? 0) === 0 ? (
            <div className="text-center py-10">
              <div className="font-display text-[1rem] font-semibold text-ink-900">
                Sem reservas para este dia
              </div>
              <p className="text-[0.88rem] text-ink-500 mt-1">
                As reservas aparecem aqui assim que alunos se inscreverem para
                a aula.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {data!.map((b) => (
                <li
                  key={b.documentId}
                  className="flex items-center gap-3 py-3"
                >
                  <BookingAvatar booking={b} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[0.92rem] text-ink-900 truncate">
                      {b.studentName}
                    </div>
                    {b.checkedInAt && (
                      <div className="font-mono text-[0.7rem] text-ink-400 mt-[2px]">
                        Check-in {formatTime(b.checkedInAt)}
                      </div>
                    )}
                  </div>
                  <span
                    className={cn(
                      "font-mono text-[0.68rem] uppercase tracking-[0.08em] px-2 py-1 rounded-full",
                      STATUS_TONE[b.status],
                    )}
                  >
                    {STATUS_LABEL[b.status]}
                  </span>
                  {b.status !== "attended" && b.status !== "cancelled" && (
                    <button
                      type="button"
                      onClick={() => handleCheckIn(b.documentId)}
                      disabled={checkingIn}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-ink-900 text-paper text-[0.78rem] font-medium hover:bg-ink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Icon name="check" /> Check-in
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Dialog>
  );
}

function BookingAvatar({ booking }: { booking: ScheduleBooking }) {
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
