/**
 * Hook smoke tests — verifies that in mock mode (NEXT_PUBLIC_USE_MOCKS=true,
 * which is the default), every useX() synchronously returns a well-formed
 * DataSourceResult<T> shape. Catches:
 *   - drift between MOCK_* fixtures and the domain type declarations
 *   - breakage introduced by a mis-refactor of the mock/API branching
 *
 * This does NOT exercise the API branch — that requires a live Apollo client
 * pointed at a running backend and belongs in Layer 3 integration tests.
 */

import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from './apollo';
import {
  useAcademy,
  useDRE,
  useDashboard,
  useDependents,
  useFinance,
  usePricingPlans,
  useSchedule,
  useStudents,
  useWorkouts,
} from './hooks';

function wrapper({ children }: { children: ReactNode }) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}

describe('mock-mode hooks', () => {
  it('usePricingPlans returns the pricing plan list', () => {
    const { result } = renderHook(() => usePricingPlans(), { wrapper });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(Array.isArray(result.current.data)).toBe(true);
    expect(result.current.data!.length).toBeGreaterThan(0);
    const plan = result.current.data![0]!;
    expect(plan).toHaveProperty('id');
    expect(plan).toHaveProperty('name');
    expect(plan).toHaveProperty('priceMonthly');
    expect(typeof plan.priceMonthly).toBe('number');
  });

  it('useDashboard returns metrics + recentStudents + todayClasses + upcomingPayments', () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });
    const d = result.current.data!;
    expect(d.metrics.length).toBeGreaterThan(0);
    expect(d.recentStudents.length).toBeGreaterThan(0);
    expect(d.todayClasses.length).toBeGreaterThan(0);
    expect(d.upcomingPayments.length).toBeGreaterThan(0);
    for (const m of d.metrics) {
      expect(typeof m.id).toBe('string');
      expect(typeof m.label).toBe('string');
      expect(typeof m.value).toBe('string');
    }
  });

  it('useStudents returns rows with plan + status + payment method', () => {
    const { result } = renderHook(() => useStudents(), { wrapper });
    const rows = result.current.data!;
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) {
      expect(['active', 'inactive', 'suspended']).toContain(r.status);
      expect(['pix', 'credit_card', 'boleto']).toContain(r.paymentMethod);
      expect(r.initials).toHaveLength(2);
    }
  });

  it('useFinance returns kpis + charges + method breakdown summing to ~100%', () => {
    const { result } = renderHook(() => useFinance(), { wrapper });
    const f = result.current.data!;
    expect(f.kpis.length).toBe(4);
    expect(f.charges.length).toBeGreaterThan(0);
    const percentSum = f.methodBreakdown.reduce((s, m) => s + m.percent, 0);
    expect(percentSum).toBeGreaterThanOrEqual(95);
    expect(percentSum).toBeLessThanOrEqual(105);
    for (const c of f.charges) {
      expect(typeof c.amountFormatted).toBe('string');
      expect(c.amountFormatted).toMatch(/^R\$/);
    }
  });

  it('useSchedule returns classes anchored to weekdays 0-6', () => {
    const { result } = renderHook(() => useSchedule(), { wrapper });
    const s = result.current.data!;
    expect(s.classes.length).toBeGreaterThan(0);
    for (const c of s.classes) {
      expect(c.weekday).toBeGreaterThanOrEqual(0);
      expect(c.weekday).toBeLessThanOrEqual(6);
      expect(c.booked).toBeLessThanOrEqual(c.capacity);
      expect(['ink', 'flame', 'pine']).toContain(c.color);
    }
  });

  it('useAcademy returns branding + plan tier', () => {
    const { result } = renderHook(() => useAcademy(), { wrapper });
    const a = result.current.data!;
    expect(a.slug).toBeTruthy();
    expect(a.primaryColor).toMatch(/^#[0-9a-fA-F]{3,8}$/);
    expect(['starter', 'business', 'pro']).toContain(a.plan);
  });

  it('useDRE returns revenue hero + cashflow + category breakdown', () => {
    const { result } = renderHook(() => useDRE(), { wrapper });
    const d = result.current.data!;
    expect(d.monthLabel).toBeTruthy();
    expect(d.cashFlow).toHaveLength(6);
    expect(d.profit.marginPercent).toBeGreaterThanOrEqual(0);
    expect(d.profit.marginPercent).toBeLessThanOrEqual(100);
    const categorySum = d.categoryBreakdown.reduce((s, c) => s + c.percent, 0);
    // 99.9 guard against rounding; some breakdowns may sum slightly below 100.
    expect(categorySum).toBeGreaterThanOrEqual(99);
    expect(categorySum).toBeLessThanOrEqual(101);
  });

  it('useDependents returns families with ≥1 dependent each', () => {
    const { result } = renderHook(() => useDependents(), { wrapper });
    const families = result.current.data!;
    expect(families.length).toBeGreaterThan(0);
    for (const f of families) {
      expect(f.dependents.length).toBeGreaterThan(0);
      expect(f.guardian.initials).toHaveLength(2);
      for (const d of f.dependents) {
        expect(['active', 'pending', 'inactive']).toContain(d.status);
        expect(['girl', 'boy']).toContain(d.gender);
      }
    }
  });

  it('useWorkouts returns tabs + cards with exercises', () => {
    const { result } = renderHook(() => useWorkouts(), { wrapper });
    const w = result.current.data!;
    expect(w.tabs.length).toBe(3);
    expect(w.tabs.map((t) => t.id)).toEqual([
      'active',
      'assessments',
      'archived',
    ]);
    for (const card of w.cards) {
      expect(card.exercises.length).toBeGreaterThan(0);
      expect(['active', 'archived']).toContain(card.status);
    }
  });
});
