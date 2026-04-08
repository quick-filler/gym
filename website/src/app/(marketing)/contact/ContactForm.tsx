"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    // In mock mode we fake the network round-trip. API mode would POST to
    // a Strapi custom endpoint or an email service webhook.
    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
    }, 600);
  }

  if (sent) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald flex items-center justify-center mb-5">
          <Icon name="check" size="xl" />
        </div>
        <h3 className="font-display text-[1.6rem] font-semibold">
          Mensagem enviada!
        </h3>
        <p className="text-ink-500 mt-3 max-w-[28rem] mx-auto">
          Obrigado! A gente responde no mesmo dia útil, geralmente em menos de
          uma hora.
        </p>
        <Button
          variant="ink"
          className="mt-6"
          onClick={() => setSent(false)}
        >
          Enviar outra mensagem
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
        <Field label="Nome *">
          <Input name="name" placeholder="Como te chamamos?" required />
        </Field>
        <Field label="Academia">
          <Input name="academy" placeholder="Nome da sua academia" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
        <Field label="E-mail *">
          <Input
            name="email"
            type="email"
            placeholder="voce@academia.com.br"
            required
          />
        </Field>
        <Field label="WhatsApp">
          <Input name="phone" type="tel" placeholder="(11) 99999-0000" />
        </Field>
      </div>
      <Field label="Quantos alunos ativos?">
        <Select name="size" defaultValue="50 — 200">
          <option>Menos de 50</option>
          <option>50 — 200</option>
          <option>200 — 500</option>
          <option>Mais de 500</option>
          <option>Ainda não abri</option>
        </Select>
      </Field>
      <Field
        label="O que você quer saber? *"
        help="Se for migração de outro sistema, conta qual."
      >
        <Textarea
          name="message"
          rows={5}
          placeholder="Pode ser específico — quanto mais contexto, melhor a resposta."
          required
        />
      </Field>
      <Button
        type="submit"
        variant="flame"
        block
        disabled={submitting}
        className="mt-2"
      >
        {submitting ? "Enviando…" : "Enviar mensagem"}
        <Icon name="arrow-right" />
      </Button>
      <p className="text-[0.78rem] text-ink-400 mt-4 text-center">
        Ao enviar, você concorda com nossa{" "}
        <a href="/privacidade" className="text-flame hover:underline">
          Política de Privacidade
        </a>{" "}
        (LGPD).
      </p>
    </form>
  );
}
