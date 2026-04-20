"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { graphql } from "@/gql";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { USE_MOCKS } from "@/lib/config";

const CREATE_STUDENT = graphql(`
  mutation AdminCreateStudent($data: StudentInput!) {
    createStudent(data: $data) {
      documentId
      name
      email
      status
    }
  }
`);

export function NewStudentDialog({
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
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"member" | "instructor" | "academy_admin">(
    "member",
  );
  const [error, setError] = useState<string | null>(null);
  const [createStudent, { loading }] = useMutation(CREATE_STUDENT);

  function reset() {
    setName("");
    setEmail("");
    setPhone("");
    setRole("member");
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
      await createStudent({
        variables: {
          data: {
            name,
            email,
            phone: phone || undefined,
            role,
            status: "active",
          },
        },
      });
      onCreated?.();
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar aluno.");
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Novo aluno"
      subtitle="Adicione um aluno à academia. Você pode atribuir plano e matrícula em seguida."
    >
      <form id="new-student-form" onSubmit={handleSubmit}>
        <Field label="Nome completo">
          <Input
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ana Beatriz Souza"
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
        <Field label="Telefone" help="Opcional">
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(11) 98765-4321"
          />
        </Field>
        <Field label="Papel na academia">
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
          >
            <option value="member">Aluno</option>
            <option value="instructor">Instrutor</option>
            <option value="academy_admin">Administrador</option>
          </Select>
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
          form="new-student-form"
          disabled={loading}
        >
          {loading ? "Criando…" : "Criar aluno"}
          <Icon name="arrow-right" />
        </Button>
      </div>
    </Dialog>
  );
}
