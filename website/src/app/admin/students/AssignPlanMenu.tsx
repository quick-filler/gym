"use client";

/**
 * Dropdown inline para vincular um plano a um aluno sem precisar abrir
 * o EditStudentDialog. Usado na coluna "Plano" da tabela de Alunos
 * quando o aluno está sem matrícula ativa.
 *
 * Estratégia:
 *   - Busca a lista de planos ativos via Apollo (uma vez por sessão —
 *     a query é cacheada).
 *   - Cada plano vira um item; ao clicar, dispara createEnrollment com
 *     PIX como método default + start date = hoje.
 *   - Para customizar método/data o admin usa o botão "Editar" da
 *     linha, que abre o EditStudentDialog já com a seção de plano
 *     expandida.
 */

import { useMutation, useQuery } from "@apollo/client/react";
import { graphql } from "@/gql";
import { DropdownMenu, type DropdownItem } from "@/components/ui/DropdownMenu";
import { Pill } from "@/components/ui/Pill";
import { USE_MOCKS } from "@/lib/config";

const AVAILABLE_PLANS = graphql(`
  query AssignPlanMenuPlans {
    plans(pagination: { limit: 100 }) {
      documentId
      name
      price
      billingCycle
      isActive
    }
  }
`);

const ASSIGN_PLAN = graphql(`
  mutation AssignPlanQuick($data: EnrollmentInput!) {
    createEnrollment(data: $data) {
      documentId
      status
    }
  }
`);

const CYCLE_LABEL: Record<string, string> = {
  monthly: "Mensal",
  quarterly: "Trimestral",
  annual: "Anual",
};

export function AssignPlanMenu({
  studentId,
  onAssigned,
}: {
  studentId: string;
  onAssigned?: () => void;
}) {
  const { data, loading } = useQuery(AVAILABLE_PLANS, {
    skip: USE_MOCKS,
    fetchPolicy: "cache-first",
  });
  const [assignPlan, { loading: assigning }] = useMutation(ASSIGN_PLAN);

  const plans = (data?.plans ?? []).filter((p) => p?.isActive);

  async function handlePick(planId: string) {
    if (USE_MOCKS) {
      onAssigned?.();
      return;
    }
    await assignPlan({
      variables: {
        data: {
          student: studentId,
          plan: planId,
          startDate: new Date().toISOString().slice(0, 10),
          paymentMethod: "pix",
          status: "active",
        },
      },
    });
    onAssigned?.();
  }

  const items: DropdownItem[] = (() => {
    if (loading && plans.length === 0) {
      return [{ label: "Carregando planos…", disabled: true, onSelect: () => {} }];
    }
    if (plans.length === 0) {
      return [
        {
          label: "Nenhum plano ativo",
          disabled: true,
          onSelect: () => {},
        },
        {
          label: "Cadastrar plano…",
          icon: "plus",
          onSelect: () => {
            if (typeof window !== "undefined") {
              window.location.href = "/admin/plans";
            }
          },
        },
      ];
    }
    return plans.map<DropdownItem>((p) => ({
      label: `${p?.name ?? "—"} · R$ ${(p?.price ?? 0).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}${p?.billingCycle ? ` · ${CYCLE_LABEL[p.billingCycle] ?? p.billingCycle}` : ""}`,
      icon: "credit",
      disabled: assigning,
      onSelect: () => void handlePick(p?.documentId ?? ""),
    }));
  })();

  return (
    <DropdownMenu
      align="start"
      trigger={
        <button type="button" title="Vincular plano" className="inline-flex">
          <Pill tone="amber">+ Atribuir plano</Pill>
        </button>
      }
      items={items}
    />
  );
}
