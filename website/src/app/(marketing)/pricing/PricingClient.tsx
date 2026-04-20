"use client";

import { Fragment, useState } from "react";
import { Wrap } from "@/components/marketing/Wrap";
import { Button } from "@/components/ui/Button";
import { Eyebrow, SectionEyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { usePricingPlans } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const FAQ = [
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim, sem fidelidade nem multa. A cobrança para no próximo ciclo. Os dados ficam disponíveis para exportação por mais 30 dias.",
  },
  {
    q: "Os 14 dias grátis exigem cartão de crédito?",
    a: "Não. Você cria a conta com e-mail e senha e tem acesso completo por 14 dias. Sem cadastro de cartão, sem cobrança automática quando o trial acaba.",
  },
  {
    q: "O que acontece se eu ultrapassar o limite de alunos?",
    a: "Você recebe um aviso amigável. O sistema não bloqueia automaticamente — a gente conversa antes de qualquer cobrança extra.",
  },
  {
    q: "Vocês cobram fee em cima das transações do Asaas?",
    a: "Não. Zero. Você só paga as taxas normais do Asaas (1,99% no PIX, R$ 1,99 no boleto). Nada vai pra gente em cima disso.",
  },
  {
    q: "Como funciona o desconto anual?",
    a: "Pagando o ano inteiro à vista, você ganha o equivalente a 2 meses. Starter sai por R$ 79/mês, Business por R$ 159/mês, Pro por R$ 319/mês.",
  },
  {
    q: "Mudar de plano é simples?",
    a: "Um clique. Upgrades entram em vigor imediatamente, downgrades no próximo ciclo. A diferença proporcional é creditada / cobrada automaticamente.",
  },
];

const COMPARE = [
  {
    group: "Alunos e usuários",
    rows: [
      { label: "Alunos ativos", values: ["50", "200", "Ilimitado"] },
      { label: "Instrutores", values: ["2", "10", "Ilimitado"] },
      { label: "Administradores", values: ["1", "3", "Ilimitado"] },
    ],
  },
  {
    group: "Cobrança",
    rows: [
      { label: "PIX e boleto", values: [true, true, true] },
      { label: "Cartão recorrente", values: [false, true, true] },
      { label: "Régua de cobrança", values: [false, true, true] },
      { label: "Conciliação automática", values: [true, true, true] },
    ],
  },
  {
    group: "Operação",
    rows: [
      { label: "Agenda e reservas", values: [true, true, true] },
      { label: "Fichas de treino", values: [true, true, true] },
      { label: "Avaliações físicas", values: [false, true, true] },
      { label: "Multi-unidade", values: [false, false, true] },
    ],
  },
  {
    group: "App white-label",
    rows: [
      { label: "Logo + cores customizadas", values: [true, true, true] },
      { label: "Subdomínio próprio", values: [true, true, true] },
      { label: "Domínio próprio (CNAME)", values: [false, true, true] },
    ],
  },
  {
    group: "Integrações",
    rows: [
      { label: "Asaas (gratuito)", values: [true, true, true] },
      { label: "API REST + Webhooks", values: [false, false, true] },
      { label: "SSO (Google, Microsoft)", values: [false, false, true] },
    ],
  },
  {
    group: "Suporte",
    rows: [
      { label: "Canal", values: ["E-mail", "WhatsApp", "Gerente dedicado"] },
      { label: "SLA de resposta", values: ["48h", "4h úteis", "1h"] },
    ],
  },
];

