/**
 * useScheduleWeek — single data entrypoint for the Agenda tab (Fase 2).
 *
 * Same mock-vs-API contract as useDashboard:
 *   EXPO_PUBLIC_USE_MOCKS=true  → returns MOCK_SCHEDULE, book/cancel are
 *                                 no-ops that surface a "demo mode" message.
 *   EXPO_PUBLIC_USE_MOCKS=false → runs MyScheduleWeek via Apollo, exposes
 *                                 real bookClass / cancelMyBooking mutations.
 *
 * The backend returns a flat list of occurrences (one schedule × date); the
 * hook buckets them into the 7 days of the current week so the screen keeps
 * its day-picker layout.
 */

import { useCallback, useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';

import { USE_MOCKS } from '../lib/config';
import { MOCK_SCHEDULE } from '../lib/mock-data';
import {
  BookClassDocument,
  CancelMyBookingDocument,
  MyScheduleWeekDocument,
} from '../gql/graphql';
import {
  buildWeekDays,
  hhmm,
  mondayOfWeekISO,
  todayISO,
} from '../lib/format';
import type {
  BookingActionResult,
  ClassBookingStatus,
  ClassSlot,
  ScheduleDay,
  ScheduleWeekResult,
} from '../lib/types';

/* ------------------------------------------------------------------
 * Mock branch
 * ------------------------------------------------------------------ */
const DEMO: BookingActionResult = {
  ok: false,
  message: 'Modo demonstração — reservas reais precisam do backend.',
};

function useMockScheduleWeek(): ScheduleWeekResult {
  const days = useMemo<ScheduleDay[]>(() => MOCK_SCHEDULE, []);
  const noop = useCallback(async (): Promise<BookingActionResult> => DEMO, []);
  return {
    days,
    loading: false,
    error: null,
    acting: false,
    refetch: () => {},
    book: noop,
    cancel: noop,
  };
}

/* ------------------------------------------------------------------
 * API branch
 * ------------------------------------------------------------------ */
function mapOccurrence(o: any): ClassSlot {
  const status: ClassBookingStatus = o.bookedByMe
    ? o.myBookingStatus === 'waitlist'
      ? 'waitlisted'
      : 'booked'
    : o.isFull
      ? 'waitlist'
      : 'available';

  return {
    id: `${o.scheduleDocumentId}|${o.date}`,
    startTime: hhmm(o.startTime),
    endTime: hhmm(o.endTime),
    name: o.name,
    instructor: (o.instructor ?? '').toUpperCase(),
    room: (o.room ?? '').toUpperCase(),
    capacity: o.maxCapacity ?? 0,
    taken: o.bookedCount ?? 0,
    status,
    scheduleDocumentId: o.scheduleDocumentId,
    date: o.date,
    bookable: !!o.bookable,
    bookingDocumentId: o.myBookingDocumentId ?? null,
    unlimited: o.maxCapacity == null,
  };
}

/** Pulls the human message out of an Apollo/GraphQL error. */
function gqlMessage(err: any, fallback: string): string {
  return (
    err?.graphQLErrors?.[0]?.message ??
    err?.errors?.[0]?.message ??
    (typeof err?.message === 'string' && !err.message.includes('go.apollo.dev')
      ? err.message
      : null) ??
    fallback
  );
}

function useApiScheduleWeek(): ScheduleWeekResult {
  const { data, loading, error, refetch } = useQuery<any>(MyScheduleWeekDocument, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });
  const [bookMutation, bookState] = useMutation<any>(BookClassDocument);
  const [cancelMutation, cancelState] = useMutation<any>(CancelMyBookingDocument);

  const days = useMemo<ScheduleDay[]>(() => {
    const today = todayISO();
    const monday = mondayOfWeekISO(today);
    const occ: any[] = data?.myScheduleWeek ?? [];
    const byDate = new Map<string, ClassSlot[]>();
    for (const o of occ) {
      const list = byDate.get(o.date) ?? [];
      list.push(mapOccurrence(o));
      byDate.set(o.date, list);
    }
    return buildWeekDays(monday, today).map((d) => ({
      ...d,
      classes: byDate.get(d.id) ?? [],
    }));
  }, [data]);

  const refetchFn = useCallback(() => {
    refetch().catch(() => {
      /* surfaced via `error` already */
    });
  }, [refetch]);

  const book = useCallback(
    async (slot: ClassSlot): Promise<BookingActionResult> => {
      if (!slot.scheduleDocumentId || !slot.date) {
        return { ok: false, message: 'Dados da aula ausentes.' };
      }
      try {
        const res = await bookMutation({
          variables: {
            scheduleDocumentId: slot.scheduleDocumentId,
            date: slot.date,
          },
        });
        await refetch();
        const status = res.data?.bookClass?.status;
        return {
          ok: true,
          status,
          message:
            status === 'waitlist'
              ? 'Turma cheia — você entrou na lista de espera.'
              : 'Reserva confirmada!',
        };
      } catch (err) {
        return { ok: false, message: gqlMessage(err, 'Não foi possível reservar.') };
      }
    },
    [bookMutation, refetch],
  );

  const cancel = useCallback(
    async (slot: ClassSlot): Promise<BookingActionResult> => {
      if (!slot.bookingDocumentId) {
        return { ok: false, message: 'Reserva não encontrada.' };
      }
      try {
        const res = await cancelMutation({
          variables: { documentId: slot.bookingDocumentId },
        });
        await refetch();
        return {
          ok: true,
          status: res.data?.cancelMyBooking?.status,
          message: 'Reserva cancelada.',
        };
      } catch (err) {
        return { ok: false, message: gqlMessage(err, 'Não foi possível cancelar.') };
      }
    },
    [cancelMutation, refetch],
  );

  const normalizedError = useMemo<Error | null>(
    () => (error ? new Error(error.message || 'Falha ao carregar a agenda') : null),
    [error],
  );

  return {
    days,
    loading,
    error: normalizedError,
    acting: bookState.loading || cancelState.loading,
    refetch: refetchFn,
    book,
    cancel,
  };
}

/* ------------------------------------------------------------------
 * Public hook — branch fixed at build time (env inlined), same as useDashboard.
 * ------------------------------------------------------------------ */
export function useScheduleWeek(): ScheduleWeekResult {
  if (USE_MOCKS) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMockScheduleWeek();
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useApiScheduleWeek();
}
