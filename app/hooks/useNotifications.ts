/**
 * useNotifications — inbox + unread badge (Fase 7c).
 *
 * Same mock/API contract as the other hooks. In API mode it runs
 * `AppNotifications` (list + count in one query) with a short `pollInterval`
 * for near-real-time delivery, and exposes markRead / markAllRead. Powers the
 * /notifications screen and the header bell badge.
 */

import { useCallback, useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';

import { USE_MOCKS } from '../lib/config';
import { timeAgoBR } from '../lib/format';
import {
  AppMarkAllNotificationsReadDocument,
  AppMarkNotificationReadDocument,
  AppNotificationsDocument,
} from '../gql/graphql';
import type { NotificationsResult, NotificationView } from '../lib/types';

const POLL_MS = 20000; // near-real-time without websockets

/* ------------------------------------------------------------------ */
function useMockNotifications(): NotificationsResult {
  const items = useMemo<NotificationView[]>(
    () => [
      {
        id: 'mock-1',
        kind: 'booking_confirmed',
        title: 'Reserva confirmada',
        body: 'Musculação A · seg, 07:00',
        timeLabel: 'há 2 h',
        read: false,
        route: '/(tabs)/schedule',
      },
      {
        id: 'mock-2',
        kind: 'payment_paid',
        title: 'Pagamento confirmado',
        body: 'Mensalidade · R$ 99,00',
        timeLabel: 'ontem',
        read: true,
        route: '/(tabs)/payments',
      },
    ],
    [],
  );
  const noop = useCallback(async () => {}, []);
  return {
    items,
    unreadCount: 1,
    loading: false,
    error: null,
    refetch: () => {},
    markRead: noop,
    markAllRead: noop,
  };
}

/* ------------------------------------------------------------------ */
function useApiNotifications(): NotificationsResult {
  const { data, loading, error, refetch } = useQuery<any>(AppNotificationsDocument, {
    variables: { limit: 40 },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
    pollInterval: POLL_MS,
  });
  const [markReadMut] = useMutation<any>(AppMarkNotificationReadDocument);
  const [markAllMut] = useMutation<any>(AppMarkAllNotificationsReadDocument);

  const items = useMemo<NotificationView[]>(() => {
    const rows: any[] = data?.myNotifications ?? [];
    return rows.map((n) => ({
      id: n.documentId,
      kind: n.kind,
      title: n.title,
      body: n.body ?? '',
      timeLabel: timeAgoBR(n.createdAt),
      read: !!n.read,
      route: n.data?.route ?? null,
    }));
  }, [data]);

  const unreadCount: number = data?.myUnreadNotificationCount ?? 0;

  const refetchFn = useCallback(() => {
    refetch().catch(() => {});
  }, [refetch]);

  const markRead = useCallback(
    async (id: string) => {
      try {
        await markReadMut({ variables: { documentId: id } });
        await refetch();
      } catch {
        /* surfaced via error */
      }
    },
    [markReadMut, refetch],
  );

  const markAllRead = useCallback(async () => {
    try {
      await markAllMut();
      await refetch();
    } catch {
      /* surfaced via error */
    }
  }, [markAllMut, refetch]);

  const normalizedError = useMemo<Error | null>(
    () => (error ? new Error(error.message || 'Falha ao carregar notificações') : null),
    [error],
  );

  return {
    items,
    unreadCount,
    loading: loading && !data,
    error: normalizedError,
    refetch: refetchFn,
    markRead,
    markAllRead,
  };
}

export function useNotifications(): NotificationsResult {
  if (USE_MOCKS) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMockNotifications();
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useApiNotifications();
}
