import type { Metadata } from "next";
import { Wrap } from "@/components/marketing/Wrap";
import { Button } from "@/components/ui/Button";
import { Eyebrow, SectionEyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { JsonLd, pageMetadata } from "@/lib/seo";
import { SITE_ORIGIN } from "@/lib/config";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "A plataforma — Gym",
  description:
    "O Gym é um software de gestão para academias feito por um time de seis pessoas em São Paulo, todas treinando em academias clientes. White-label desde o primeiro commit.",
  path: "/about",
});

const aboutPageSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "A plataforma Gym",
  url: `${SITE_ORIGIN}/about`,
  mainEntity: {
    "@type": "Organization",
    name: "Gym",
    foundingDate: "2025",
    foundingLocation: "São Paulo, Brasil",
    numberOfEmployees: "6",
  },
};

const STATS = [
  { num: "240+", label: "Academias ativas" },
  { num: "38k", label: "Alunos cadastrados" },
  { num: "R$ 4,8M", label: "Em cobranças/mês" },
  { num: "99,97%", label: "Uptime trimestral" },
];

const VALUES = [
  {
    num: "01",
    title: "Funciona, depois fica bonito.",
    desc: "A gente prefere lançar uma feature feia que resolve um problema do que polir três meses uma feature que ninguém vai usar. Bonito vem na segunda iteração.",
  },
  {
    num: "02",
    title: "O aluno vem antes do dono.",
    desc: "Sim, o dono paga. Mas se o app do aluno trava, o dono perde aluno. Otimizar a experiência do aluno é otimizar o LTV do dono. A ordem importa.",
  },
  {
    num: "03",
    title: "Sem dark patterns. Sem surpresa.",
    desc: "Cancelar é um clique. Os dados são exportáveis a qualquer momento. A gente não tem fidelidade, não esconde botão de cancelamento, não cobra fee surpresa em transação.",
  },
];

const TEAM = [
  { initials: "RV", name: "Rafael Vasconcellos", role: "CO-FUNDADOR · PRODUTO", tone: "flame" },
  { initials: "BO", name: "Beatriz Okamoto", role: "CO-FUNDADORA · ENG", tone: "ink" },
  { initials: "DF", name: "Diego Ferraz", role: "DESIGN", tone: "paper" },
  { initials: "MG", name: "Mariana Guedes", role: "SUCESSO DO CLIENTE", tone: "paper" },
  { initials: "TM", name: "Tiago Maciel", role: "ENG · BACKEND", tone: "paper" },
  { initials: "LH", name: "Letícia Hwang", role: "FINANCEIRO · OPS", tone: "flame" },
] as const;

