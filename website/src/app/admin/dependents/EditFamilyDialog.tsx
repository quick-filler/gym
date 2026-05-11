"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { graphql } from "@/gql";
import type { AdminFamilyForEditQuery } from "@/gql/graphql";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { CpfInput, Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { USE_MOCKS } from "@/lib/config";
import {
  DEFAULT_COUNTRY,
  parseStoredPhone,
  toStored,
  type Country,
} from "@/lib/phone";
import { cn } from "@/lib/utils";

const FAMILY_BY_GUARDIAN = graphql(`
  query AdminFamilyForEdit($documentId: ID!) {
    student(documentId: $documentId) {
      documentId
      name
      email
      phone
      birthdate
      cpf
      gender
      role
      status
      notes
      address {
        type
        cep
        street
        number
        complement
        neighborhood
        city
        state
      }
      dependents {
        documentId
        name
        birthdate
        cpf
        gender
        relationship
        status
        bloodType
        allergies
        medicalNotes
        medicalAlert
        emergencyContactName
        emergencyContactPhone
        address {
          type
          cep
          street
          number
          complement
          neighborhood
          city
          state
        }
      }
    }
  }
`);

const UPDATE_STUDENT_FAMILY = graphql(`
  mutation AdminUpdateGuardianFromFamilyDialog(
    $documentId: ID!
    $data: StudentUpdateInput!
  ) {
    updateStudent(documentId: $documentId, data: $data) {
      documentId
      name
      email
    }
  }
`);

const UPDATE_DEPENDENT_FAMILY = graphql(`
  mutation AdminUpdateDependentFromFamilyDialog(
    $documentId: ID!
    $data: DependentUpdateInput!
  ) {
    updateDependent(documentId: $documentId, data: $data) {
      documentId
      name
    }
  }
`);

type Tab = { kind: "guardian" } | { kind: "dependent"; documentId: string };

export function EditFamilyDialog({
  open,
  guardianId,
  onClose,
  onSaved,
}: {
  open: boolean;
  guardianId: string | null;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const skip = USE_MOCKS || !open || !guardianId;
  const { data, loading } = useQuery(FAMILY_BY_GUARDIAN, {
    skip,
    variables: { documentId: guardianId ?? "" },
    fetchPolicy: "cache-and-network",
  });

  const guardian = data?.student;
  const dependents = useMemo(
    () =>
      (guardian?.dependents ?? []).filter(
        (d): d is NonNullable<typeof d> => !!d,
      ),
    [guardian?.dependents],
  );

  const [tab, setTab] = useState<Tab>({ kind: "guardian" });

  // Quando trocamos de família, voltar pra aba do responsável
  useEffect(() => {
    if (!open) return;
    setTab({ kind: "guardian" });
  }, [open, guardianId]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={guardian?.name ?? "Editar família"}
      subtitle={
        dependents.length > 0
          ? `${dependents.length} ${dependents.length === 1 ? "dependente" : "dependentes"}`
          : "Sem dependentes cadastrados"
      }
      wide
    >
      {loading && !guardian && (
        <div className="py-12 text-center text-ink-400">Carregando…</div>
      )}

      {guardian && (
        <div className="grid grid-cols-[160px_1fr] gap-5 max-[640px]:grid-cols-1">
          <nav className="flex flex-col gap-1 max-[640px]:flex-row max-[640px]:overflow-x-auto max-[640px]:pb-1">
            <TabButton
              active={tab.kind === "guardian"}
              onClick={() => setTab({ kind: "guardian" })}
              icon="user"
              title="Responsável"
              subtitle={guardian.name}
            />
            {dependents.map((dep, i) => (
              <TabButton
                key={dep.documentId}
                active={
                  tab.kind === "dependent" && tab.documentId === dep.documentId
                }
                onClick={() =>
                  setTab({ kind: "dependent", documentId: dep.documentId })
                }
                icon="users"
                title={`Dependente ${i + 1}`}
                subtitle={dep.name}
              />
            ))}
          </nav>

          <div>
            {tab.kind === "guardian" && (
              <GuardianForm
                key={guardian.documentId}
                guardian={guardian}
                onSaved={onSaved}
                onClose={onClose}
              />
            )}
            {tab.kind === "dependent" &&
              (() => {
                const dep = dependents.find(
                  (d) => d.documentId === tab.documentId,
                );
                if (!dep) return null;
                return (
                  <DependentForm
                    key={dep.documentId}
                    dependent={dep}
                    onSaved={onSaved}
                    onClose={onClose}
                  />
                );
              })()}
          </div>
        </div>
      )}
    </Dialog>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: "user" | "users";
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors",
        "max-[640px]:shrink-0",
        active
          ? "bg-ink-900 text-white"
          : "text-ink-700 hover:bg-paper-50",
      )}
    >
      <Icon name={icon} className="shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[0.62rem] uppercase tracking-[0.08em] opacity-80">
          {title}
        </div>
        <div className="text-[0.82rem] font-semibold truncate">{subtitle}</div>
      </div>
    </button>
  );
}

