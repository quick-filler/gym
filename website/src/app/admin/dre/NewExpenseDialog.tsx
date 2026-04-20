"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { graphql } from "@/gql";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { USE_MOCKS } from "@/lib/config";

const CREATE_EXPENSE = graphql(`
  mutation AdminCreateExpense($data: ExpenseInput!) {
    createExpense(data: $data) {
      documentId
      description
      amount
      status
    }
  }
`);

const CATEGORIES: Array<{ value: string; label: string }> = [
  { value: "rent", label: "Aluguel" },
  { value: "utilities", label: "Utilidades" },
  { value: "payroll", label: "Salários" },
  { value: "equipment", label: "Equipamentos" },
  { value: "marketing", label: "Marketing" },
  { value: "supplies", label: "Material" },
  { value: "taxes", label: "Impostos" },
  { value: "software", label: "Software" },
  { value: "other", label: "Outros" },
];

export function NewExpenseDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [description, setDescription] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("other");
  const [type, setType] = useState<"fixed" | "variable">("variable");
  const [status, setStatus] = useState<"paid" | "pending" | "open">("open");
  const [date, setDate] = useState(today);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [createExpense, { loading }] = useMutation(CREATE_EXPENSE);

  function reset() {
    setDescription("");
    setSubtitle("");
    setAmount("");
    setCategory("other");
    setType("variable");
    setStatus("open");
    setDate(today);
    setNotes("");
    setError(null);
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
    if (!amt || amt < 0) {
      setError("Valor inválido.");
      return;
    }

    try {
      await createExpense({
        variables: {
          data: {
            description,
            subtitle: subtitle || undefined,
            amount: amt,
            date,
            category,
            type,
            status,
            notes: notes || undefined,
          },
        },
      });
      onCreated?.();
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar despesa.");
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Nova despesa"
      subtitle="Registre uma despesa operacional da academia."
    >
      <form id="new-expense-form" onSubmit={handleSubmit}>
        <Field label="Descrição">
          <Input
            required
            autoFocus
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Aluguel — Abril"
          />
        </Field>
        <Field label="Subtítulo" help="Opcional">
          <Input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Recorrente · Todo dia 5"
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
          <Field label="Data">
            <Input
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Categoria">
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tipo">
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
            >
              <option value="variable">Variável</option>
              <option value="fixed">Fixo</option>
            </Select>
          </Field>
        </div>
        <Field label="Status">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
          >
            <option value="open">Em aberto</option>
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
          </Select>
        </Field>
        <Field label="Observações" help="Opcional">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Quaisquer notas sobre a despesa…"
          />
        </Field>
        {error && <div className="text-[0.82rem] text-rose mb-3">{error}</div>}
      </form>

      <div className="flex items-center justify-end gap-3 -mt-3">
        <Button variant="ghost" onClick={onClose} type="button">
          Cancelar
        </Button>
        <Button
          variant="ink"
          type="submit"
          form="new-expense-form"
          disabled={loading}
        >
          {loading ? "Criando…" : "Criar despesa"}
          <Icon name="arrow-right" />
        </Button>
      </div>
    </Dialog>
  );
}
