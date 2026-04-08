import type { Metadata } from "next";
import { JsonLd, faqSchema, pageMetadata } from "@/lib/seo";
import PricingClient from "./PricingClient";

export const metadata: Metadata = pageMetadata({
  title: "Preços — Starter, Business e Pro",
  description:
    "Planos a partir de R$ 99/mês. 14 dias grátis, sem cartão de crédito. Sem fidelidade, sem taxa por aluno e sem fee em cima das transações.",
  path: "/pricing",
});

const PRICING_FAQ = [
  {
    question: "Posso cancelar quando quiser?",
    answer:
      "Sim, sem fidelidade nem multa. A cobrança para no próximo ciclo. Os dados ficam disponíveis para exportação por mais 30 dias.",
  },
  {
    question: "Os 14 dias grátis exigem cartão de crédito?",
    answer:
      "Não. Você cria a conta com e-mail e senha e tem acesso completo por 14 dias.",
  },
  {
    question: "Vocês cobram fee em cima das transações do Asaas?",
    answer:
      "Não. Zero. Você só paga as taxas normais do Asaas (1,99% no PIX, R$ 1,99 no boleto).",
  },
];

export default function PricingPage() {
  return (
    <>
      <JsonLd data={faqSchema(PRICING_FAQ)} />
      <PricingClient />
    </>
  );
}