/* ===========================================================================
 * Guardian (Student) form
 * =======================================================================*/

type GuardianData = NonNullable<AdminFamilyForEditQuery["student"]>;

function GuardianForm({
  guardian,
  onSaved,
  onClose,
}: {
  guardian: GuardianData;
  onSaved?: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(guardian.name ?? "");
  const [email, setEmail] = useState(guardian.email ?? "");
  const [cpf, setCpf] = useState((guardian.cpf ?? "").replace(/\D+/g, ""));
  const [gender, setGender] = useState(guardian.gender ?? "");
  const [birthdate, setBirthdate] = useState(
    guardian.birthdate?.slice(0, 10) ?? "",
  );
  const [status, setStatus] = useState(guardian.status ?? "active");
  const [notes, setNotes] = useState(guardian.notes ?? "");
  const initialPhone = parseStoredPhone(guardian.phone ?? "");
  const [phoneCountry, setPhoneCountry] = useState<Country>(initialPhone.country);
  const [phoneDigits, setPhoneDigits] = useState(initialPhone.national);

  // Address
  const [addr, setAddr] = useState({
    cep: guardian.address?.cep ?? "",
    street: guardian.address?.street ?? "",
    number: guardian.address?.number ?? "",
    complement: guardian.address?.complement ?? "",
    neighborhood: guardian.address?.neighborhood ?? "",
    city: guardian.address?.city ?? "",
    state: guardian.address?.state ?? "",
  });

  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [updateStudent, { loading }] = useMutation(UPDATE_STUDENT_FAMILY);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (USE_MOCKS) {
      setSavedAt(Date.now());
      onSaved?.();
      return;
    }
    if (cpf && cpf.length !== 11) {
      setError("CPF incompleto — preencha os 11 dígitos ou deixe em branco.");
      return;
    }
    try {
      const cpfDigits = cpf;
      const cepDigits = addr.cep.replace(/\D+/g, "");
      const hasAddress = Object.values(addr).some((v) => v && v.trim() !== "");
      await updateStudent({
        variables: {
          documentId: guardian.documentId,
          data: {
            name: name.trim(),
            email: email.trim(),
            phone: toStored(phoneCountry, phoneDigits) || null,
            cpf: cpfDigits || null,
            gender: gender || null,
            birthdate: birthdate || null,
            status,
            notes: notes || null,
            address: hasAddress
              ? {
                  cep: cepDigits || null,
                  street: addr.street.trim() || null,
                  number: addr.number.trim() || null,
                  complement: addr.complement.trim() || null,
                  neighborhood: addr.neighborhood.trim() || null,
                  city: addr.city.trim() || null,
                  state: addr.state.trim() || null,
                }
              : null,
          },
        },
      });
      setSavedAt(Date.now());
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    }
  }

  return (
    <form onSubmit={submit}>
      <SectionTitle>Dados pessoais</SectionTitle>
      <div className="grid grid-cols-2 gap-x-4 max-[560px]:grid-cols-1">
        <Field label="Nome completo" className="col-span-2">
          <Input required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="E-mail">
          <Input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Telefone">
          <PhoneInput
            country={phoneCountry}
            onCountryChange={setPhoneCountry}
            value={phoneDigits}
            onChange={setPhoneDigits}
          />
        </Field>
        <Field
          label="CPF"
          help={
            cpf && cpf.length !== 11
              ? `Faltam ${11 - cpf.length} dígito${
                  11 - cpf.length > 1 ? "s" : ""
                } pra completar o CPF.`
              : undefined
          }
        >
          <CpfInput value={cpf} onChange={setCpf} />
        </Field>
        <Field label="Data de nascimento">
          <Input
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
          />
        </Field>
        <Field label="Sexo">
          <Select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">— não informado —</option>
            <option value="female">Feminino</option>
            <option value="male">Masculino</option>
            <option value="other">Outro</option>
          </Select>
        </Field>
        <Field label="Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">Ativo</option>
            <option value="suspended">Suspenso</option>
            <option value="inactive">Inativo</option>
          </Select>
        </Field>
      </div>

      <AddressFields addr={addr} setAddr={setAddr} />

      <SectionTitle>Observações</SectionTitle>
      <Field label="">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas sobre o responsável…"
          className="min-h-[80px]"
        />
      </Field>

      <FormFooter
        loading={loading}
        savedAt={savedAt}
        error={error}
        onClose={onClose}
      />
    </form>
  );
}

