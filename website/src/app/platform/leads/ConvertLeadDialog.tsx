"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";

const CONVERT_LEAD = gql`
  mutation ConvertLead($documentId: ID!, $data: ConvertLeadInput!) {
    convertLead(documentId: $documentId, data: $data) {
      academy {
        documentId
        name
        slug
        plan
      }
      passwordResetUrl
      adminEmail
      emailSent
    }
  }
`;

type Lead = {
  documentId: string;
  name: string;
  email: string;
  academyName?: string | null;
  planInterest?: string | null;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function ConvertLeadDialog({
  open,
  lead,
  onClose,
  onConverted,
}: {
  open: boolean;
  lead: Lead | null;
  onClose: () => void;
  onConverted: () => void;
}) {
  const [academyName, setAcademyName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [plan, setPlan] = useState<"starter" | "business" | "pro">("starter");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [secondaryColor, setSecondaryColor] = useState("#8b5cf6");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    name: string;
    slug: string;
    resetUrl: string;
    adminEmail: string;
    emailSent: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  type ConvertLeadData = {
    convertLead: {
      academy: { documentId: string; name: string; slug: string; plan: string };
      passwordResetUrl: string;
      adminEmail: string;
      emailSent: boolean;
    };
  };

  const [convertLead, { loading }] = useMutation<ConvertLeadData>(CONVERT_LEAD);

  // Reset state every time we open with a new lead.
  useEffect(() => {
    if (!open || !lead) return;
    const baseName = lead.academyName?.trim() || `${lead.name} Academia`;
    setAcademyName(baseName);
    setSlug(slugify(baseName));
    setSlugTouched(false);
    setPlan(
      lead.planInterest === "business" || lead.planInterest === "pro"
        ? lead.planInterest
        : "starter",
    );
    setPrimaryColor("#6366f1");
    setSecondaryColor("#8b5cf6");
    setError(null);
    setResult(null);
    setCopied(false);
  }, [open, lead]);

  function handleAcademyNameChange(value: string) {
    setAcademyName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!lead) return;
    setError(null);

    if (!slug) {
      setError("Informe um slug.");
      return;
    }

    try {
      const res = await convertLead({
        variables: {
          documentId: lead.documentId,
          data: {
            slug,
            plan,
            academyName: academyName || undefined,
            primaryColor,
            secondaryColor,
          },
        },
      });
      const data = res.data?.convertLead;
      if (!data) throw new Error("Resposta vazia do servidor.");
      setResult({
        name: data.academy.name,
        slug: data.academy.slug,
        resetUrl: data.passwordResetUrl,
        adminEmail: data.adminEmail,
        emailSent: data.emailSent,
      });
      onConverted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao converter lead.");
    }
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.resetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  if (!lead) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={result ? "Academia criada" : "Converter em academia"}
      subtitle={
        result
          ? `${result.name} foi provisionada com sucesso.`
          : `Provisiona academia + admin a partir do lead ${lead.name}.`
      }
    >
      {result ? (
        <div className="flex flex-col gap-5">
          <div
            className={
              result.emailSent
                ? "rounded-xl bg-emerald/10 border border-emerald/30 p-4"
                : "rounded-xl bg-amber/10 border border-amber/30 p-4"
            }
          >
            <div className="flex items-center gap-2 font-semibold text-[0.92rem] mb-1">
              <Icon name={result.emailSent ? "check" : "mail"} />
              {result.emailSent
                ? "E-mail de boas-vindas enviado"
                : "E-mail não pôde ser enviado"}
            </div>
            <p className="text-[0.85rem] text-ink-700">
              {result.emailSent
                ? `${result.adminEmail} recebeu o link para definir a senha.`
                : `Copie o link abaixo e envie manualmente para ${result.adminEmail}. O envio automático falhou (verifique a configuração de SMTP).`}
            </p>
          </div>

          <div>
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-400 mb-1">
              Link para definir senha
            </div>
            <div className="flex items-stretch gap-2">
              <input
                readOnly
                value={result.resetUrl}
                className="flex-1 rounded-xl border border-line bg-paper-50 px-3 py-2 text-[0.78rem] font-mono text-ink-700 focus:outline-none"
                onFocus={(e) => e.currentTarget.select()}
              />
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 px-4 rounded-xl bg-ink-900 text-paper text-[0.82rem] font-medium hover:bg-ink-700 transition-colors"
              >
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <p className="text-[0.78rem] text-ink-400 mt-2">
              Esse link é pessoal e expira por segurança. Não compartilhe em
              canais públicos.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-paper-50 p-4 text-[0.85rem] text-ink-700">
            <div className="font-semibold text-ink-900 mb-1">
              Próximos passos
            </div>
            <ul className="list-disc list-inside flex flex-col gap-0.5 text-[0.85rem]">
              <li>
                Acesse o painel em <span className="font-mono">/platform/academies</span>{" "}
                para conferir.
              </li>
              <li>
                A academia foi criada com slug{" "}
                <span className="font-mono">{result.slug}</span>.
              </li>
              <li>O admin pode logar assim que definir a senha pelo link.</li>
            </ul>
          </div>

          <div className="flex justify-end">
            <Button variant="ink" onClick={onClose} type="button">
              Fechar
            </Button>
          </div>
        </div>
      ) : (
        <>
          <form id="convert-lead-form" onSubmit={handleSubmit}>
            <Field
              label="Nome da academia"
              help="Como aparecerá no painel e nos e-mails."
            >
              <Input
                required
                value={academyName}
                onChange={(e) => handleAcademyNameChange(e.target.value)}
                placeholder="Ex: CrossFit SP"
              />
            </Field>

            <Field
              label="Slug (subdomínio)"
              help="Apenas letras minúsculas, números e hífens. Usado como identificador único."
            >
              <Input
                required
                value={slug}
                onChange={(e) => {
                  setSlug(slugify(e.target.value));
                  setSlugTouched(true);
                }}
                placeholder="crossfit-sp"
                pattern="[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
              />
            </Field>

            <Field label="Plano contratado">
              <Select
                value={plan}
                onChange={(e) => setPlan(e.target.value as typeof plan)}
              >
                <option value="starter">Starter</option>
                <option value="business">Business</option>
                <option value="pro">Pro</option>
              </Select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Cor primária">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-11 w-12 rounded-xl border border-line cursor-pointer bg-white"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="font-mono text-[0.85rem]"
                  />
                </div>
              </Field>
              <Field label="Cor secundária">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-11 w-12 rounded-xl border border-line cursor-pointer bg-white"
                  />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="font-mono text-[0.85rem]"
                  />
                </div>
              </Field>
            </div>

            <div className="rounded-xl border border-line bg-paper-50 p-4 text-[0.85rem] text-ink-700 mb-4">
              <div className="font-semibold text-ink-900 mb-1">
                O que vai acontecer
              </div>
              <ul className="list-disc list-inside flex flex-col gap-0.5 text-[0.85rem]">
                <li>Nova Academy com o slug acima.</li>
                <li>
                  Usuário com e-mail{" "}
                  <span className="font-mono">{lead.email}</span> e papel{" "}
                  <span className="font-mono">academy_admin</span>.
                </li>
                <li>E-mail com link para definir a senha de acesso.</li>
                <li>Lead marcado como convertido.</li>
              </ul>
            </div>

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
              form="convert-lead-form"
              disabled={loading}
            >
              {loading ? "Convertendo…" : "Converter em academia"}
              <Icon name="arrow-right" />
            </Button>
          </div>
        </>
      )}
    </Dialog>
  );
}
