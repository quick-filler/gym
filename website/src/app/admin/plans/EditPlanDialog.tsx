"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { graphql } from "@/gql";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { CurrencyInput, Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { USE_MOCKS } from "@/lib/config";
import type { MembershipPlan } from "@/lib/types";

const UPDATE_PLAN = graphql(`
  mutation AdminUpdatePlan($documentId: ID!, $data: PlanUpdateInput!) {
    updatePlan(documentId: $documentId, data: $data) {
      documentId
      name
      price
      billingCycle
      isActive
    }
  }
`);

const DELETE_PLAN = graphql(`
  mutation AdminDeletePlan($documentId: ID!) {
    deletePlan(documentId: $documentId) {
      documentId
    }
  }
`);

export function EditPlanDialog({
  plan,
  open,
  onClose,
  onUpdated,
}: {
  plan: MembershipPlan;
  open: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}) {
  const [name, setName] = useState(plan.name);
  const [description, setDescription] = useState(plan.description);
  const [price, setPrice] = useState(plan.price);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly" | "annual">(plan.billingCycle);
  const [maxStudents, setMaxStudents] = useState(plan.maxStudents?.toString() ?? "");
  const [featureInput, setFeatureInput] = useState("");
  const [features, setFeatures] = useState<string[]>(plan.features);
  const [isActive, setIsActive] = useState(plan.isActive);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatePlan, { loading: updating }] = useMutation(UPDATE_PLAN);
  const [deletePlan, { loading: deleting }] = useMutation(DELETE_PLAN);

  useEffect(() => {
    if (open) {
      setName(plan.name);
      setDescription(plan.description);
      setPrice(plan.price);
      setBillingCycle(plan.billingCycle);
      setMaxStudents(plan.maxStudents?.toString() ?? "");
      setFeatures(plan.features);
      setIsActive(plan.isActive);
      setConfirmDelete(false);
      setError(null);
    }
  }, [open, plan]);

  function addFeature() {
    const trimmed = featureInput.trim();
    if (trimmed && !features.includes(trimmed)) {
      setFeatures((prev) => [...prev, trimmed]);
      setFeatureInput("");
    }
  }

  function removeFeature(f: string) {
    setFeatures((prev) => prev.filter((x) => x !== f));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (price <= 0) {
      setError("Informe um preço válido.");
      return;
    }

    if (USE_MOCKS) {
      onUpdated?.();
      onClose();
      return;
    }

    try {
      await updatePlan({
        variables: {
          documentId: plan.id,
          data: {
            name,
            description: description || undefined,
            price,
            billingCycle,
            maxStudents: maxStudents ? parseInt(maxStudents, 10) : undefined,
            features,
            isActive,
          },
        },
      });
      onUpdated?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar plano.");
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    if (USE_MOCKS) {
      onUpdated?.();
      onClose();
      return;
    }

    try {
      await deletePlan({ variables: { documentId: plan.id } });
      onUpdated?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir plano.");
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Editar plano"
      subtitle={`Atualizando "${plan.name}"`}
    >
      <form id="edit-plan-form" onSubmit={handleSubmit}>
        <Field label="Nome do plano">
          <Input
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Mensal, Trimestral, Anual"
          />
        </Field>

        <Field label="Descrição" help="Opcional — aparece no card do plano">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Acesso completo à academia com renovação mensal."
            rows={2}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Preço">
            <CurrencyInput
              required
              value={price}
              onChange={setPrice}
            />
          </Field>
          <Field label="Periodicidade">
            <Select
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value as typeof billingCycle)}
            >
              <option value="monthly">Mensal</option>
              <option value="quarterly">Trimestral</option>
              <option value="annual">Anual</option>
            </Select>
          </Field>
        </div>

        <Field label="Limite de alunos" help="Deixe em branco para ilimitado">
          <Input
            type="number"
            min={1}
            value={maxStudents}
            onChange={(e) => setMaxStudents(e.target.value)}
            placeholder="Ilimitado"
          />
        </Field>

        <Field label="Benefícios incluídos" help="Pressione Enter para adicionar cada item">
          <div className="flex gap-2">
            <Input
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addFeature();
                }
              }}
              placeholder="Ex: Acesso ilimitado"
            />
            <button
              type="button"
              onClick={addFeature}
              className="shrink-0 w-10 h-10 rounded-xl bg-ink-100 hover:bg-ink-200 text-ink-700 flex items-center justify-center transition-colors"
            >
              <Icon name="plus" />
            </button>
          </div>
          {features.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2 bg-paper-50 rounded-lg px-3 py-2">
                  <Icon name="check" size="sm" />
                  <span className="text-[0.85rem] text-ink-800 flex-1">{f}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(f)}
                    className="text-ink-400 hover:text-rose transition-colors"
                  >
                    <Icon name="x" size="sm" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Field>

        <Field label="Status">
          <Select
            value={isActive ? "active" : "inactive"}
            onChange={(e) => setIsActive(e.target.value === "active")}
          >
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </Select>
        </Field>

        {error && (
          <div className="text-[0.82rem] text-rose mb-3">{error}</div>
        )}
      </form>

      <div className="flex items-center gap-3 -mt-3">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className={
            confirmDelete
              ? "font-mono text-[0.72rem] uppercase tracking-[0.08em] font-semibold text-white bg-rose hover:bg-rose/80 transition-colors px-3 py-2 rounded-lg disabled:opacity-50"
              : "font-mono text-[0.72rem] uppercase tracking-[0.08em] font-semibold text-rose border border-rose/40 hover:bg-rose/5 transition-colors px-3 py-2 rounded-lg disabled:opacity-50"
          }
        >
          {deleting ? "Excluindo…" : confirmDelete ? "Confirmar exclusão" : "Excluir"}
        </button>
        {confirmDelete && (
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="font-mono text-[0.72rem] uppercase tracking-[0.08em] font-semibold text-ink-500 hover:text-ink-900 transition-colors"
          >
            Cancelar
          </button>
        )}
        <div className="ml-auto flex items-center gap-3">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button
            variant="ink"
            type="submit"
            form="edit-plan-form"
            disabled={updating}
          >
            {updating ? "Salvando…" : "Salvar"}
            <Icon name="check" />
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