/* ===========================================================================
 * Dependent form
 * =======================================================================*/

type DependentData = NonNullable<NonNullable<GuardianData["dependents"]>[number]>;

function DependentForm({
  dependent,
  onSaved,
  onClose,
}: {
  dependent: DependentData;
  onSaved?: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(dependent.name);
  const [birthdate, setBirthdate] = useState(
    dependent.birthdate?.slice(0, 10) ?? "",
  );
  const [cpf, setCpf] = useState((dependent.cpf ?? "").replace(/\D+/g, ""));
  const [gender, setGender] = useState(dependent.gender ?? "");
  const [relationship, setRelationship] = useState(
    dependent.relationship ?? "other",
  );
  const [status, setStatus] = useState(dependent.status ?? "active");
  const [bloodType, setBloodType] = useState(dependent.bloodType ?? "");
  const [allergies, setAllergies] = useState(dependent.allergies ?? "");
  const [medicalNotes, setMedicalNotes] = useState(dependent.medicalNotes ?? "");
  const [medicalAlert, setMedicalAlert] = useState(dependent.medicalAlert ?? "");
  const [ecName, setEcName] = useState(dependent.emergencyContactName ?? "");
  const initialEcPhone = parseStoredPhone(dependent.emergencyContactPhone ?? "");
  const [ecPhoneCountry, setEcPhoneCountry] = useState<Country>(
    initialEcPhone.country,
  );
  const [ecPhoneDigits, setEcPhoneDigits] = useState(initialEcPhone.national);
  const [addr, setAddr] = useState({
    cep: dependent.address?.cep ?? "",
    street: dependent.address?.street ?? "",
    number: dependent.address?.number ?? "",
    complement: dependent.address?.complement ?? "",
    neighborhood: dependent.address?.neighborhood ?? "",
    city: dependent.address?.city ?? "",
    state: dependent.address?.state ?? "",
  });

  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [updateDep, { loading }] = useMutation(UPDATE_DEPENDENT_FAMILY);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (USE_MOCKS) {
      setSavedAt(Date.now());
      onSaved?.();
      return;
    }
    if (cpf && cpf.length !== 11) {
      setError("CPF incompleto — preencha os 11 dígitos ou deixe em branco.");
      return;
    }
    try {
      const cpfDigits = cpf;
      const cepDigits = addr.cep.replace(/\D+/g, "");
      const hasAddress = Object.values(addr).some((v) => v && v.trim() !== "");
      await updateDep({
        variables: {
          documentId: dependent.documentId,
          data: {
            name: name.trim(),
            birthdate: birthdate || null,
            cpf: cpfDigits || null,
            gender: gender || null,
            relationship,
            status,
            bloodType: bloodType.trim() || null,
            allergies: allergies.trim() || null,
            medicalNotes: medicalNotes.trim() || null,
            medicalAlert: medicalAlert.trim() || null,
            emergencyContactName: ecName.trim() || null,
            emergencyContactPhone:
              toStored(ecPhoneCountry, ecPhoneDigits) || null,
            address: hasAddress
              ? {
                  cep: cepDigits || null,
                  street: addr.street.trim() || null,
                  number: addr.number.trim() || null,
                  complement: addr.complement.trim() || null,
                  neighborhood: addr.neighborhood.trim() || null,
                  city: addr.city.trim() || null,
                  state: addr.state.trim() || null,
                }
              : null,
          },
        },
      });
      setSavedAt(Date.now());
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    }
  }

  return (
    <form onSubmit={submit}>
      <SectionTitle>Dados do dependente</SectionTitle>
      <div className="grid grid-cols-2 gap-x-4 max-[560px]:grid-cols-1">
        <Field label="Nome completo" className="col-span-2">
          <Input required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Data de nascimento">
          <Input
            required
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
          />
        </Field>
        <Field
          label="CPF"
          help={
            cpf && cpf.length !== 11
              ? `Faltam ${11 - cpf.length} dígito${
                  11 - cpf.length > 1 ? "s" : ""
                } pra completar o CPF.`
              : undefined
          }
        >
          <CpfInput value={cpf} onChange={setCpf} />
        </Field>
        <Field label="Sexo">
          <Select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">— não informado —</option>
            <option value="girl">Feminino</option>
            <option value="boy">Masculino</option>
            <option value="other">Outro</option>
          </Select>
        </Field>
        <Field label="Vínculo com responsável">
          <Select
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
          >
            <option value="son">Filho</option>
            <option value="daughter">Filha</option>
            <option value="grandchild">Neto(a)</option>
            <option value="nibling">Sobrinho(a)</option>
            <option value="ward">Tutelado(a)</option>
            <option value="other">Outro</option>
          </Select>
        </Field>
        <Field label="Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">Ativo</option>
            <option value="pending">Pendente</option>
            <option value="inactive">Inativo</option>
          </Select>
        </Field>
      </div>

      <SectionTitle>Saúde</SectionTitle>
      <div className="grid grid-cols-2 gap-x-4 max-[560px]:grid-cols-1">
        <Field label="Tipo sanguíneo">
          <Input
            value={bloodType}
            onChange={(e) => setBloodType(e.target.value)}
            placeholder="ex.: O+"
          />
        </Field>
        <Field label="Alerta médico (chip vermelho)">
          <Input
            value={medicalAlert}
            onChange={(e) => setMedicalAlert(e.target.value)}
            placeholder="ex.: Asma"
          />
        </Field>
        <Field label="Alergias" className="col-span-2">
          <Textarea
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            placeholder="Lista de alergias conhecidas…"
            className="min-h-[60px]"
          />
        </Field>
        <Field label="Observações médicas" className="col-span-2">
          <Textarea
            value={medicalNotes}
            onChange={(e) => setMedicalNotes(e.target.value)}
            placeholder="Histórico, restrições, medicação contínua…"
            className="min-h-[60px]"
          />
        </Field>
      </div>

      <SectionTitle>Contato de emergência</SectionTitle>
      <div className="grid grid-cols-2 gap-x-4 max-[560px]:grid-cols-1">
        <Field label="Nome">
          <Input value={ecName} onChange={(e) => setEcName(e.target.value)} />
        </Field>
        <Field label="Telefone">
          <PhoneInput
            country={ecPhoneCountry}
            onCountryChange={setEcPhoneCountry}
            value={ecPhoneDigits}
            onChange={setEcPhoneDigits}
          />
        </Field>
      </div>

      <AddressFields addr={addr} setAddr={setAddr} />

      <FormFooter
        loading={loading}
        savedAt={savedAt}
        error={error}
        onClose={onClose}
      />
    </form>
  );
}