export default function AboutPage() {
  return (
    <>
      <JsonLd data={aboutPageSchema} />

      {/* Hero */}
      <section className="py-20 max-[720px]:py-14">
        <Wrap>
          <Eyebrow>A plataforma · Desde 2025</Eyebrow>
          <h1 className="font-display text-[clamp(2.8rem,6vw,5rem)] font-semibold tracking-[-0.03em] leading-[1.02] mt-7 max-w-[18ch]">
            Software pra academia,
            <br />
            feito por gente que{" "}
            <em className="not-italic text-flame">treina.</em>
          </h1>
          <p className="text-[1.15rem] text-ink-500 mt-6 max-w-[44rem] leading-[1.6]">
            O Gym começou numa academia de Vila Mariana em São Paulo, com um
            instrutor reclamando da planilha. A gente respondeu uma mensagem no
            Instagram e nunca mais parou de conversar com donos de academia.
          </p>
        </Wrap>

        <Wrap className="mt-16">
          <div className="grid grid-cols-4 border border-line rounded-[var(--radius-lg)] bg-white divide-x divide-line max-[720px]:grid-cols-2 max-[720px]:divide-x-0">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={cn(
                  "p-8 max-[720px]:p-5",
                  i >= 2 && "max-[720px]:border-t max-[720px]:border-line",
                )}
              >
                <div className="font-display text-[clamp(2rem,4vw,3.2rem)] font-semibold text-ink-900 leading-none">
                  {stat.num}
                </div>
                <div className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink-400 mt-3">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </Wrap>
      </section>

      {/* Story */}
      <section className="py-24 max-[720px]:py-16">
        <Wrap>
          <div className="grid grid-cols-[1fr_1.4fr] gap-16 max-[880px]:grid-cols-1 max-[880px]:gap-8">
            <aside className="sticky top-24 self-start max-[880px]:static">
              <SectionEyebrow>Nossa história</SectionEyebrow>
              <h2 className="font-display text-[clamp(1.8rem,3.5vw,2.6rem)] font-semibold tracking-[-0.03em] leading-[1.08]">
                Porque{" "}
                <em className="not-italic text-flame">white-label</em> não é
                detalhe — é o produto.
              </h2>
            </aside>
            <div className="flex flex-col gap-6 text-[1.02rem] text-ink-600 leading-[1.7]">
              <p>
                A primeira versão era literalmente uma planilha turbinada. Daí
                o Rafael, dono da CrossFit SP, falou:{" "}
                <strong className="text-ink-900">
                  &ldquo;o problema não é a planilha, é que o aluno me liga
                  toda hora.&rdquo;
                </strong>{" "}
                A gente passou três meses só falando com aluno. O resultado: o
                app é a primeira coisa, o painel é a segunda.
              </p>
              <p>
                A gente percebeu cedo que a maioria dos sistemas brasileiros
                entregava um &ldquo;app do aluno&rdquo; com a logo deles, não
                da academia. Pra quem tá começando a montar a marca, isso é
                pedir pra dar errado. Por isso o Gym é white-label desde a
                primeira versão — o aluno baixa o app da{" "}
                <strong className="text-ink-900">CrossFit SP</strong>, não do
                Gym. A gente fica invisível.
              </p>
              <blockquote className="border-l-[3px] border-flame pl-6 py-2 my-2 font-display text-[1.3rem] font-medium text-ink-900 leading-[1.4]">
                &ldquo;O dono da academia não quer aparecer no nosso app. Quer
                que o aluno dele se sinta na casa dele. A gente é a
                casa-máquina.&rdquo;
              </blockquote>
              <p>
                Hoje somos seis pessoas em São Paulo, todo mundo treinando em
                alguma das academias clientes (a gente revesa). A roadmap
                pública é discutida em um grupo de WhatsApp com os donos. As
                próximas três features sempre vêm de lá — não de uma reunião
                nossa.
              </p>
              <p>
                Não temos rodada de investimento. Não temos pressa de virar
                unicórnio. Temos pressa de fazer o aluno do Carlos Souza
                encontrar a próxima aula sem ter que ligar pra recepção.
              </p>
            </div>
          </div>
        </Wrap>
      </section>

      {/* Values */}
      <section
        id="valores"
        className="py-24 bg-paper-50 border-y border-line max-[720px]:py-16"
      >
        <Wrap>
          <header className="mb-16 max-w-[720px]">
            <SectionEyebrow>Princípios</SectionEyebrow>
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.03em] leading-[1.05]">
              Como a gente decide
              <br />o que vai (e o que não vai).
            </h2>
          </header>
          <div className="grid grid-cols-3 gap-8 max-[880px]:grid-cols-1">
            {VALUES.map((v) => (
              <article
                key={v.num}
                className="bg-white border border-line rounded-[var(--radius-lg)] p-8"
              >
                <div className="font-display text-[2.8rem] font-bold text-flame leading-none">
                  {v.num}
                </div>
                <h3 className="font-display text-[1.25rem] font-semibold text-ink-900 mt-6">
                  {v.title}
                </h3>
                <p className="text-[0.95rem] text-ink-500 mt-3 leading-[1.6]">
                  {v.desc}
                </p>
              </article>
            ))}
          </div>
        </Wrap>
      </section>

      {/* Team */}
      <section id="time" className="py-24 max-[720px]:py-16">
        <Wrap>
          <header className="mb-16 max-w-[720px]">
            <SectionEyebrow>Time</SectionEyebrow>
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.03em] leading-[1.05]">
              Quem tá por trás disso.
            </h2>
            <p className="text-[1.1rem] text-ink-500 mt-5 max-w-[38rem]">
              Seis pessoas, todas em São Paulo, todas treinando em academias
              clientes. A gente conhece de perto o que constrói.
            </p>
          </header>
          <div className="grid grid-cols-4 gap-8 max-[880px]:grid-cols-2 max-[720px]:gap-5">
            {TEAM.map((member) => {
              const avatarCls =
                member.tone === "flame"
                  ? "bg-gradient-to-br from-flame to-flame-dark text-white"
                  : member.tone === "ink"
                    ? "bg-ink-900 text-paper"
                    : "bg-paper-2 text-ink-700 border border-line-strong";
              return (
                <div key={member.name} className="text-center">
                  <div
                    className={cn(
                      "w-24 h-24 rounded-full mx-auto flex items-center justify-center font-mono text-[1.1rem] font-semibold",
                      avatarCls,
                    )}
                  >
                    {member.initials}
                  </div>
                  <div className="font-display font-semibold text-[1.02rem] text-ink-900 mt-5">
                    {member.name}
                  </div>
                  <div className="font-mono text-[0.68rem] uppercase tracking-[0.08em] text-ink-400 mt-1">
                    {member.role}
                  </div>
                </div>
              );
            })}
          </div>
        </Wrap>
      </section>

      {/* CTA */}
      <section className="py-8 pb-24">
        <Wrap>
          <div className="rounded-[var(--radius-xl)] bg-ink-900 text-paper py-20 px-12 text-center relative overflow-hidden max-[720px]:py-14 max-[720px]:px-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(232,85,28,0.18)_0%,transparent_60%)] pointer-events-none" />
            <h2 className="font-display text-[clamp(2rem,4.5vw,3.4rem)] text-paper font-semibold tracking-[-0.03em] leading-[1.05] max-w-[18ch] mx-auto relative">
              Quer conversar com a gente?
            </h2>
            <p className="text-[1.05rem] text-paper/60 mt-6 mb-10 max-w-[32rem] mx-auto relative">
              Bate um papo de 20 minutos, sem compromisso. A gente entende a
              sua academia e te mostra se faz sentido — sem pitch, sem
              vendedor.
            </p>
            <div className="relative">
              <Button variant="flame" href="/contact">
                Marcar conversa
                <Icon name="arrow-right" />
              </Button>
            </div>
          </div>
        </Wrap>
      </section>
    </>
  );
}
