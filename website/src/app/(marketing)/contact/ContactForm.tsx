"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/LoadingState";
import { SubmitContactFormDocument } from "@/gql/graphql";
import { USE_MOCKS } from "@/lib/config";

function maskPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");

  const [submitForm, { loading }] = useMutation(SubmitContactFormDocument, {
    onCompleted() {
      setSent(true);
    },
    onError(err: Error) {
      setError(err.message ?? "Erro ao enviar. Tente novamente.");
    },
  });

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (USE_MOCKS) {
      setTimeout(() => setSent(true), 600);
      return;
    }

    const fd = new FormData(e.currentTarget);
    const rawPhone = phone.replace(/\D/g, "");
    submitForm({
      variables: {
        input: {
          name: fd.get("name") as string,
          email: fd.get("email") as string,
          phone: rawPhone || undefined,
          academyName: (fd.get("academy") as string) || undefined,
          studentCount: (fd.get("size") as string) || undefined,
          message: fd.get("message") as string,
        },
      },
    });
  }

  if (sent) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald flex items-center justify-center mb-5">
          <Icon name="check" size="xl" />
        </div>
        <h3 className="font-display text-[1.5rem] font-semibold leading-[1.2]">
          Cadastro recebido!
        </h3>
        <p className="text-ink-500 mt-3 max-w-[28rem] mx-auto text-[0.95rem] leading-[1.55]">
          A gente acabou de receber seus dados. Em poucos minutos você recebe
          um e-mail com o link de acesso à sua conta — já liberada por 14
          dias, sem cartão.
        </p>
        <div className="mt-6 p-4 rounded-xl bg-paper-2 text-left max-w-[28rem] mx-auto text-[0.82rem] text-ink-600">
          <strong className="block font-semibold text-ink-900 mb-1">
            Não recebeu em 5 minutos?
          </strong>
          Confere a caixa de spam ou fala com a gente em{" "}
          <a
            href="mailto:contato@quickfiller.org"
            className="text-flame hover:underline"
          >
            contato@quickfiller.org
          </a>
          .
        </div>
        <Button variant="ghost" className="mt-6" onClick={() => setSent(false)}>
          Cadastrar outra academia
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
        <Field label="Seu nome *">
          <Input
            name="name"
            placeholder="Como te chamamos?"
            autoComplete="name"
            required
          />
        </Field>
        <Field label="Nome da academia *">
          <Input
            name="academy"
            placeholder="Ex: CrossFit Vila Mariana"
            autoComplete="organization"
            required
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
        <Field
          label="E-mail *"
          help="É pra cá que mandamos o link de acesso."
        >
          <Input
            name="email"
            type="email"
            placeholder="voce@academia.com.br"
            autoComplete="email"
            required
          />
        </Field>
        <Field label="WhatsApp">
          <Input
            type="tel"
            placeholder="(11) 99999-0000"
            value={phone}
            onChange={(e) => setPhone(maskPhone(e.target.value))}
            inputMode="numeric"
            autoComplete="tel"
          />
        </Field>
      </div>
      <Field label="Quantos alunos ativos hoje? *">
        <Select name="size" defaultValue="de_50_a_200" required>
          <option value="menos_de_50">Menos de 50</option>
          <option value="de_50_a_200">50 — 200</option>
          <option value="de_200_a_500">200 — 500</option>
          <option value="mais_de_500">Mais de 500</option>
          <option value="ainda_nao_abri">Ainda não abri</option>
        </Select>
      </Field>
      <Field
        label="Alguma observação? (opcional)"
        help="Se está migrando de outro sistema, conta qual. Ajuda a gente a preparar a importação."
      >
        <Textarea
          name="message"
          rows={3}
          placeholder="Ex: hoje uso o sistema X, preciso importar 350 alunos…"
        />
      </Field>

      {error && (
        <p className="text-[0.82rem] text-rose mb-2">{error}</p>
      )}

      <Button
        type="submit"
        variant="flame"
        block
        disabled={loading}
        className="mt-2"
      >
        {loading ? (
          <>
            <Spinner size={14} />
            Criando sua conta…
          </>
        ) : (
          <>
            Começar teste grátis
            <Icon name="arrow-right" />
          </>
        )}
      </Button>
      <p className="text-[0.78rem] text-ink-400 mt-4 text-center leading-[1.5]">
        Ao se cadastrar você libera 14 dias grátis, sem cartão de crédito.
        <br className="max-[720px]:hidden" />
        Concorda também com nossa{" "}
        <a href="/privacidade" className="text-flame hover:underline">
          Política de Privacidade
        </a>{" "}
        (LGPD).
      </p>
    </form>
  );
}
