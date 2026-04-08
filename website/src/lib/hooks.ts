/**
 * Data hooks — one per page. Each returns a DataSourceResult shape so
 * components branch on loading/error/data without knowing whether the
 * source is the mock fixtures or the real GraphQL API.
 *
 * In API mode (NEXT_PUBLIC_USE_MOCKS=false) these would call Apollo's
 * `useQuery`, map the response into the domain model, and return
 * `{ data, loading, error, refetch }`. The API branches are stubbed
 * for now — landing a real schema mapping is a follow-up once every
 * backend list resolver is stable.
 */

"use client";

import { useMemo } from "react";
import { USE_MOCKS } from "./config";
import {
  MOCK_ACADEMY,
  MOCK_DASHBOARD,
  MOCK_FINANCE,
  MOCK_PRICING_PLANS,
  MOCK_SCHEDULE,
  MOCK_STUDENTS,
} from "./mock-data";
import type {
  AcademySettings,
  DashboardData,
  DataSourceResult,
  FinanceData,
  PricingPlan,
  ScheduleData,
  StudentRow,
} from "./types";

/* Mock-mode helpers — synchronous and memoised so re-renders are cheap. */

function useMocked<T>(value: T): DataSourceResult<T> {
  const data = useMemo(() => value, [value]);
  return { data, loading: false, error: null };
}

/* Stubs for the API branches — kept alongside the mocks so flipping
 * USE_MOCKS never changes the function signature. These will wire up
 * to Apollo's useQuery once the page-level .graphql files are written. */

function notImplemented<T>(feature: string): DataSourceResult<T> {
  return {
    data: null,
    loading: false,
    error: new Error(
      `API mode for "${feature}" is not implemented yet. Set NEXT_PUBLIC_USE_MOCKS=true or wire up the GraphQL query.`,
    ),
  };
}

/* ============================================================
   Marketing
   ============================================================ */

export function usePricingPlans(): DataSourceResult<PricingPlan[]> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return USE_MOCKS ? useMocked(MOCK_PRICING_PLANS) : notImplemented("pricing");
}

/* ============================================================
   Admin
   ============================================================ */

export function useDashboard(): DataSourceResult<DashboardData> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return USE_MOCKS ? useMocked(MOCK_DASHBOARD) : notImplemented("dashboard");
}

export function useStudents(): DataSourceResult<StudentRow[]> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return USE_MOCKS ? useMocked(MOCK_STUDENTS) : notImplemented("students");
}

export function useFinance(): DataSourceResult<FinanceData> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return USE_MOCKS ? useMocked(MOCK_FINANCE) : notImplemented("finance");
}

export function useSchedule(): DataSourceResult<ScheduleData> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return USE_MOCKS ? useMocked(MOCK_SCHEDULE) : notImplemented("schedule");
}

export function useAcademy(): DataSourceResult<AcademySettings> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return USE_MOCKS ? useMocked(MOCK_ACADEMY) : notImplemented("academy");
}