export default function PricingClient() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const { data: plans } = usePricingPlans();

  return (
    <>
      {/* Hero */}
      <section className="py-20 max-[720px]:py-14">
        <Wrap tight>
          <div className="text-center">
            <Eyebrow>14 dias grátis · Sem cartão</Eyebrow>
            <h1 className="font-display text-[clamp(2.4rem,5vw,4rem)] font-semibold tracking-[-0.03em] leading-[1.05] mt-7">
              Preços <em className="not-italic text-flame">justos</em>. Sem
              letras miúdas.
            </h1>
            <p className="text-[1.1rem] text-ink-500 mt-5 max-w-[40rem] mx-auto">
              Você paga por mês, sem fidelidade, sem taxa por aluno e sem fee
              em cima das transações do Asaas. Mude de plano ou cancele quando
              quiser.
            </p>
            <div className="mt-8 inline-flex items-center gap-1 bg-paper-2 rounded-full p-[6px] border border-line-strong">
              <button
                onClick={() => setBilling("monthly")}
                className={cn(
                  "px-5 py-2 rounded-full text-[0.88rem] font-medium transition-all",
                  billing === "monthly"
                    ? "bg-white text-ink-900 shadow-[var(--shadow-gym-1)]"
                    : "text-ink-500 hover:text-ink-900",
                )}
              >
                Mensal
              </button>
              <button
                onClick={() => setBilling("annual")}
                className={cn(
                  "px-5 py-2 rounded-full text-[0.88rem] font-medium transition-all inline-flex items-center gap-2",
                  billing === "annual"
                    ? "bg-white text-ink-900 shadow-[var(--shadow-gym-1)]"
                    : "text-ink-500 hover:text-ink-900",
                )}
              >
                Anual
                <span className="font-mono text-[0.68rem] text-flame bg-flame-50 px-[0.4rem] py-[2px] rounded-full">
                  −2 meses
                </span>
              </button>
            </div>
          </div>
        </Wrap>
      </section>

      {/* Plans */}
      <section className="pt-4 pb-24 max-[720px]:pb-16">
        <Wrap>
          <div className="grid grid-cols-[1fr_1.1fr_1fr] gap-8 items-stretch max-[980px]:grid-cols-1">
            {plans?.map((plan) => {
              const price =
                billing === "monthly" ? plan.priceMonthly : plan.priceAnnual;
              return (
                <article
                  key={plan.id}
                  className={cn(
                    "rounded-[var(--radius-lg)] p-10 relative flex flex-col",
                    plan.featured
                      ? "bg-ink-900 text-paper border border-ink-900 shadow-[var(--shadow-gym-3)] -translate-y-3"
                      : "bg-white border border-line shadow-[var(--shadow-gym-1)]",
                  )}
                >
                  {plan.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-flame text-white text-[0.7rem] font-mono uppercase tracking-[0.1em] px-3 py-1 rounded-full">
                      {plan.tag}
                    </span>
                  )}
                  <div
                    className={cn(
                      "font-display text-[1.4rem] font-semibold",
                      plan.featured ? "text-paper" : "text-ink-900",
                    )}
                  >
                    {plan.name}
                  </div>
                  <p
                    className={cn(
                      "text-[0.9rem] mt-1",
                      plan.featured ? "text-ink-300" : "text-ink-500",
                    )}
                  >
                    {plan.tagline}
                  </p>
                  <div
                    className={cn(
                      "mt-6 font-display font-semibold leading-none",
                      plan.featured ? "text-paper" : "text-ink-900",
                    )}
                  >
                    <span className="text-[1.2rem] align-top">R$ </span>
                    <span className="text-[clamp(2.8rem,5vw,3.6rem)]">
                      {price}
                    </span>
                    <span
                      className={cn(
                        "text-[0.95rem] font-normal ml-1",
                        plan.featured ? "text-ink-300" : "text-ink-400",
                      )}
                    >
                      /mês
                    </span>
                  </div>
                  {billing === "annual" && (
                    <div
                      className={cn(
                        "font-mono text-[0.72rem] mt-2",
                        plan.featured ? "text-flame" : "text-emerald",
                      )}
                    >
                      Cobrança anual de R$ {price * 12}
                    </div>
                  )}
                  <ul className="mt-8 flex flex-col gap-3 flex-1">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className={cn(
                          "flex items-start gap-2 text-[0.92rem]",
                          plan.featured ? "text-ink-200" : "text-ink-600",
                        )}
                      >
                        <Icon
                          name="check"
                          className={cn(
                            "mt-[3px] shrink-0",
                            plan.featured ? "text-flame" : "text-emerald",
                          )}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.featured ? "flame" : "ink"}
                    block
                    href="/contact"
                    className="mt-10"
                  >
                    {plan.ctaLabel}
                  </Button>
                </article>
              );
            })}
          </div>
        </Wrap>
      </section>

      {/* Comparison table */}
      <section className="py-24 bg-paper-50 border-y border-line max-[720px]:py-16">
        <Wrap>
          <header className="mb-16 max-w-[720px]">
            <SectionEyebrow>Comparativo</SectionEyebrow>
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.03em] leading-[1.05]">
              Tudo o que está em cada plano,
              <br />
              sem surpresas.
            </h2>
          </header>
          <div className="overflow-x-auto bg-white border border-line rounded-[var(--radius-lg)] shadow-[var(--shadow-gym-1)]">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className="px-6 py-5 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink-400 font-medium border-b border-line">
                    Recurso
                  </th>
                  {["Starter", "Business", "Pro"].map((name, i) => (
                    <th
                      key={name}
                      className={cn(
                        "px-6 py-5 font-display text-[0.95rem] font-semibold text-ink-900 border-b border-line text-center min-w-[140px]",
                        i === 1 && "bg-flame-50 text-flame",
                      )}
                    >
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((group) => (
                  <Fragment key={group.group}>
                    <tr>
                      <td
                        colSpan={4}
                        className="bg-paper-50 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-500 font-medium px-6 py-3 border-b border-line"
                      >
                        {group.group}
                      </td>
                    </tr>
                    {group.rows.map((row) => (
                      <tr key={row.label} className="hover:bg-paper-50">
                        <td className="px-6 py-4 text-[0.9rem] text-ink-700 border-b border-line/60">
                          {row.label}
                        </td>
                        {row.values.map((v, i) => (
                          <td
                            key={i}
                            className={cn(
                              "px-6 py-4 text-center text-[0.9rem] border-b border-line/60",
                              i === 1 && "bg-flame-50/40",
                            )}
                          >
                            {typeof v === "boolean" ? (
                              v ? (
                                <Icon
                                  name="check"
                                  className="text-emerald"
                                  size="lg"
                                />
                              ) : (
                                <Icon
                                  name="x"
                                  className="text-ink-300"
                                  size="lg"
                                />
                              )
                            ) : (
                              <span className="text-ink-700">{v}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Wrap>
      </section>

      {/* FAQ */}
      <section className="py-24 max-[720px]:py-16">
        <Wrap tight>
          <header className="mb-12">
            <SectionEyebrow>Dúvidas</SectionEyebrow>
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.03em] leading-[1.05]">
              Antes de você perguntar.
            </h2>
          </header>
          <div className="flex flex-col divide-y divide-line border-y border-line">
            {FAQ.map((item) => (
              <details key={item.q} className="group py-6">
                <summary className="flex items-center justify-between gap-4 list-none font-display text-[1.08rem] font-semibold text-ink-900 cursor-pointer">
                  {item.q}
                  <span className="text-ink-400 group-open:rotate-45 transition-transform duration-200">
                    <Icon name="plus" size="lg" />
                  </span>
                </summary>
                <p className="text-[0.95rem] text-ink-500 mt-4 leading-[1.6]">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </Wrap>
      </section>
    </>
  );
}
