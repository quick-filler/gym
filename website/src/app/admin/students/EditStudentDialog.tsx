"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { graphql } from "@/gql";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { CpfInput, Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { USE_MOCKS } from "@/lib/config";
import {
  DEFAULT_COUNTRY,
  parseStoredPhone,
  toStored,
  type Country,
} from "@/lib/phone";

const STUDENT_BY_ID = graphql(`
  query AdminStudentForEdit($documentId: ID!) {
    student(documentId: $documentId) {
      documentId
      name
      email
      phone
      birthdate
      cpf
      gender
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
      role
      status
      notes
      enrollments {
        documentId
        status
        startDate
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

const UPDATE_STUDENT = graphql(`
  mutation AdminUpdateStudentFromDialog(
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

const CREATE_ENROLLMENT = graphql(`
  mutation AdminCreateEnrollmentFromDialog($data: EnrollmentInput!) {
    createEnrollment(data: $data) {
      documentId
      status
    }
  }
`);

type Role = "member" | "instructor" | "academy_admin";
type StudentStatusEnum = "active" | "inactive" | "suspended";
type Gender = "" | "female" | "male" | "other";
type PaymentMethod = "pix" | "credit_card" | "boleto";

const todayIso = () => new Date().toISOString().slice(0, 10);

export function EditStudentDialog({
  open,
  documentId,
  focusPlan = false,
  onClose,
  onSaved,
}: {
  open: boolean;
  documentId: string | null;
  /** Quando true e o aluno não tem matrícula ativa, abre já com a seção
   *  de plano expandida e o foco lá. */
  focusPlan?: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const skip = USE_MOCKS || !open || !documentId;
  const { data, loading: loadingDetail } = useQuery(STUDENT_BY_ID, {
    skip,
    variables: { documentId: documentId ?? "" },
    fetchPolicy: "cache-and-network",
  });
  const [updateStudent, { loading: saving }] = useMutation(UPDATE_STUDENT);
  const [createEnrollment, { loading: enrolling }] =
    useMutation(CREATE_ENROLLMENT);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [phoneDigits, setPhoneDigits] = useState("");
  const [cpf, setCpf] = useState("");
  const [gender, setGender] = useState<Gender>("");
  const [birthdate, setBirthdate] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [status, setStatus] = useState<StudentStatusEnum>("active");
  const [notes, setNotes] = useState("");

  // Address
  const [addrCep, setAddrCep] = useState("");
  const [addrStreet, setAddrStreet] = useState("");
  const [addrNumber, setAddrNumber] = useState("");
  const [addrComplement, setAddrComplement] = useState("");
  const [addrNeighborhood, setAddrNeighborhood] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");

  // Plan assignment
  const [planId, setPlanId] = useState("");
  const [planStartDate, setPlanStartDate] = useState(todayIso());
  const [planMethod, setPlanMethod] = useState<PaymentMethod>("pix");

  const [error, setError] = useState<string | null>(null);
  const [showPlanSection, setShowPlanSection] = useState(false);

  const student = data?.student;
  const activeEnrollment = student?.enrollments?.find(
    (e) => e?.status === "active",
  );
  const plans = (data?.plans ?? []).filter((p) => p?.isActive);

  // Hidrata o formulário sempre que carregamos um Student novo.
  useEffect(() => {
    if (!student) return;
    setName(student.name ?? "");
    setEmail(student.email ?? "");
    const stored = parseStoredPhone(student.phone ?? "");
    setPhoneCountry(stored.country);
    setPhoneDigits(stored.national);
    setCpf((student.cpf ?? "").replace(/\D+/g, ""));
    setGender((student.gender as Gender) ?? "");
    setBirthdate(student.birthdate?.slice(0, 10) ?? "");
    setRole((student.role as Role) ?? "member");
    setStatus((student.status as StudentStatusEnum) ?? "active");
    setNotes(student.notes ?? "");
    const addr = student.address;
    setAddrCep(addr?.cep ?? "");
    setAddrStreet(addr?.street ?? "");
    setAddrNumber(addr?.number ?? "");
    setAddrComplement(addr?.complement ?? "");
    setAddrNeighborhood(addr?.neighborhood ?? "");
    setAddrCity(addr?.city ?? "");
    setAddrState(addr?.state ?? "");
    // Decide se a seção de plano abre por padrão.
    const hasActive = !!student.enrollments?.find((e) => e?.status === "active");
    setShowPlanSection(focusPlan || !hasActive);
    setPlanId("");
    setPlanStartDate(todayIso());
    setPlanMethod("pix");
    setError(null);
  }, [student, focusPlan]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!documentId) return;

    if (USE_MOCKS) {
      onSaved?.();
      onClose();
      return;
    }

    // CPF: o backend exige exatamente 11 dígitos; preferimos null a um
    // valor parcial que ia explodir lá.
    if (cpf && cpf.length !== 11) {
      setError("CPF incompleto — preencha os 11 dígitos ou deixe em branco.");
      return;
    }

    try {
      const storedPhone = toStored(phoneCountry, phoneDigits);
      const cpfDigits = cpf;
      const cepDigits = addrCep.replace(/\D+/g, "");
      const hasAddress =
        cepDigits ||
        addrStreet ||
        addrNumber ||
        addrComplement ||
        addrNeighborhood ||
        addrCity ||
        addrState;

      await updateStudent({
        variables: {
          documentId,
          data: {
            name: name.trim(),
            email: email.trim(),
            phone: storedPhone || null,
            cpf: cpfDigits || null,
            gender: gender || null,
            birthdate: birthdate || null,
            role,
            status,
            notes: notes || null,
            address: hasAddress
              ? {
                  cep: cepDigits || null,
                  street: addrStreet.trim() || null,
                  number: addrNumber.trim() || null,
                  complement: addrComplement.trim() || null,
                  neighborhood: addrNeighborhood.trim() || null,
                  city: addrCity.trim() || null,
                  state: addrState.trim() || null,
                }
              : null,
          },
        },
      });

      // Vincula plano se o admin selecionou um na seção do plano.
      if (planId) {
        await createEnrollment({
          variables: {
            data: {
              student: documentId,
              plan: planId,
              startDate: planStartDate,
              paymentMethod: planMethod,
              status: "active",
            },
          },
        });
      }

      onSaved?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    }
  }

  const loading = saving || enrolling;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={student?.name ?? "Editar aluno"}
      subtitle={
        activeEnrollment
          ? `Plano atual: ${activeEnrollment.plan?.name ?? "—"}`
          : "Sem plano ativo · use a seção abaixo para vincular"
      }
    >
      {loadingDetail && !student && (
        <div className="py-12 text-center text-ink-400">Carregando…</div>
      )}

      {(student || USE_MOCKS) && (
        <form id="edit-student-form" onSubmit={handleSubmit}>
          <SectionTitle>Dados pessoais</SectionTitle>
          <div className="grid grid-cols-2 gap-x-4 max-[560px]:grid-cols-1">
            <Field label="Nome completo" className="col-span-2">
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
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
              <Select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
              >
                <option value="">— não informado —</option>
                <option value="female">Feminino</option>
                <option value="male">Masculino</option>
                <option value="other">Outro</option>
              </Select>
            </Field>
            <Field label="Papel na academia">
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <option value="member">Aluno</option>
                <option value="instructor">Instrutor</option>
                <option value="academy_admin">Administrador</option>
              </Select>
            </Field>
            <Field label="Status">
              <Select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as StudentStatusEnum)
                }
              >
                <option value="active">Ativo</option>
                <option value="suspended">Suspenso</option>
                <option value="inactive">Inativo</option>
              </Select>
            </Field>
          </div>

          <SectionTitle>Endereço</SectionTitle>
          <div className="grid grid-cols-6 gap-x-4 max-[560px]:grid-cols-2">
            <Field label="CEP" className="col-span-2">
              <Input
                value={addrCep}
                onChange={(e) => setAddrCep(e.target.value)}
                placeholder="00000-000"
              />
            </Field>
            <Field label="Rua" className="col-span-4">
              <Input
                value={addrStreet}
                onChange={(e) => setAddrStreet(e.target.value)}
              />
            </Field>
            <Field label="Número" className="col-span-2">
              <Input
                value={addrNumber}
                onChange={(e) => setAddrNumber(e.target.value)}
              />
            </Field>
            <Field label="Complemento" className="col-span-4">
              <Input
                value={addrComplement}
                onChange={(e) => setAddrComplement(e.target.value)}
              />
            </Field>
            <Field label="Bairro" className="col-span-3">
              <Input
                value={addrNeighborhood}
                onChange={(e) => setAddrNeighborhood(e.target.value)}
              />
            </Field>
            <Field label="Cidade" className="col-span-2">
              <Input
                value={addrCity}
                onChange={(e) => setAddrCity(e.target.value)}
              />
            </Field>
            <Field label="UF" className="col-span-1">
              <Input
                value={addrState}
                onChange={(e) => setAddrState(e.target.value.toUpperCase())}
                maxLength={2}
              />
            </Field>
          </div>

          <SectionTitle
            action={
              activeEnrollment ? (
                <button
                  type="button"
                  onClick={() => setShowPlanSection((v) => !v)}
                  className="text-[0.78rem] text-flame hover:text-flame-dark"
                >
                  {showPlanSection ? "Ocultar" : "Adicionar outro plano"}
                </button>
              ) : null
            }
          >
            Plano de matrícula
            {!activeEnrollment && (
              <Pill tone="amber" className="ml-2">
                Sem plano
              </Pill>
            )}
          </SectionTitle>

          {showPlanSection ? (
            plans.length === 0 ? (
              <div className="text-[0.85rem] text-ink-500 mb-5">
                Nenhum plano cadastrado nesta academia.{" "}
                <a
                  href="/admin/plans"
                  className="text-flame hover:text-flame-dark"
                >
                  Cadastrar plano →
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 max-[560px]:grid-cols-1">
                <Field label="Plano" className="col-span-2">
                  <Select
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                  >
                    <option value="">— selecionar —</option>
                    {plans.map((p) => (
                      <option key={p?.documentId} value={p?.documentId ?? ""}>
                        {p?.name} · R${" "}
                        {(p?.price ?? 0).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        {p?.billingCycle ? `· ${p.billingCycle}` : ""}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Início">
                  <Input
                    type="date"
                    value={planStartDate}
                    onChange={(e) => setPlanStartDate(e.target.value)}
                  />
                </Field>
                <Field label="Método de pagamento">
                  <Select
                    value={planMethod}
                    onChange={(e) =>
                      setPlanMethod(e.target.value as PaymentMethod)
                    }
                  >
                    <option value="pix">PIX</option>
                    <option value="credit_card">Cartão de crédito</option>
                    <option value="boleto">Boleto</option>
                  </Select>
                </Field>
              </div>
            )
          ) : (
            <div className="text-[0.85rem] text-ink-500 mb-5">
              {activeEnrollment?.plan?.name} · iniciada em{" "}
              {activeEnrollment?.startDate?.slice(0, 10)}
            </div>
          )}

          <SectionTitle>Observações</SectionTitle>
          <Field label="">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas livres sobre o aluno…"
              className="min-h-[80px]"
            />
          </Field>

          {error && (
            <div className="text-[0.82rem] text-rose mb-3">{error}</div>
          )}
        </form>
      )}

      <div className="flex items-center justify-end gap-3 -mt-3">
        <Button variant="ghost" onClick={onClose} type="button">
          Cancelar
        </Button>
        <Button
          variant="ink"
          type="submit"
          form="edit-student-form"
          disabled={loading || (!student && !USE_MOCKS)}
        >
          {loading ? "Salvando…" : "Salvar"}
          <Icon name="check" />
        </Button>
      </div>
    </Dialog>
  );
}

function SectionTitle({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-2 mt-2 first:mt-0">
      <h3 className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink-400">
        {children}
      </h3>
      {action}
    </div>
  );
}