/* ===========================================================================
 * Reusable bits
 * =======================================================================*/

type AddrState = {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

function AddressFields({
  addr,
  setAddr,
}: {
  addr: AddrState;
  setAddr: React.Dispatch<React.SetStateAction<AddrState>>;
}) {
  const set = (k: keyof AddrState) => (v: string) =>
    setAddr((prev) => ({ ...prev, [k]: v }));
  return (
    <>
      <SectionTitle>Endereço</SectionTitle>
      <div className="grid grid-cols-6 gap-x-4 max-[560px]:grid-cols-2">
        <Field label="CEP" className="col-span-2">
          <Input value={addr.cep} onChange={(e) => set("cep")(e.target.value)} />
        </Field>
        <Field label="Rua" className="col-span-4">
          <Input
            value={addr.street}
            onChange={(e) => set("street")(e.target.value)}
          />
        </Field>
        <Field label="Número" className="col-span-2">
          <Input
            value={addr.number}
            onChange={(e) => set("number")(e.target.value)}
          />
        </Field>
        <Field label="Complemento" className="col-span-4">
          <Input
            value={addr.complement}
            onChange={(e) => set("complement")(e.target.value)}
          />
        </Field>
        <Field label="Bairro" className="col-span-3">
          <Input
            value={addr.neighborhood}
            onChange={(e) => set("neighborhood")(e.target.value)}
          />
        </Field>
        <Field label="Cidade" className="col-span-2">
          <Input
            value={addr.city}
            onChange={(e) => set("city")(e.target.value)}
          />
        </Field>
        <Field label="UF" className="col-span-1">
          <Input
            value={addr.state}
            maxLength={2}
            onChange={(e) => set("state")(e.target.value.toUpperCase())}
          />
        </Field>
      </div>
    </>
  );
}

function FormFooter({
  loading,
  savedAt,
  error,
  onClose,
}: {
  loading: boolean;
  savedAt: number | null;
  error: string | null;
  onClose: () => void;
}) {
  return (
    <>
      {error && <div className="text-[0.82rem] text-rose mb-3">{error}</div>}
      {savedAt && !error && (
        <div className="text-[0.82rem] text-emerald mb-3">
          ✓ Alterações salvas
        </div>
      )}
      <div className="flex items-center justify-end gap-3">
        <Button variant="ghost" type="button" onClick={onClose}>
          Fechar
        </Button>
        <Button variant="ink" type="submit" disabled={loading}>
          {loading ? "Salvando…" : "Salvar"}
          <Icon name="check" />
        </Button>
      </div>
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink-400 mb-2 mt-4 first:mt-0">
      {children}
    </h3>
  );
}

