/**
 * useDependentSchedule — the dependent agenda for a guardian (Fase 6).
 *
 * Returns the same `ScheduleWeekResult` contract as useScheduleWeek so the
 * shared ScheduleWeekView renders both screens identically. `book` reserves on
 * the dependent's behalf (bookClassForDependent); `cancel` reuses
 * CancelMyBooking, which already resolves dependent ownership via the guardian.
 */

import { useCallback, useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';

import { USE_MOCKS } from '../lib/config';
import { MOCK_SCHEDULE } from '../lib/mock-data';
import {
  BookClassForDependentDocument,
  CancelMyBookingDocument,
  DependentScheduleWeekDocument,
} from '../gql/graphql';
import { buildWeekDays, mondayOfWeekISO, todayISO } from '../lib/format';
import { gqlMessage, mapOccurrence } from './useScheduleWeek';
import type {
  BookingActionResult,
  ClassSlot,
  ScheduleDay,
  ScheduleWeekResult,
} from '../lib/types';

const DEMO: BookingActionResult = {
  ok: false,
  message: 'Modo demonstração — reservas reais precisam do backend.',
};

function useMockDependentSchedule(): ScheduleWeekResult {
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

function useApiDependentSchedule(dependentId: string): ScheduleWeekResult {
  const { data, loading, error, refetch } = useQuery<any>(
    DependentScheduleWeekDocument,
    {
      variables: { dependentId },
      skip: !dependentId,
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
  );
  const [bookMutation, bookState] = useMutation<any>(BookClassForDependentDocument);
  const [cancelMutation, cancelState] = useMutation<any>(CancelMyBookingDocument);

  const days = useMemo<ScheduleDay[]>(() => {
    const today = todayISO();
    const monday = mondayOfWeekISO(today);
    const occ: any[] = data?.dependentScheduleWeek ?? [];
    const byDate = new Map<string, ClassSlot[]>();
    for (const o of occ) {
      const slotList = byDate.get(o.date) ?? [];
      slotList.push(mapOccurrence(o));
      byDate.set(o.date, slotList);
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
            dependentId,
            scheduleDocumentId: slot.scheduleDocumentId,
            date: slot.date,
          },
        });
        await refetch();
        const status = res.data?.bookClassForDependent?.status;
        return {
          ok: true,
          status,
          message:
            status === 'waitlist'
              ? 'Turma cheia — entrou na lista de espera.'
              : 'Reserva confirmada!',
        };
      } catch (err) {
        return { ok: false, message: gqlMessage(err, 'Não foi possível reservar.') };
      }
    },
    [bookMutation, refetch, dependentId],
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

export function useDependentSchedule(dependentId: string): ScheduleWeekResult {
  if (USE_MOCKS) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMockDependentSchedule();
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useApiDependentSchedule(dependentId);
}
