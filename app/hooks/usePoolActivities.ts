/**
 * usePoolActivities — data entrypoint for the Piscina tab.
 *
 * Piscina reuses the workout model: a pool ficha is a WorkoutPlan with
 * `category: 'pool'`. The backend `myPoolActivities` returns the same shape
 * as `myWorkouts` (active + upcoming), filtered to pool. Same mock-vs-API
 * contract as useWorkouts. No history/stats in v1.
 */

import { useCallback, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';

import { USE_MOCKS } from '../lib/config';
import { MOCK_WORKOUTS } from '../lib/mock-data';
import { MyPoolActivitiesDocument } from '../gql/graphql';
import { mapExercises, planMeta } from './useWorkouts';
import type {
  ActiveWorkoutPlan,
  PoolActivitiesResult,
  UpcomingWorkoutPlan,
} from '../lib/types';

function useMockPoolActivities(): PoolActivitiesResult {
  // Demo: reuse the workout fixture so the Piscina tab isn't empty.
  return useMemo<PoolActivitiesResult>(
    () => ({
      active: {
        documentId: MOCK_WORKOUTS.active.id,
        name: 'Natação — Técnica',
        meta: MOCK_WORKOUTS.active.meta,
        exercises: MOCK_WORKOUTS.active.exercises,
      },
      upcoming: MOCK_WORKOUTS.upcoming.map((p) => ({
        documentId: p.id,
        name: p.name,
        meta: p.meta,
      })),
      loading: false,
      error: null,
      refetch: () => {},
    }),
    [],
  );
}

function useApiPoolActivities(): PoolActivitiesResult {
  const { data, loading, error, refetch } = useQuery<any>(MyPoolActivitiesDocument, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const active = useMemo<ActiveWorkoutPlan | null>(() => {
    const p = data?.myPoolActivities?.active;
    if (!p) return null;
    const exercises = mapExercises(p.exercises);
    return {
      documentId: p.documentId,
      name: p.name,
      meta: planMeta(p.instructor, exercises.length),
      exercises,
    };
  }, [data]);

  const upcoming = useMemo<UpcomingWorkoutPlan[]>(() => {
    const list: any[] = data?.myPoolActivities?.upcoming ?? [];
    return list.map((p) => ({
      documentId: p.documentId,
      name: p.name,
      meta: planMeta(p.instructor, Array.isArray(p.exercises) ? p.exercises.length : 0),
    }));
  }, [data]);

  const refetchFn = useCallback(() => {
    refetch().catch(() => {});
  }, [refetch]);

  const normalizedError = useMemo<Error | null>(
    () => (error ? new Error(error.message || 'Falha ao carregar as atividades de piscina') : null),
    [error],
  );

  return { active, upcoming, loading, error: normalizedError, refetch: refetchFn };
}

export function usePoolActivities(): PoolActivitiesResult {
  if (USE_MOCKS) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMockPoolActivities();
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useApiPoolActivities();
}
