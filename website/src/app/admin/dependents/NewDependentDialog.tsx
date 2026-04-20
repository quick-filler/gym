"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { graphql } from "@/gql";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { USE_MOCKS } from "@/lib/config";

const CREATE_DEPENDENT = graphql(`
  mutation AdminCreateDependent($data: DependentInput!) {
    createDependent(data: $data) {
      documentId
      name
      birthdate
    }
  }
`);

export function NewDependentDialog({
  open,
  onClose,
  guardianId,
  guardianName,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  guardianId: string;
  guardianName: string;
  onCreated?: () => void;
}) {
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState<"girl" | "boy">("girl");
  const [bloodType, setBloodType] = useState("");
  const [medicalAlert, setMedicalAlert] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [createDependent, { loading }] = useMutation(CREATE_DEPENDENT);

  function reset() {
    setName("");
    setBirthdate("");
    setGender("girl");
    setBloodType("");
    setMedicalAlert("");
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

    try {
      await createDependent({
        variables: {
          data: {
            name,
            birthdate,
            gender,
            status: "active",
            bloodType: bloodType || undefined,
            medicalAlert: medicalAlert || undefined,
            guardian: guardianId,
          },
        },
      });
      onCreated?.();
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar dependente.");
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Novo dependente"
      subtitle={`Vinculado a ${guardianName}`}
    >
      <form id="new-dependent-form" onSubmit={handleSubmit}>
        <Field label="Nome completo">
          <Input
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sofia Costa"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Data de nascimento">
            <Input
              required
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
            />
          </Field>
          <Field label="Gênero">
            <Select
              value={gender}
              onChange={(e) => setGender(e.target.value as typeof gender)}
            >
              <option value="girl">Menina</option>
              <option value="boy">Menino</option>
            </Select>
          </Field>
        </div>
        <Field label="Tipo sanguíneo" help="Opcional — útil para emergências">
          <Input
            value={bloodType}
            onChange={(e) => setBloodType(e.target.value)}
            placeholder="A+"
          />
        </Field>
        <Field label="Alerta médico" help="Alergias, condições, etc.">
          <Input
            value={medicalAlert}
            onChange={(e) => setMedicalAlert(e.target.value)}
            placeholder="Alergia a cloro — informar instrutor"
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
          form="new-dependent-form"
          disabled={loading}
        >
          {loading ? "Criando…" : "Criar dependente"}
          <Icon name="arrow-right" />
        </Button>
      </div>
    </Dialog>
  );
}
