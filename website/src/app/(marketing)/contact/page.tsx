import type { Metadata } from "next";
import { Wrap } from "@/components/marketing/Wrap";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon, type IconName } from "@/components/ui/Icon";
import { JsonLd, pageMetadata } from "@/lib/seo";
import { SITE_ORIGIN } from "@/lib/config";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = pageMetadata({
  title: "Teste grátis — Comece em 2 minutos",
  description:
    "14 dias com acesso completo, sem cartão de crédito e sem fidelidade. Crie sua conta agora e teste a Gym com seus alunos reais.",
  path: "/contact",
});

// Mantido como ContactPage por compatibilidade com o sitemap/SEO atual.
// A page virou de fato um signup de trial — sem canais de atendimento.
const contactPageSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Teste grátis — Gym",
  url: `${SITE_ORIGIN}/contact`,
};

type Benefit = {
  icon: IconName;
  title: string;
  detail: string;
};

const BENEFITS: Benefit[] = [
  {
    icon: "calendar",
    title: "14 dias completos",
    detail:
      "Acesso total à plataforma. Tudo destravado, sem limite de alunos e sem feature escondida.",
  },
  {
    icon: "credit",
    title: "Sem cartão de crédito",
    detail:
      "Crie a conta só com e-mail. Não pedimos cartão nem cadastro de pagamento pra liberar o trial.",
  },
  {
    icon: "shield",
    title: "Sem cobrança automática",
    detail:
      "Quando os 14 dias acabam, nada é cobrado. Você escolhe se continua ou não — sem letra miúda.",
  },
  {
    icon: "zap",
    title: "Pronto em 2 minutos",
    detail:
      "A gente cria a conta, manda o acesso por e-mail e você já entra com seus alunos importados.",
  },
];

const STEPS: { n: string; label: string }[] = [
  { n: "1", label: "Você preenche o formulário ao lado" },
  { n: "2", label: "A gente cria sua conta e manda o acesso por e-mail" },
  { n: "3", label: "Você importa seus alunos e usa por 14 dias" },
];

export default function ContactPage() {
  return (
    <>
      <JsonLd data={contactPageSchema} />
      <section className="py-20 max-[720px]:py-12">
        <Wrap>
          <div className="grid grid-cols-[0.95fr_1.05fr] gap-16 max-[880px]:grid-cols-1 max-[880px]:gap-10 items-start">
            {/* Pitch — vira primeiro no mobile pra contextualizar antes do form */}
            <aside className="max-[880px]:order-1">
              <Eyebrow>Teste grátis</Eyebrow>
              <h1 className="font-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold tracking-[-0.03em] leading-[1.05] mt-6">
                Comece grátis.
                <br />
                <em className="not-italic text-flame">14 dias.</em>{" "}
                <span className="text-ink-500 font-medium">Sem cartão.</span>
              </h1>
              <p className="text-[1.05rem] text-ink-500 mt-5 leading-[1.6] max-w-[30rem]">
                Você cria a conta, importa seus alunos e usa a Gym com a sua
                operação real. Se gostar, escolhe um plano; se não, é só sair.
                Nada cobrado, nada amarrado.
              </p>

              <ul
                className="mt-10 flex flex-col gap-3"
                aria-label="Benefícios do teste grátis"
              >
                {BENEFITS.map((b) => (
                  <li
                    key={b.title}
                    className="flex items-start gap-4 p-4 rounded-2xl border border-line bg-white"
                  >
                    <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-flame-50 text-flame">
                      <Icon name={b.icon} size="lg" />
                    </span>
                    <div>
                      <div className="font-semibold text-[0.98rem] text-ink-900">
                        {b.title}
                      </div>
                      <div className="text-[0.86rem] text-ink-500 mt-[2px] leading-[1.5]">
                        {b.detail}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-10 p-5 rounded-2xl bg-ink-900 text-paper">
                <div className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-flame mb-3">
                  Como funciona
                </div>
                <ol className="flex flex-col gap-3">
                  {STEPS.map((s) => (
                    <li key={s.n} className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-flame text-white font-mono text-[0.78rem] font-semibold flex items-center justify-center shrink-0">
                        {s.n}
                      </span>
                      <span className="text-[0.92rem] text-paper/90 leading-[1.4]">
                        {s.label}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>

            {/* Formulário de signup */}
            <section
              className="bg-white border border-line rounded-[var(--radius-lg)] p-10 shadow-[var(--shadow-gym-2)] max-[720px]:p-6 max-[880px]:order-2 sticky top-24 max-[880px]:static"
              aria-labelledby="form-title"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-flame-50 text-flame font-mono text-[0.7rem] uppercase tracking-[0.1em] mb-4">
                <Icon name="spark" />
                14 dias grátis · Sem cartão
              </div>
              <h2
                id="form-title"
                className="font-display text-[1.7rem] font-semibold leading-[1.15]"
              >
                Criar sua conta gratuita
              </h2>
              <p className="text-[0.95rem] text-ink-500 mt-2 mb-8">
                Preencha em menos de 2 minutos. A gente cuida do resto e te
                manda o acesso por e-mail.
              </p>
              <ContactForm />
            </section>
          </div>
        </Wrap>
      </section>
    </>
  );
}
