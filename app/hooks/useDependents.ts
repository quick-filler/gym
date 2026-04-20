/**
 * useDependents — guardian's dependents roster.
 *
 * Same mock/API branching pattern as useDashboard. In API mode, runs
 * the `myDependents` GraphQL query (returns the authenticated student's
 * dependents with enrollments + plan populated).
 */

import { useCallback } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';

import { USE_MOCKS } from '../lib/config';
import { ageFrom, fmtDateBR, monthlyBRL } from '../lib/format';
import { MOCK_DEPENDENTS } from '../lib/mock-data';
import type {
  DependentRecord,
  DependentsData,
  DependentStatus,
} from '../lib/types';

const MY_DEPENDENTS = gql`
  query AppMyDependents {
    me {
      documentId
      name
      academy {
        documentId
        name
      }
    }
    myDependents {
      documentId
      name
      birthdate
      gender
      status
      medicalAlert
      bloodType
      emergencyContactName
      emergencyContactPhone
      enrollments {
        documentId
        startDate
        endDate
        plan {
          documentId
          name
          price
        }
      }
    }
  }
`;

export interface DependentsResult {
  data: DependentsData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useDependents(): DependentsResult {
  if (USE_MOCKS) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const refetch = useCallback(() => {}, []);
    return {
      data: MOCK_DEPENDENTS,
      loading: false,
      error: null,
      refetch,
    };
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data, loading, error, refetch } = useQuery<{
    me: { documentId: string; name: string; academy: { name: string } } | null;
    myDependents: Array<{
      documentId: string;
      name: string;
      birthdate: string;
      gender: string | null;
      status: string;
      medicalAlert: string | null;
      bloodType: string | null;
      emergencyContactName: string | null;
      emergencyContactPhone: string | null;
      enrollments: Array<{
        documentId: string;
        startDate: string;
        endDate: string | null;
        plan: { documentId: string; name: string; price: number } | null;
      }> | null;
    }>;
  }>(MY_DEPENDENTS, { fetchPolicy: 'cache-and-network' });

  const wrappedRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  if (loading) {
    return { data: null, loading: true, error: null, refetch: wrappedRefetch };
  }

  if (error) {
    return {
      data: null,
      loading: false,
      error: error as unknown as Error,
      refetch: wrappedRefetch,
    };
  }

  if (!data) {
    return { data: null, loading: false, error: null, refetch: wrappedRefetch };
  }

  const dependents: DependentRecord[] = (data.myDependents ?? []).map((d) => {
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
      info.push({
        key: 'Próx. vencimento',
        value: fmtDateBR(enrolled.endDate),
      });
    }
    return {
      id: d.documentId,
      name: d.name,
      gender: (d.gender === 'girl' ? 'girl' : 'boy') as 'girl' | 'boy',
      ageLabel: `${age} anos · Nascido${d.gender === 'girl' ? 'a' : ''} em ${fmtDateBR(d.birthdate)}`,
      status: (d.status as DependentStatus) ?? 'active',
      medicalAlert: d.medicalAlert ?? undefined,
      info,
      emergency:
        d.emergencyContactName && d.emergencyContactPhone
          ? {
              name: d.emergencyContactName,
              phone: d.emergencyContactPhone,
            }
          : undefined,
    };
  });

  const payload: DependentsData = {
    guardianName: data.me?.name ?? '',
    guardianAcademy: data.me?.academy?.name ?? '',
    dependents,
  };

  return {
    data: payload,
    loading: false,
    error: null,
    refetch: wrappedRefetch,
  };
}
