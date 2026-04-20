"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { graphql } from "@/gql";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { USE_MOCKS } from "@/lib/config";

/**
 * Data fetched when the dialog opens:
 *
 * - students         — every student in the admin's academy, each with
 *                      their active enrollment + plan. We list *all*
 *                      students (not just enrolled ones) so operators
 *                      see the same roster as /admin/students.
 * - plans            — the academy's plan catalog. Used when the
 *                      selected student has no enrollment yet, or when
 *                      the operator wants to bill a one-off plan.
 *
 * On submit, if the picked (student, plan) doesn't already have an
 * active enrollment, the dialog creates one on the fly before creating
 * the payment. This keeps the "Adicionar aluno" → "Nova cobrança" flow
 * working without forcing a separate "enroll" step.
 */
const FETCH_FOR_CHARGE = graphql(`
  query FetchForCharge {
    students(pagination: { limit: 500 }) {
      documentId
      name
      email
      status
      enrollments {
        documentId
        status
        plan {
          documentId
          name
          price
          billingCycle
        }
      }
    }
    plans(pagination: { limit: 100 }) {
      documentId
      name
      price
      billingCycle
      isActive
    }
  }
`);

const CREATE_ENROLLMENT = graphql(`
  mutation AdminCreateEnrollment($data: EnrollmentInput!) {
    createEnrollment(data: $data) {
      documentId
      status
      plan {
        documentId
      }
      student {
        documentId
      }
    }
  }
`);

const CREATE_PAYMENT = graphql(`
  mutation AdminCreatePayment($data: PaymentInput!) {
    createPayment(data: $data) {
      documentId
      amount
      status
      method
      dueDate
    }
  }
`);

export function NewChargeDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}) {
  const todayIso = new Date().toISOString().slice(0, 10);

  const { data } = useQuery(FETCH_FOR_CHARGE, {
    skip: USE_MOCKS || !open,
    fetchPolicy: "cache-and-network",
  });

  const [studentId, setStudentId] = useState("");
  const [planId, setPlanId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(todayIso);
  const [method, setMethod] = useState<"pix" | "credit_card" | "boleto">("pix");
  const [status, setStatus] = useState<"pending" | "paid" | "overdue">(
    "pending",
  );
  const [error, setError] = useState<string | null>(null);
  const [createEnrollment, { loading: enrollingLoading }] =
    useMutation(CREATE_ENROLLMENT);
  const [createPayment, { loading: payingLoading }] =
    useMutation(CREATE_PAYMENT);
  const loading = enrollingLoading || payingLoading;

  const students = useMemo(
    () =>
      (data?.students ?? []).filter(
        (s): s is NonNullable<typeof s> => !!s && s.status !== "inactive",
      ),
    [data],
  );
  const plans = useMemo(
    () =>
      (data?.plans ?? []).filter(
        (p): p is NonNullable<typeof p> => !!p && p.isActive !== false,
      ),
    [data],
  );

  const selectedStudent = students.find((s) => s.documentId === studentId);
  const selectedPlan = plans.find((p) => p.documentId === planId);

  /** Returns an existing enrollment matching (student, plan) if any. */
  function findExistingEnrollment(): string | null {
    if (!selectedStudent || !selectedPlan) return null;
    const match = selectedStudent.enrollments?.find(
      (e) =>
        e?.plan?.documentId === selectedPlan.documentId &&
        e.status === "active",
    );
    return match?.documentId ?? null;
  }

  function reset() {
    setStudentId("");
    setPlanId("");
    setAmount("");
    setDueDate(todayIso);
    setMethod("pix");
    setStatus("pending");
    setError(null);
  }

  function handlePlanChange(nextPlanId: string) {
    setPlanId(nextPlanId);
    const next = plans.find((p) => p.documentId === nextPlanId);
    // Overwrite the amount when the user hasn't customised it yet, or
    // when switching plans (predictable default > preserving a stale
    // value from a different plan).
    if (next) setAmount(String(next.price));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (USE_MOCKS) {
      onCreated?.();
      reset();
      onClose();
      return;
    }

    const amt = Number(amount);
    if (!studentId) return setError("Selecione um aluno.");
    if (!planId) return setError("Selecione um plano.");
    if (!amt || amt < 0) return setError("Valor inválido.");

    try {
      let enrollmentId = findExistingEnrollment();
      if (!enrollmentId) {
        const res = await createEnrollment({
          variables: {
            data: {
              student: studentId,
              plan: planId,
              startDate: todayIso,
              status: "active",
              paymentMethod: method,
            },
          },
        });
        enrollmentId = res.data?.createEnrollment?.documentId ?? null;
        if (!enrollmentId) {
          throw new Error("Falha ao criar matrícula.");
        }
      }

      await createPayment({
        variables: {
          data: {
            enrollment: enrollmentId,
            amount: amt,
            dueDate,
            method,
            status,
          },
        },
      });

      onCreated?.();
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar cobrança.");
    }
  }

  const enrollmentExists = !!findExistingEnrollment();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Nova cobrança"
      subtitle="Escolha o aluno e o plano. Se o aluno ainda não estiver matriculado, a matrícula é criada automaticamente."
    >
      <form id="new-charge-form" onSubmit={handleSubmit}>
        <Field
          label="Aluno"
          help={
            students.length === 0
              ? "Nenhum aluno cadastrado nesta academia ainda."
              : "Digite o nome ou e-mail para filtrar."
          }
        >
          <Combobox
            required
            value={studentId}
            onChange={setStudentId}
            disabled={students.length === 0}
            placeholder="Selecione um aluno…"
            searchPlaceholder="Buscar nome ou e-mail"
            emptyMessage="Nenhum aluno"
            options={students.map((s) => ({
              id: s.documentId,
              label: s.name,
              sublabel: s.email ?? undefined,
            }))}
          />
        </Field>

        <Field
          label="Plano"
          help={
            studentId
              ? enrollmentExists
                ? "Aluno já tem matrícula ativa neste plano — a cobrança será lançada nela."
                : "Uma nova matrícula será criada com este plano."
              : plans.length === 0
                ? "Nenhum plano ativo. Cadastre um plano antes de gerar cobrança."
                : undefined
          }
        >
          <Combobox
            required
            value={planId}
            onChange={handlePlanChange}
            disabled={plans.length === 0}
            placeholder="Selecione um plano…"
            searchPlaceholder="Buscar plano"
            emptyMessage="Nenhum plano"
            options={plans.map((p) => ({
              id: p.documentId,
              label: p.name,
              sublabel: p.billingCycle,
              hint: `R$ ${p.price.toLocaleString("pt-BR")}`,
            }))}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Valor (R$)">
            <Input
              required
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
            />
          </Field>
          <Field label="Vencimento">
            <Input
              required
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Método">
            <Select
              value={method}
              onChange={(e) => setMethod(e.target.value as typeof method)}
            >
              <option value="pix">PIX</option>
              <option value="credit_card">Cartão</option>
              <option value="boleto">Boleto</option>
            </Select>
          </Field>
          <Field label="Status">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="overdue">Vencido</option>
            </Select>
          </Field>
        </div>
        {error && <div className="text-[0.82rem] text-rose mb-3">{error}</div>}
      </form>

      <div className="flex items-center justify-end gap-3 -mt-3">
        <Button variant="ghost" onClick={onClose} type="button">
          Cancelar
        </Button>
        <Button
          variant="ink"
          type="submit"
          form="new-charge-form"
          disabled={loading}
        >
          {loading ? "Criando…" : "Criar cobrança"}
          <Icon name="arrow-right" />
        </Button>
      </div>
    </Dialog>
  );
}
