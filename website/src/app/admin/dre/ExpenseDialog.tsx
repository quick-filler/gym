"use client";

/**
 * Dialog único pra criar **e editar** despesas.
 *
 * - `expenseId === null`  → modo criar (form vazio)
 * - `expenseId === string` → modo editar (faz query do expense, preenche
 *   form, mostra botão de excluir no rodapé)
 *
 * As mutations (create/update/delete) ficam aqui mesmo pra não
 * espalhar GraphQL docs. A página dre/page.tsx só lida com o `id`.
 */

import { useEffect, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { graphql } from "@/gql";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { USE_MOCKS } from "@/lib/config";

const EXPENSE_BY_ID = graphql(`
  query AdminExpenseForEdit($documentId: ID!) {
    expense(documentId: $documentId) {
      documentId
      description
      subtitle
      amount
      date
      category
      type
      status
      notes
    }
  }
`);

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

const UPDATE_EXPENSE = graphql(`
  mutation AdminUpdateExpense(
    $documentId: ID!
    $data: ExpenseUpdateInput!
  ) {
    updateExpense(documentId: $documentId, data: $data) {
      documentId
      description
      amount
      status
    }
  }
`);

const DELETE_EXPENSE = graphql(`
  mutation AdminDeleteExpense($documentId: ID!) {
    deleteExpense(documentId: $documentId) {
      documentId
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

type FormState = {
  description: string;
  subtitle: string;
  amount: string;
  date: string;
  category: string;
  type: "fixed" | "variable";
  status: "paid" | "pending" | "open";
  notes: string;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyForm(): FormState {
  return {
    description: "",
    subtitle: "",
    amount: "",
    date: todayIso(),
    category: "other",
    type: "variable",
    status: "open",
    notes: "",
  };
}

export function ExpenseDialog({
  open,
  expenseId,
  onClose,
  onSaved,
}: {
  open: boolean;
  /** null = criar; string = editar */
  expenseId: string | null;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const isEdit = !!expenseId;
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [fetchExpense, { loading: loadingExpense }] = useLazyQuery(EXPENSE_BY_ID);
  const [createExpense, { loading: creating }] = useMutation(CREATE_EXPENSE);
  const [updateExpense, { loading: updating }] = useMutation(UPDATE_EXPENSE);
  const [deleteExpense, { loading: deleting }] = useMutation(DELETE_EXPENSE);

  // Hidrata form ao abrir em modo edit. Em modo criar, reseta.
  useEffect(() => {
    if (!open) return;
    if (!expenseId) {
      setForm(emptyForm());
      setError(null);
      return;
    }
    if (USE_MOCKS) return;
    void fetchExpense({ variables: { documentId: expenseId } }).then((res) => {
      const e = res.data?.expense;
      if (!e) return;
      setForm({
        description: e.description ?? "",
        subtitle: e.subtitle ?? "",
        amount: e.amount?.toString() ?? "",
        date: e.date?.slice(0, 10) ?? todayIso(),
        category: e.category ?? "other",
        type: (e.type as FormState["type"]) ?? "variable",
        status: (e.status as FormState["status"]) ?? "open",
        notes: e.notes ?? "",
      });
      setError(null);
    });
  }, [open, expenseId, fetchExpense]);

  function update_<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (USE_MOCKS) {
      onSaved?.();
      onClose();
      return;
    }

    const amt = Number(form.amount);
    if (!amt || amt < 0) {
      setError("Valor inválido.");
      return;
    }

    const data = {
      description: form.description,
      subtitle: form.subtitle || undefined,
      amount: amt,
      date: form.date,
      category: form.category,
      type: form.type,
      status: form.status,
      notes: form.notes || undefined,
    };

    try {
      if (isEdit && expenseId) {
        await updateExpense({ variables: { documentId: expenseId, data } });
      } else {
        await createExpense({ variables: { data } });
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar despesa.");
    }
  }

  async function handleDelete() {
    if (!expenseId) return;
    try {
      await deleteExpense({ variables: { documentId: expenseId } });
      setConfirmDelete(false);
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir despesa.");
      setConfirmDelete(false);
    }
  }

  const saving = creating || updating;
  const loading = loadingExpense && isEdit;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        title={isEdit ? "Editar despesa" : "Nova despesa"}
        subtitle={
          isEdit
            ? "Ajuste os dados e salve. Mudanças refletem no DRE imediatamente."
            : "Registre uma despesa operacional da academia."
        }
      >
        {loading && (
          <div className="py-12 text-center text-ink-400">Carregando…</div>
        )}

        {!loading && (
          <form id="expense-form" onSubmit={handleSubmit}>
            <Field label="Descrição">
              <Input
                required
                autoFocus
                value={form.description}
                onChange={(e) => update_("description", e.target.value)}
                placeholder="Aluguel — Abril"
              />
            </Field>
            <Field label="Subtítulo" help="Opcional">
              <Input
                value={form.subtitle}
                onChange={(e) => update_("subtitle", e.target.value)}
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
                  value={form.amount}
                  onChange={(e) => update_("amount", e.target.value)}
                  placeholder="0,00"
                />
              </Field>
              <Field label="Data">
                <Input
                  required
                  type="date"
                  value={form.date}
                  onChange={(e) => update_("date", e.target.value)}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Categoria">
                <Select
                  value={form.category}
                  onChange={(e) => update_("category", e.target.value)}
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
                  value={form.type}
                  onChange={(e) =>
                    update_("type", e.target.value as FormState["type"])
                  }
                >
                  <option value="variable">Variável</option>
                  <option value="fixed">Fixo</option>
                </Select>
              </Field>
            </div>
            <Field label="Status">
              <Select
                value={form.status}
                onChange={(e) =>
                  update_("status", e.target.value as FormState["status"])
                }
              >
                <option value="open">Em aberto</option>
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
              </Select>
            </Field>
            <Field label="Observações" help="Opcional">
              <Textarea
                value={form.notes}
                onChange={(e) => update_("notes", e.target.value)}
                placeholder="Quaisquer notas sobre a despesa…"
              />
            </Field>
            {error && (
              <div className="text-[0.82rem] text-rose mb-3">{error}</div>
            )}
          </form>
        )}

        <div className="flex items-center justify-between gap-3 -mt-3">
          {isEdit ? (
            <Button
              variant="ghost"
              onClick={() => setConfirmDelete(true)}
              type="button"
              className="text-rose hover:text-rose"
            >
              <Icon name="trash" /> Excluir
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button
              variant="ink"
              type="submit"
              form="expense-form"
              disabled={saving || loading}
            >
              {saving
                ? "Salvando…"
                : isEdit
                  ? "Salvar"
                  : "Criar despesa"}
              <Icon name={isEdit ? "check" : "arrow-right"} />
            </Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
        tone="danger"
        title="Excluir despesa?"
        message={
          form.description
            ? `"${form.description}" será removida permanentemente do DRE.`
            : "Esta despesa será removida permanentemente do DRE."
        }
        confirmLabel="Excluir"
      />
    </>
  );
}
