/**
 * usePoolStatus — water-quality status for the Piscina tab (Fase 8).
 *
 * Reads `myAcademyPoolStatus` (latest inspection + per-metric/overall status
 * derived from the academy's PoolSettings). Same mock-vs-API contract as the
 * other tab hooks. Returns `status: null` until the academy records its first
 * inspection (the screen then shows an "awaiting first reading" state).
 */

import { useCallback, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';

import { USE_MOCKS } from '../lib/config';
import { MyAcademyPoolStatusDocument } from '../gql/graphql';
import type { PoolMetricStatus, PoolStatusResult, PoolStatusView } from '../lib/types';

function coerceStatus(s: unknown): PoolMetricStatus {
  return s === 'ok' || s === 'warning' || s === 'critical' ? s : 'unknown';
}

function useMockPoolStatus(): PoolStatusResult {
  return useMemo<PoolStatusResult>(
    () => ({
      status: {
        date: '2026-06-29',
        shift: 'evening',
        scheduledTime: '18:00',
        measuredAt: new Date().toISOString(),
        overall: 'warning',
        ph: { value: 7.4, min: 7.2, max: 7.8, status: 'ok' },
        chlorine: { value: 0.9, min: 1, max: 3, status: 'warning' },
        temperature: { value: 29, min: 28, max: 31, status: 'ok' },
      },
      loading: false,
      error: null,
      refetch: () => {},
    }),
    [],
  );
}

function useApiPoolStatus(): PoolStatusResult {
  const { data, loading, error, refetch } = useQuery<any>(MyAcademyPoolStatusDocument, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const status = useMemo<PoolStatusView | null>(() => {
    const s = data?.myAcademyPoolStatus;
    if (!s) return null;
    const metric = (m: any) => ({
      value: m?.value ?? null,
      min: m?.min ?? null,
      max: m?.max ?? null,
      status: coerceStatus(m?.status),
    });
    const overall = s.overall === 'critical' || s.overall === 'warning' ? s.overall : 'ok';
    return {
      date: s.date,
      shift: s.shift,
      scheduledTime: s.scheduledTime ?? null,
      measuredAt: s.measuredAt ?? null,
      overall,
      ph: metric(s.ph),
      chlorine: metric(s.chlorine),
      temperature: metric(s.temperature),
    };
  }, [data]);

  const refetchFn = useCallback(() => {
    refetch().catch(() => {});
  }, [refetch]);

  const normalizedError = useMemo<Error | null>(
    () => (error ? new Error(error.message || 'Falha ao carregar o status da piscina') : null),
    [error],
  );

  return { status, loading, error: normalizedError, refetch: refetchFn };
}

export function usePoolStatus(): PoolStatusResult {
  if (USE_MOCKS) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMockPoolStatus();
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useApiPoolStatus();
}
