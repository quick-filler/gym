/**
 * usePayments — single data entrypoint for the Finanças tab (Fase 4).
 *
 * Same mock-vs-API contract as the other hooks:
 *   EXPO_PUBLIC_USE_MOCKS=true  → returns MOCK_PAYMENTS, shaped to match.
 *   EXPO_PUBLIC_USE_MOCKS=false → runs MyPayments + MyNextPayment via Apollo
 *                                 and maps the backend shape into the view.
 *
 * Checkout (PIX / boleto / cartão) lives in payment/[id]; this hook covers
 * the list, the "próxima cobrança" card and the status banner.
 */

import { useCallback, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';

import { USE_MOCKS } from '../lib/config';
import { MOCK_PAYMENTS } from '../lib/mock-data';
import { MyNextPaymentDocument, MyPaymentsDocument } from '../gql/graphql';
import { brl, brlAmount, fmtDateBR } from '../lib/format';
import type {
  PaymentMethodType,
  PaymentStatus,
  PaymentsResult,
  PaymentView,
} from '../lib/types';

/* ------------------------------------------------------------------
 * Shared mappers (backend enums → view model)
 * ------------------------------------------------------------------ */
export function mapMethod(method: string | null | undefined): PaymentMethodType {
  switch (method) {
    case 'pix':
      return 'pix';
    case 'credit_card':
    case 'card':
      return 'card';
    case 'boleto':
      return 'boleto';
    default:
      return 'other';
  }
}

export function methodLabel(method: string | null | undefined): string {
  switch (mapMethod(method)) {
    case 'pix':
      return 'PIX';
    case 'card':
      return 'CARTÃO';
    case 'boleto':
      return 'BOLETO';
    default:
      return 'OUTRO';
  }
}

export function mapStatus(status: string | null | undefined): PaymentStatus {
  if (status === 'paid') return 'paid';
  if (status === 'overdue') return 'overdue';
  return 'pending';
}

/* ------------------------------------------------------------------
 * Mock branch
 * ------------------------------------------------------------------ */
function useMockPayments(): PaymentsResult {
  return useMemo<PaymentsResult>(
    () => ({
      nextBill: {
        documentId: 'mock-next',
        amount: MOCK_PAYMENTS.nextBill.amount,
        currency: MOCK_PAYMENTS.nextBill.currency,
        dueDate: MOCK_PAYMENTS.nextBill.dueDate,
        method: MOCK_PAYMENTS.nextBill.method,
        overdue: false,
      },
      statusBanner: MOCK_PAYMENTS.statusBanner,
      history: MOCK_PAYMENTS.history.map<PaymentView>((r) => ({
        documentId: r.id,
        name: r.name,
        meta: r.meta,
        amount: r.amount,
        method: r.method,
        status: r.status,
        payable: r.status === 'pending' || r.status === 'overdue',
      })),
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
function rowName(description: string | null | undefined): string {
  return description?.trim() || 'Cobrança';
}

function rowMeta(p: any): string {
  const date = fmtDateBR(p.paidAt ?? p.dueDate);
  return [methodLabel(p.method), date].filter(Boolean).join(' · ');
}

function useApiPayments(): PaymentsResult {
  const listQ = useQuery<any>(MyPaymentsDocument, {
    variables: { limit: 24 },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });
  const nextQ = useQuery<any>(MyNextPaymentDocument, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const history = useMemo<PaymentView[]>(() => {
    const rows: any[] = listQ.data?.myPayments ?? [];
    return rows
      .filter((p) => p?.status !== 'cancelled')
      .map((p) => {
        const status = mapStatus(p.status);
        return {
          documentId: p.documentId,
          name: rowName(p.description),
          meta: rowMeta(p),
          amount: brl(p.amount),
          method: mapMethod(p.method),
          status,
          payable: status === 'pending' || status === 'overdue',
        };
      });
  }, [listQ.data]);

  const next = nextQ.data?.myNextPayment ?? null;

  const nextBill = useMemo(() => {
    if (!next) {
      return {
        documentId: null,
        amount: '0,00',
        currency: 'R$',
        dueDate: '—',
        method: '—',
        overdue: false,
      };
    }
    return {
      documentId: next.documentId,
      amount: brlAmount(next.amount),
      currency: 'R$',
      dueDate: fmtDateBR(next.dueDate),
      method: methodLabel(next.method),
      overdue: next.status === 'overdue',
    };
  }, [next]);

  const statusBanner = useMemo<PaymentsResult['statusBanner']>(() => {
    if (!next) {
      return {
        tone: 'ok',
        title: 'Tudo em dia',
        body: 'Você não tem cobranças em aberto.',
      };
    }
    if (next.status === 'overdue') {
      return {
        tone: 'danger',
        title: 'Pagamento em atraso',
        body: `Cobrança vencida em ${fmtDateBR(next.dueDate)}. Regularize para manter o acesso.`,
      };
    }
    return {
      tone: 'ok',
      title: 'Tudo em dia',
      body: `Próxima cobrança em ${fmtDateBR(next.dueDate)}.`,
    };
  }, [next]);

  const refetch = useCallback(() => {
    listQ.refetch().catch(() => {});
    nextQ.refetch().catch(() => {});
  }, [listQ, nextQ]);

  const error = useMemo<Error | null>(() => {
    const e = listQ.error ?? nextQ.error;
    return e ? new Error(e.message || 'Falha ao carregar os pagamentos') : null;
  }, [listQ.error, nextQ.error]);

  return {
    nextBill,
    statusBanner,
    history,
    loading: listQ.loading || nextQ.loading,
    error,
    refetch,
  };
}

/* ------------------------------------------------------------------
 * Public hook — branch fixed at build time (env inlined).
 * ------------------------------------------------------------------ */
export function usePayments(): PaymentsResult {
  if (USE_MOCKS) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMockPayments();
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useApiPayments();
}
