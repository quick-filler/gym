/**
 * useDependents — guardian's dependents roster + self-service mutations (Fase 6).
 *
 * Same mock/API branching pattern as useScheduleWeek. In API mode it runs the
 * `MyDependents` query (the authenticated student's dependents, enrollments,
 * address and photo) and exposes `add` / `update` backed by addMyDependent /
 * updateMyDependent. The roster (`data`) is the presentation shape the cards
 * render; `records` is the raw editable shape the new/edit form binds to.
 */

import { useCallback, useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';

import { USE_MOCKS } from '../lib/config';
import { ageFrom, fmtDateBR, monthlyBRL } from '../lib/format';
import { MOCK_DEPENDENTS } from '../lib/mock-data';
import {
  AddMyDependentDocument,
  MyDependentsDocument,
  UpdateMyDependentDocument,
} from '../gql/graphql';
import type {
  DependentActionResult,
  DependentEditable,
  DependentRecord,
  DependentsData,
  DependentsResult,
  DependentStatus,
} from '../lib/types';

const EMPTY_ADDRESS = {
  cep: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
};

/** Treats girl/female as feminine for the avatar + age label copy. */
function isFeminine(gender: string | null | undefined): boolean {
  return gender === 'girl' || gender === 'female';
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

/* ------------------------------------------------------------------
 * Mappers
 * ------------------------------------------------------------------ */
function toRecord(d: any): DependentRecord {
  const age = ageFrom(d.birthdate);
  const enrolled = d.enrollments?.[0];
  const info: Array<{ key: string; value: string }> = [];
  if (enrolled?.plan) {
    info.push({
      key: 'Plano',
      value: `${enrolled.plan.name} — ${monthlyBRL(enrolled.plan.price)}/mês`,
    });
  }
  if (enrolled?.startDate) {
    info.push({ key: 'Início', value: fmtDateBR(enrolled.startDate) });
  }
  if (d.bloodType) {
    info.push({ key: 'Tipo sanguíneo', value: d.bloodType });
  }
  if (enrolled?.endDate) {
    info.push({ key: 'Próx. vencimento', value: fmtDateBR(enrolled.endDate) });
  }
  return {
    id: d.documentId,
    name: d.name,
    gender: isFeminine(d.gender) ? 'girl' : 'boy',
    ageLabel: `${age} anos · Nascid${isFeminine(d.gender) ? 'a' : 'o'} em ${fmtDateBR(d.birthdate)}`,
    status: (d.status as DependentStatus) ?? 'active',
    medicalAlert: d.medicalAlert ?? undefined,
    info,
    emergency:
      d.emergencyContactName && d.emergencyContactPhone
        ? { name: d.emergencyContactName, phone: d.emergencyContactPhone }
        : undefined,
  };
}

function toEditable(d: any): DependentEditable {
  const a = d.address ?? {};
  return {
    id: d.documentId,
    name: d.name ?? '',
    birthdate: (d.birthdate ?? '').slice(0, 10),
    cpf: d.cpf ?? '',
    gender: d.gender ?? '',
    relationship: d.relationship ?? '',
    bloodType: d.bloodType ?? '',
    allergies: d.allergies ?? '',
    medicalNotes: d.medicalNotes ?? '',
    medicalAlert: d.medicalAlert ?? '',
    emergencyContactName: d.emergencyContactName ?? '',
    emergencyContactPhone: d.emergencyContactPhone ?? '',
    address: {
      cep: a.cep ?? '',
      street: a.street ?? '',
      number: a.number ?? '',
      complement: a.complement ?? '',
      neighborhood: a.neighborhood ?? '',
      city: a.city ?? '',
      state: a.state ?? '',
    },
    photoUrl: d.photo?.url ?? null,
  };
}

/* ------------------------------------------------------------------
 * Mock branch
 * ------------------------------------------------------------------ */
const DEMO: DependentActionResult = {
  ok: false,
  message: 'Modo demonstração — cadastro real precisa do backend.',
};

function useMockDependents(): DependentsResult {
  const noop = useCallback(async (): Promise<DependentActionResult> => DEMO, []);
  return {
    data: MOCK_DEPENDENTS,
    records: [],
    loading: false,
    error: null,
    refetch: () => {},
    add: noop,
    update: noop,
    saving: false,
  };
}

/* ------------------------------------------------------------------
 * API branch
 * ------------------------------------------------------------------ */
function useApiDependents(): DependentsResult {
  const { data, loading, error, refetch } = useQuery<any>(MyDependentsDocument, {
    fetchPolicy: 'cache-and-network',
  });
  const [addMutation, addState] = useMutation<any>(AddMyDependentDocument);
  const [updateMutation, updateState] = useMutation<any>(UpdateMyDependentDocument);

  const list: any[] = data?.myDependents ?? [];

  const payload = useMemo<DependentsData | null>(() => {
    if (!data) return null;
    return {
      guardianName: data.me?.name ?? '',
      guardianAcademy: data.me?.academy?.name ?? '',
      dependents: list.map(toRecord),
    };
  }, [data, list]);

  const records = useMemo<DependentEditable[]>(() => list.map(toEditable), [list]);

  const refetchFn = useCallback(() => {
    refetch().catch(() => {
      /* surfaced via `error` already */
    });
  }, [refetch]);

  const add = useCallback(
    async (input: Record<string, unknown>): Promise<DependentActionResult> => {
      try {
        const res = await addMutation({ variables: { input } });
        await refetch();
        return {
          ok: true,
          id: res.data?.addMyDependent?.documentId,
          message: 'Dependente cadastrado!',
        };
      } catch (err) {
        return { ok: false, message: gqlMessage(err, 'Não foi possível cadastrar.') };
      }
    },
    [addMutation, refetch],
  );

  const update = useCallback(
    async (id: string, input: Record<string, unknown>): Promise<DependentActionResult> => {
      try {
        await updateMutation({ variables: { documentId: id, input } });
        await refetch();
        return { ok: true, id, message: 'Dados atualizados!' };
      } catch (err) {
        return { ok: false, message: gqlMessage(err, 'Não foi possível salvar.') };
      }
    },
    [updateMutation, refetch],
  );

  return {
    data: payload,
    records,
    loading: loading && !data,
    error: error ? (error as unknown as Error) : null,
    refetch: refetchFn,
    add,
    update,
    saving: addState.loading || updateState.loading,
  };
}

/* ------------------------------------------------------------------
 * Public hook — branch fixed at build time (env inlined), as useScheduleWeek.
 * ------------------------------------------------------------------ */
export function useDependents(): DependentsResult {
  if (USE_MOCKS) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMockDependents();
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useApiDependents();
}
