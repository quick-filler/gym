/**
 * useProfile — single data entrypoint for the Perfil tab (Fase 5).
 *
 *   EXPO_PUBLIC_USE_MOCKS=true  → returns MOCK_PROFILE, shaped to match.
 *   EXPO_PUBLIC_USE_MOCKS=false → runs MyProfile + MyBodyAssessments via
 *                                 Apollo and maps into the screen's view.
 *
 * Edit / password / photo mutations live in the edit screens; this hook
 * covers the read side of the tab plus the raw editable values the form
 * binds to.
 */

import { useCallback, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';

import { USE_MOCKS } from '../lib/config';
import { MOCK_PROFILE } from '../lib/mock-data';
import { MyBodyAssessmentsDocument, MyProfileDocument } from '../gql/graphql';
import { MONTH_PT, fmtDateBR } from '../lib/format';
import type {
  BodyAssessment,
  EditableProfile,
  ProfileResult,
} from '../lib/types';

const EMPTY_ADDRESS: EditableProfile['address'] = {
  cep: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
};

/* ------------------------------------------------------------------
 * Formatting helpers
 * ------------------------------------------------------------------ */
function kg(n: number | null | undefined): string {
  if (n == null) return '—';
  return `${Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg`;
}

function pct(n: number | null | undefined): string {
  if (n == null) return '—';
  return `${Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function metres(n: number | null | undefined): string {
  if (n == null) return '—';
  const m = Number(n) > 3 ? Number(n) / 100 : Number(n); // cm → m heuristic
  return `${m.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m`;
}

function memberSinceLabel(iso: string | null | undefined): string {
  const s = (iso ?? '').slice(0, 10);
  const [y, m] = s.split('-').map(Number);
  if (!y || !m) return '';
  return `DESDE ${MONTH_PT[m - 1].toUpperCase()} ${y}`;
}

function planLabel(billingCycle: string | null | undefined, fallback: string): string {
  const map: Record<string, string> = {
    weekly: 'SEMANAL',
    monthly: 'MENSAL',
    quarterly: 'TRIMESTRAL',
    semiannual: 'SEMESTRAL',
    yearly: 'ANUAL',
    annual: 'ANUAL',
  };
  return map[(billingCycle ?? '').toLowerCase()] ?? (fallback || '').toUpperCase();
}

/** Build the history rows with weight deltas (newest first → compare to next). */
function buildAssessments(rows: any[]): BodyAssessment[] {
  return rows.map((a, i) => {
    const prev = rows[i + 1]; // older
    const dw = prev?.weight != null && a?.weight != null ? Number(a.weight) - Number(prev.weight) : null;
    const tone: BodyAssessment['tone'] =
      dw == null || Math.abs(dw) < 0.05 ? 'flat' : dw < 0 ? 'down' : 'up';
    const delta =
      dw == null
        ? '—'
        : `${dw > 0 ? '+' : dw < 0 ? '−' : ''}${Math.abs(dw).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg`;
    return {
      id: a.documentId,
      date: fmtDateBR(a.date),
      weight: kg(a.weight),
      bodyFat: pct(a.bodyFat),
      delta,
      tone,
    };
  });
}

/* ------------------------------------------------------------------
 * Mock branch
 * ------------------------------------------------------------------ */
function useMockProfile(): ProfileResult {
  return useMemo<ProfileResult>(
    () => ({
      profile: MOCK_PROFILE,
      editable: {
        phone: MOCK_PROFILE.phone,
        birthdate: '1995-08-20',
        gender: 'male',
        address: { ...EMPTY_ADDRESS, city: 'São Paulo', state: 'SP' },
      },
      photoUrl: null,
      loading: false,
      error: null,
      refetch: () => {},
    }),
    [],
  );
}

/* ------------------------------------------------------------------
 * API branch
 * ------------------------------------------------------------------ */
function useApiProfile(): ProfileResult {
  const meQ = useQuery<any>(MyProfileDocument, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });
  const asmQ = useQuery<any>(MyBodyAssessmentsDocument, {
    variables: { limit: 24 },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const me = meQ.data?.me ?? null;
  const rows: any[] = asmQ.data?.myBodyAssessments ?? [];

  const value = useMemo<ProfileResult>(() => {
    const activeEnrollment =
      me?.enrollments?.find((e: any) => e?.status === 'active') ?? me?.enrollments?.[0] ?? null;
    const latest = rows[0] ?? null;

    return {
      profile: {
        name: me?.name ?? '',
        email: me?.email ?? '',
        phone: me?.phone || '—',
        memberSince: memberSinceLabel(activeEnrollment?.startDate),
        plan: planLabel(activeEnrollment?.plan?.billingCycle, activeEnrollment?.plan?.name ?? ''),
        measurements: {
          weight: kg(latest?.weight),
          height: metres(latest?.height),
          bodyFat: pct(latest?.bodyFat),
        },
        assessments: buildAssessments(rows),
      },
      editable: {
        phone: me?.phone ?? '',
        birthdate: (me?.birthdate ?? '').slice(0, 10),
        gender: me?.gender ?? '',
        address: { ...EMPTY_ADDRESS, ...(me?.address ?? {}) },
      },
      photoUrl: me?.photo?.url ?? null,
      loading: meQ.loading || asmQ.loading,
      error:
        meQ.error || asmQ.error
          ? new Error(meQ.error?.message || asmQ.error?.message || 'Falha ao carregar o perfil')
          : null,
      refetch: () => {},
    };
  }, [me, rows, meQ.loading, asmQ.loading, meQ.error, asmQ.error]);

  const refetch = useCallback(() => {
    meQ.refetch().catch(() => {});
    asmQ.refetch().catch(() => {});
  }, [meQ, asmQ]);

  return { ...value, refetch };
}

/* ------------------------------------------------------------------
 * Public hook — branch fixed at build time (env inlined).
 * ------------------------------------------------------------------ */
export function useProfile(): ProfileResult {
  if (USE_MOCKS) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMockProfile();
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useApiProfile();
}
