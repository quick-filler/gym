"use client";

import { useDeferredValue } from "react";
import { useQuery } from "@apollo/client/react";
import { Icon } from "@/components/ui/Icon";
import { USE_MOCKS } from "@/lib/config";
import { SCHEDULE_CONFLICTS } from "@/lib/hooks";

const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface ConflictWarningProps {
  weekdays: number[];
  startTime: string;
  endTime: string;
  instructor: string;
  room: string;
  /** Documents Id to ignore (the row being edited). Optional. */
  excludeDocumentId?: string | null;
}

export function ConflictWarning({
  weekdays,
  startTime,
  endTime,
  instructor,
  room,
  excludeDocumentId,
}: ConflictWarningProps) {
  // useDeferredValue defers the query while the user is still typing
  // — Apollo would otherwise fire a request per keystroke on the
  // instructor/room inputs.
  const dInst = useDeferredValue(instructor);
  const dRoom = useDeferredValue(room);
  const dStart = useDeferredValue(startTime);
  const dEnd = useDeferredValue(endTime);

  // Only query once we have the minimum data to find a conflict at all:
  // at least one weekday, a valid time pair, and either an instructor or
  // room set. Otherwise there's literally nothing to clash against.
  const ready =
    weekdays.length > 0 &&
    !!dStart &&
    !!dEnd &&
    (dInst.trim() !== "" || dRoom.trim() !== "");

  const { data } = useQuery(SCHEDULE_CONFLICTS, {
    variables: {
      input: {
        weekdays,
        startTime: dStart,
        endTime: dEnd,
        instructor: dInst.trim() || null,
        room: dRoom.trim() || null,
        excludeDocumentId: excludeDocumentId ?? null,
      },
    },
    skip: USE_MOCKS || !ready,
    fetchPolicy: "cache-and-network",
  });

  if (USE_MOCKS) return null;
  const conflicts = data?.scheduleConflicts ?? [];
  if (conflicts.length === 0) return null;

  return (
    <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3">
      <div className="flex items-start gap-2 text-amber-900">
        <Icon name="zap" />
        <div className="flex-1">
          <div className="font-semibold text-[0.88rem] mb-1">
            Conflito detectado
          </div>
          <ul className="text-[0.82rem] space-y-1 list-disc pl-4">
            {conflicts.map((c, idx) => {
              if (!c) return null;
              const days = c.days
                .map((d) => WEEKDAY_SHORT[d])
                .filter(Boolean)
                .join(", ");
              const noun = c.reason === "instructor" ? "instrutor" : "sala";
              const target =
                c.reason === "instructor"
                  ? c.schedule.instructor
                  : c.schedule.room;
              return (
                <li key={idx}>
                  <span className="font-medium">{c.schedule.name}</span> usa o
                  mesmo {noun}
                  {target ? ` (${target})` : ""} {days && `nas ${days}`},{" "}
                  {c.schedule.startTime}–{c.schedule.endTime}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
