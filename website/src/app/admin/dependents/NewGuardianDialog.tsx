"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { graphql } from "@/gql";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { USE_MOCKS } from "@/lib/config";
import { DEFAULT_COUNTRY, toStored, type Country } from "@/lib/phone";

const CREATE_GUARDIAN = graphql(`
  mutation AdminCreateGuardianStudent($data: StudentInput!) {
    createStudent(data: $data) {
      documentId
      name
      email
      isGuardian
    }
  }
`);

export function NewGuardianDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [error, setError] = useState<string | null>(null);
  const [createGuardian, { loading }] = useMutation(CREATE_GUARDIAN);

  function reset() {
    setName("");
    setEmail("");
    setPhoneDigits("");
    setPhoneCountry(DEFAULT_COUNTRY);
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
      const storedPhone = toStored(phoneCountry, phoneDigits);
      await createGuardian({
        variables: {
          data: {
            name,
            email,
            phone: storedPhone || undefined,
            role: "member",
            status: "active",
            isGuardian: true,
          },
        },
      });
      onCreated?.();
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar responsável.");
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Novo responsável"
      subtitle="Cadastre um adulto que paga por dependentes (família). Depois você adiciona os dependentes pelo card dele."
    >
      <form id="new-guardian-form" onSubmit={handleSubmit}>
        <Field label="Nome do responsável">
          <Input
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ana Costa"
          />
        </Field>
        <Field label="E-mail">
          <Input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ana@email.com"
          />
        </Field>
        <Field label="Telefone" help="Usado para avisos urgentes sobre os dependentes">
          <PhoneInput
            country={phoneCountry}
            onCountryChange={setPhoneCountry}
            value={phoneDigits}
            onChange={setPhoneDigits}
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
          form="new-guardian-form"
          disabled={loading}
        >
          {loading ? "Criando…" : "Criar responsável"}
          <Icon name="arrow-right" />
        </Button>
      </div>
    </Dialog>
  );
}
