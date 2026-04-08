/**
 * useDashboard — the single data entrypoint for the home screen.
 *
 * Branches on the `USE_MOCKS` env var at build time:
 *
 *   EXPO_PUBLIC_USE_MOCKS=true   → returns mock data synchronously,
 *                                  no network calls, no Apollo.
 *   EXPO_PUBLIC_USE_MOCKS=false  → runs the real `MyDashboard` GraphQL
 *                                  query via Apollo. Never falls back
 *                                  to mocks, even on network error.
 *
 * The UI consumes `DataSourceResult` and treats both modes identically.
 * The only observable difference is that API mode shows skeleton
 * placeholders while loading and an error card if the query fails.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';

import { USE_MOCKS } from '../lib/config';
import { MOCK_DASHBOARD } from '../lib/mock-data';
import type { DashboardData, DataSourceResult, EnrollmentStatus } from '../lib/types';

// Inline GraphQL document — would normally come from the generated
// `gql/` helper, but we need this file to work without codegen being
// run first. The query shape matches `app/graphql/academy.graphql →
// MyDashboard`.
const MY_DASHBOARD = gql`
  query MyDashboard {
    me {
      documentId
      name
      academy {
        documentId
        name
        slug
        primaryColor
        secondaryColor
      }
      enrollments {
        documentId
        status
        startDate
        endDate
        paymentMethod
        plan {
          documentId
          name
          price
          billingCycle
        }
      }
      workoutPlans {
        documentId
        name
        instructor
        isActive
        validFrom
        exercises {
          name
          sets
          reps
          load
          notes
        }
      }
    }
  }
`;

/* ------------------------------------------------------------------
 * Mock branch — runs when USE_MOCKS is true. No network, no Apollo.
 * ------------------------------------------------------------------ */
function useMockDashboard(): DataSourceResult {
  // Stable reference across renders so consumers can useEffect on it.
  const data = useMemo<DashboardData>(() => MOCK_DASHBOARD, []);
  const refetch = useCallback(() => {
    /* no-op in mock mode */
  }, []);
  return { data, loading: false, error: null, refetch };
}

/* ------------------------------------------------------------------
 * API branch — runs when USE_MOCKS is false. Pure Apollo, no fallback.
 * ------------------------------------------------------------------ */
function useApiDashboard(): DataSourceResult {
  const { data, loading, error, refetch } = useQuery<any>(MY_DASHBOARD, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const mapped: DashboardData | null = useMemo(() => {
    if (!data?.me) return null;

    const me = data.me;
    const academy = me.academy;
    const activeEnrollment = me.enrollments?.find(
      (e: any) => e?.status === 'active'
    );
    const activeWorkout = me.workoutPlans?.find(
      (w: any) => w?.isActive
    );

    return {
      student: {
        name: firstName(me.name),
      },
      academy: {
        name: academy?.name ?? '',
        tagline: '',
        initials: initialsOf(academy?.name ?? ''),
        primaryColor: academy?.primaryColor ?? '#0c0a09',
        primaryDark: shade(academy?.primaryColor ?? '#0c0a09', -0.15),
      },
      // No "next class" query yet — leave null until we add it. The
      // UI hides the section rather than inventing data.
      nextClass: null,
      enrollment: activeEnrollment
        ? {
            planName: activeEnrollment.plan?.name ?? '',
            amount: formatBRL(activeEnrollment.plan?.price ?? 0),
            dueDate: formatDate(activeEnrollment.endDate),
            method: mapMethod(activeEnrollment.paymentMethod),
            status: 'em_dia' as EnrollmentStatus,
          }
        : null,
      workout: activeWorkout
        ? {
            name: activeWorkout.name,
            instructor: activeWorkout.instructor ?? '',
            updatedLabel: updatedLabel(activeWorkout),
            exercises: (activeWorkout.exercises ?? []).map(
              (ex: any, i: number) => ({
                num: i + 1,
                name: ex?.name ?? '',
                detail: `${ex?.sets ?? '?'}×${ex?.reps ?? '?'}`,
                load: ex?.load ? String(ex.load) : '—',
              })
            ),
          }
        : null,
    };
  }, [data]);

  // Tick the error into an Error instance (Apollo's is opaque).
  const normalizedError: Error | null = useMemo(() => {
    if (!error) return null;
    return new Error(error.message || 'Falha ao carregar os dados');
  }, [error]);

  const refetchFn = useCallback(() => {
    refetch().catch(() => {
      /* swallow — the hook's `error` already surfaced it */
    });
  }, [refetch]);

  return {
    data: mapped,
    loading,
    error: normalizedError,
    refetch: refetchFn,
  };
}

/* ------------------------------------------------------------------
 * Public hook — picks the branch at module load based on USE_MOCKS.
 * The branch is stable for the lifetime of the app (env vars are
 * inlined at build time), so calling one of the two hooks from inside
 * this wrapper is safe — React doesn't see an unstable hook order.
 * ------------------------------------------------------------------ */
export function useDashboard(): DataSourceResult {
  // Intentional: USE_MOCKS is a build-time constant so only one branch
  // is ever reached. React's rules-of-hooks are satisfied because the
  // call graph is stable across all renders of a given bundle.
  if (USE_MOCKS) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMockDashboard();
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useApiDashboard();
}

/* ------------------------------------------------------------------
 * Small helpers — only used by the API branch.
 * ------------------------------------------------------------------ */
function firstName(full: string): string {
  if (!full) return '';
  return full.split(' ')[0];
}

function initialsOf(name: string): string {
  if (!name) return '—';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 3)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function formatBRL(value: number): string {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value));
  } catch {
    return `R$ ${value}`;
  }
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('pt-BR');
}

function mapMethod(method: string | null | undefined): string {
  if (method === 'pix') return 'PIX';
  if (method === 'credit_card') return 'Cartão';
  if (method === 'boleto') return 'Boleto';
  return '—';
}

function updatedLabel(workout: any): string {
  const instructor = (workout?.instructor ?? '').toUpperCase();
  const validFrom = formatDate(workout?.validFrom).slice(0, 5); // DD/MM
  if (instructor && validFrom) return `${instructor} · ATUALIZADO ${validFrom}`;
  return instructor || 'ATUALIZADO';
}

function shade(hex: string, amount: number): string {
  // Lightweight shade function — good enough for a single accent.
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const r = Math.max(0, Math.min(255, parseInt(h.slice(0, 2), 16) + amount * 255));
  const g = Math.max(0, Math.min(255, parseInt(h.slice(2, 4), 16) + amount * 255));
  const b = Math.max(0, Math.min(255, parseInt(h.slice(4, 6), 16) + amount * 255));
  const hx = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${hx(r)}${hx(g)}${hx(b)}`;
}

// Suppress "useEffect is unused" lint noise — it's a reserved hook for
// future subscriptions in mock mode.
void useEffect;
void useState;
