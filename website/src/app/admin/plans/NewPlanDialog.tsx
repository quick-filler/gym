"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { graphql } from "@/gql";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { USE_MOCKS } from "@/lib/config";

const CREATE_PLAN = graphql(`
  mutation AdminCreatePlan($data: PlanInput!) {
    createPlan(data: $data) {
      documentId
      name
      price
      billingCycle
      isActive
    }
  }
`);

export function NewPlanDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly" | "annual">("monthly");
  const [maxStudents, setMaxStudents] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [createPlan, { loading }] = useMutation(CREATE_PLAN);

  function reset() {
    setName("");
    setDescription("");
    setPrice("");
    setBillingCycle("monthly");
    setMaxStudents("");
    setFeatureInput("");
    setFeatures([]);
    setError(null);
  }

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

    const parsedPrice = parseFloat(price.replace(",", "."));
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("Informe um preço válido.");
      return;
    }

    if (USE_MOCKS) {
      onCreated?.();
      reset();
      onClose();
      return;
    }

    try {
      await createPlan({
        variables: {
          data: {
            name,
            description: description || undefined,
            price: parsedPrice,
            billingCycle,
            maxStudents: maxStudents ? parseInt(maxStudents, 10) : undefined,
            features: features.length ? features : undefined,
            isActive: true,
          },
        },
      });
      onCreated?.();
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar plano.");
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Novo plano de matrícula"
      subtitle="Crie um plano para os alunos da academia."
    >
      <form id="new-plan-form" onSubmit={handleSubmit}>
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
          <Field label="Preço (R$)">
            <Input
              required
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="149,00"
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

        {error && (
          <div className="text-[0.82rem] text-rose mb-3">{error}</div>
        )}
      </form>

      <div className="flex items-center justify-end gap-3 -mt-3">
        <Button variant="ghost" onClick={onClose} type="button">
          Cancelar
        </Button>
        <Button
          variant="ink"
          type="submit"
          form="new-plan-form"
          disabled={loading}
        >
          {loading ? "Criando…" : "Criar plano"}
          <Icon name="arrow-right" />
        </Button>
      </div>
    </Dialog>
  );
}
