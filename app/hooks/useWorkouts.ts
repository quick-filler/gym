/**
 * useWorkouts — single data entrypoint for the Treinos tab (Fase 3).
 *
 * Same mock-vs-API contract as the other hooks:
 *   EXPO_PUBLIC_USE_MOCKS=true  → returns MOCK_WORKOUTS, shaped to match.
 *   EXPO_PUBLIC_USE_MOCKS=false → runs MyWorkouts + MyWorkoutHistory +
 *                                 MyWorkoutStats via Apollo and maps the
 *                                 backend shape into the screen's view model.
 *
 * Start/finish/cancel session mutations live in the detail + execution
 * screens (workout/[id], workout/session/[id]); this hook covers the tab.
 */

import { useCallback, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';

import { USE_MOCKS } from '../lib/config';
import { MOCK_WORKOUTS } from '../lib/mock-data';
import {
  MyWorkoutHistoryDocument,
  MyWorkoutStatsDocument,
  MyWorkoutsDocument,
} from '../gql/graphql';
import { WEEKDAY_SHORT_PT, fmtDateBR, weekdayIndexISO } from '../lib/format';
import type {
  ActiveWorkoutPlan,
  Exercise,
  UpcomingWorkoutPlan,
  WorkoutHistorySession,
  WorkoutsResult,
} from '../lib/types';

/* ------------------------------------------------------------------
 * Mock branch
 * ------------------------------------------------------------------ */
function useMockWorkouts(): WorkoutsResult {
  return useMemo<WorkoutsResult>(
    () => ({
      active: {
        documentId: MOCK_WORKOUTS.active.id,
        name: MOCK_WORKOUTS.active.name,
        meta: MOCK_WORKOUTS.active.meta,
        exercises: MOCK_WORKOUTS.active.exercises,
      },
      upcoming: MOCK_WORKOUTS.upcoming.map((p) => ({
        documentId: p.id,
        name: p.name,
        meta: p.meta,
      })),
      history: MOCK_WORKOUTS.history.map((h) => ({
        documentId: h.id,
        name: h.name,
        meta: h.meta,
      })),
      stats: {
        thisWeek: MOCK_WORKOUTS.stats.thisWeek,
        thirtyDays: MOCK_WORKOUTS.stats.thirtyDays,
        streak: MOCK_WORKOUTS.stats.streak,
      },
      loading: false,
      error: null,
      refetch: () => {},
    }),
    [],
  );
}

/* ------------------------------------------------------------------
 * API branch — mappers
 * ------------------------------------------------------------------ */
export function mapExercises(exs: any): Exercise[] {
  if (!Array.isArray(exs)) return [];
  return exs.map((e: any, i: number) => {
    const sets = e?.sets ?? null;
    const reps = e?.reps ?? null;
    const detail =
      sets != null && reps != null
        ? `${sets}×${reps}`
        : sets != null
          ? `${sets} séries`
          : '';
    return {
      num: i + 1,
      name: e?.name ?? '',
      detail,
      load: e?.load || '—',
    };
  });
}

export function planMeta(instructor: string | null | undefined, count: number): string {
  const who = (instructor ?? '').toUpperCase().trim();
  const ex = `${count} ${count === 1 ? 'EXERCÍCIO' : 'EXERCÍCIOS'}`;
  return who ? `${who} · ${ex}` : ex;
}

function sessionMeta(finishedAt: string | null | undefined, durationMinutes: number | null | undefined): string {
  const iso = (finishedAt ?? '').slice(0, 10);
  const wd = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? WEEKDAY_SHORT_PT[weekdayIndexISO(iso)] : '';
  const ddmm = fmtDateBR(finishedAt).slice(0, 5);
  const dur = durationMinutes ? `${durationMinutes} MIN` : '—';
  const left = [wd, ddmm].filter(Boolean).join(', ');
  return left ? `${left} · ${dur}` : dur;
}

function useApiWorkouts(): WorkoutsResult {
  const plansQ = useQuery<any>(MyWorkoutsDocument, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });
  const historyQ = useQuery<any>(MyWorkoutHistoryDocument, {
    variables: { limit: 20 },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });
  const statsQ = useQuery<any>(MyWorkoutStatsDocument, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const active = useMemo<ActiveWorkoutPlan | null>(() => {
    const p = plansQ.data?.myWorkouts?.active;
    if (!p) return null;
    const exercises = mapExercises(p.exercises);
    return {
      documentId: p.documentId,
      name: p.name,
      meta: planMeta(p.instructor, exercises.length),
      exercises,
    };
  }, [plansQ.data]);

  const upcoming = useMemo<UpcomingWorkoutPlan[]>(() => {
    const list: any[] = plansQ.data?.myWorkouts?.upcoming ?? [];
    return list.map((p) => ({
      documentId: p.documentId,
      name: p.name,
      meta: planMeta(p.instructor, Array.isArray(p.exercises) ? p.exercises.length : 0),
    }));
  }, [plansQ.data]);

  const history = useMemo<WorkoutHistorySession[]>(() => {
    const list: any[] = historyQ.data?.myWorkoutHistory ?? [];
    return list.map((s) => ({
      documentId: s.documentId,
      name: s.workoutPlan?.name ?? 'Treino',
      meta: sessionMeta(s.finishedAt, s.durationMinutes),
    }));
  }, [historyQ.data]);

  const stats = useMemo(() => {
    const s = statsQ.data?.myWorkoutStats;
    return {
      thisWeek: String(s?.thisWeekCount ?? 0),
      thirtyDays: String(s?.thirtyDaysCount ?? 0),
      streak: `${s?.streakDays ?? 0}d`,
    };
  }, [statsQ.data]);

  const refetch = useCallback(() => {
    plansQ.refetch().catch(() => {});
    historyQ.refetch().catch(() => {});
    statsQ.refetch().catch(() => {});
  }, [plansQ, historyQ, statsQ]);

  const error = useMemo<Error | null>(() => {
    const e = plansQ.error ?? historyQ.error ?? statsQ.error;
    return e ? new Error(e.message || 'Falha ao carregar os treinos') : null;
  }, [plansQ.error, historyQ.error, statsQ.error]);

  return {
    active,
    upcoming,
    history,
    stats,
    loading: plansQ.loading || historyQ.loading || statsQ.loading,
    error,
    refetch,
  };
}

/* ------------------------------------------------------------------
 * Public hook — branch fixed at build time (env inlined).
 * ------------------------------------------------------------------ */
export function useWorkouts(): WorkoutsResult {
  if (USE_MOCKS) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMockWorkouts();
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useApiWorkouts();
}
