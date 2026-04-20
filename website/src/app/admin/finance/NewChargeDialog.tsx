"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { graphql } from "@/gql";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { USE_MOCKS } from "@/lib/config";

const ACTIVE_ENROLLMENTS = graphql(`
  query ActiveEnrollmentsForCharge {
    enrollments(pagination: { limit: 100 }) {
      documentId
      status
      student {
        documentId
        name
        email
      }
      plan {
        documentId
        name
        price
        billingCycle
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
  // Default to today so the new charge lands in the current month's
  // window — financeOverview / dreOverview both filter by dueDate ∈
  // [monthStart, nextMonthStart), and picking a future date made the
  // row silently invisible in the list right after creation.
  const todayIso = new Date().toISOString().slice(0, 10);

  const { data: enrollmentData } = useQuery(ACTIVE_ENROLLMENTS, {
    skip: USE_MOCKS || !open,
  });

  const [enrollmentId, setEnrollmentId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(todayIso);
  const [method, setMethod] = useState<"pix" | "credit_card" | "boleto">("pix");
  const [status, setStatus] = useState<"pending" | "paid" | "overdue">(
    "pending",
  );
  const [error, setError] = useState<string | null>(null);
  const [createPayment, { loading }] = useMutation(CREATE_PAYMENT);

  const options =
    enrollmentData?.enrollments
      ?.filter((e): e is NonNullable<typeof e> => !!e && e.status === "active")
      .map((e) => ({
        id: e.documentId,
        label: `${e.student?.name ?? "—"} · ${e.plan?.name ?? "—"}`,
        price: e.plan?.price ?? 0,
      })) ?? [];

  function reset() {
    setEnrollmentId("");
    setAmount("");
    setDueDate(todayIso);
    setMethod("pix");
    setStatus("pending");
    setError(null);
  }

  function handleEnrollmentChange(id: string) {
    setEnrollmentId(id);
    const match = options.find((o) => o.id === id);
    if (match && !amount) setAmount(String(match.price));
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
    if (!enrollmentId) {
      setError("Selecione uma matrícula.");
      return;
    }
    if (!amt || amt < 0) {
      setError("Valor inválido.");
      return;
    }

    try {
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Nova cobrança"
      subtitle="Gere uma cobrança manual para uma matrícula ativa. Cobranças recorrentes são criadas automaticamente pelo Asaas."
    >
      <form id="new-charge-form" onSubmit={handleSubmit}>
        <Field
          label="Aluno (matrícula ativa)"
          help={
            options.length === 0
              ? "Nenhuma matrícula ativa. Cadastre um aluno e matricule-o em um plano antes de gerar cobrança."
              : "Escolha o aluno. O valor é preenchido automaticamente pelo preço do plano."
          }
        >
          <Select
            required
            value={enrollmentId}
            onChange={(e) => handleEnrollmentChange(e.target.value)}
            disabled={options.length === 0}
          >
            <option value="">Selecione um aluno…</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </Select>
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
