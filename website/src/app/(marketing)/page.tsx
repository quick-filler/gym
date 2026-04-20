import type { Metadata } from "next";
import { Wrap } from "@/components/marketing/Wrap";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow, SectionEyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import {
  JsonLd,
  faqSchema,
  organizationSchema,
  pageMetadata,
  softwareApplicationSchema,
} from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Gym — Sistema de gestão para academias modernas",
  description:
    "Gestão completa para academias brasileiras: matrículas, cobranças via PIX e boleto, agenda de aulas, fichas de treino e app white-label com a identidade visual da sua academia.",
  path: "/",
});

const FAQ = [
  {
    question: "Posso cancelar quando quiser?",
    answer:
      "Sim, sem fidelidade e sem multa. Cancelou hoje, a cobrança para no próximo ciclo. Você ainda pode exportar todos os dados antes de sair.",
  },
  {
    question: "Como funciona o app white-label?",
    answer:
      "Você sobe a logo, escolhe duas cores, e a gente gera um subdomínio (ex: suaacademia.gym.app). Os alunos acessam por esse endereço — eles veem a sua marca, não a nossa. Sem precisar publicar nada nas lojas.",
  },
  {
    question: "Quanto custa a integração com o Asaas?",
    answer:
      "Zero. A integração é gratuita do nosso lado. Você só paga as taxas normais do Asaas (1,99% no PIX, R$ 1,99 no boleto). O Gym não cobra fee adicional por transação.",
  },
  {
    question: "E os meus dados? Onde ficam?",
    answer:
      "Bancos de dados PostgreSQL no Brasil (Hetzner / São Paulo). Cada academia tem isolamento total — você não consegue acessar dados de outra academia, nem por engano. LGPD-friendly por design.",
  },
  {
    question: "Vocês importam meus alunos do sistema atual?",
    answer:
      "Importação por CSV é nativa. Se você usa Tecnofit, MFit, Pacto Solutions ou similares, a gente já fez essa migração antes — mande um e-mail e a gente te ajuda.",
  },
  {
    question: "Tem app na App Store / Play Store?",
    answer:
      "O app do aluno é mobile-first, abre no navegador como um PWA (instala no celular como um app). Versões nativas iOS/Android estão no plano para o segundo semestre.",
  },
];

export default function LandingPage() {
  return (
    <>
      <JsonLd data={organizationSchema} />
      <JsonLd data={softwareApplicationSchema} />
      <JsonLd data={faqSchema(FAQ)} />

      <Hero />
      <SegmentHighlights />
      <Trust />
      <Features />
      <HowItWorks />
      <Segments />
      <PricingPreview />
      <Testimonials />
      <Faq items={FAQ} />
      <CtaBanner />
    </>
  );
}

/* ============================================================
   Hero
   ============================================================ */

function Hero() {
  return (
    <section className="py-20 max-[720px]:py-14">
      <Wrap>
        <div className="grid grid-cols-[1.15fr_0.85fr] gap-20 items-center max-[980px]:grid-cols-1 max-[980px]:gap-12">
          <div>
            <Eyebrow>Beta aberto · Vagas limitadas</Eyebrow>
            <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold tracking-[-0.03em] leading-[1.02] mt-6 text-ink-900">
              A gestão do seu negócio,{" "}
              <em className="font-display not-italic text-flame">
                do seu jeito
              </em>
              .
            </h1>
            <p className="text-[1.15rem] text-ink-500 mt-6 max-w-[32rem] leading-[1.6]">
              Matrículas, cobranças automáticas via PIX e boleto, agenda de
              aulas e fichas de treino. Tudo dentro de um app{" "}
              <strong className="text-ink-900 font-medium">
                com a logo e as cores da sua academia
              </strong>{" "}
              — para o aluno ver só você.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Button variant="ink" href="/contact">
                Começar grátis · 14 dias
                <Icon name="arrow-right" />
              </Button>
              <Button variant="line" href="/features">
                Ver como funciona
              </Button>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 mt-8 text-[0.88rem] text-ink-500">
              <span className="inline-flex items-center gap-2">
                <Icon name="check" className="text-emerald" />
                Sem cartão de crédito
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon name="check" className="text-emerald" />
                Configuração em 5 minutos
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon name="check" className="text-emerald" />
                Suporte em português
              </span>
            </div>
          </div>
          <HeroVisual />
        </div>
        <div className="mt-10 mx-auto max-w-[860px] text-center bg-sky-50 border border-sky-100 rounded-2xl px-5 py-4 text-ink-700 text-[0.98rem] leading-[1.7]">
          Todos os planos incluem o mesmo sistema completo.
          <br />
          Você não paga por funcionalidade, e sim pelo tamanho da sua operação.
        </div>
      </Wrap>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative h-[480px] max-[980px]:h-[420px]" aria-hidden="true">
      {/* Metric card — top right */}
      <Card className="absolute top-0 right-0 w-[76%] p-7 z-[2]">
        <div className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink-400 mb-2">
          Receita do mês
        </div>
        <div className="font-display text-[2.6rem] font-semibold text-ink-900 leading-none">
          R$ 18.420
        </div>
        <div className="mt-2 text-[0.82rem] text-flame font-semibold inline-flex items-center gap-1">
          <Icon name="trending" /> +8,2% vs mês anterior
        </div>
        <svg
          className="mt-5 w-full h-[60px]"
          viewBox="0 0 300 70"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="lg-spark" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                stopColor="var(--color-flame)"
                stopOpacity="0.22"
              />
              <stop
                offset="100%"
                stopColor="var(--color-flame)"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>
          <path
            d="M0,55 L40,48 L80,40 L120,45 L160,30 L200,25 L240,18 L300,12 L300,70 L0,70 Z"
            fill="url(#lg-spark)"
          />
          <path
            d="M0,55 L40,48 L80,40 L120,45 L160,30 L200,25 L240,18 L300,12"
            fill="none"
            stroke="var(--color-flame)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="300" cy="12" r="4" fill="var(--color-flame)" />
        </svg>
      </Card>

      {/* Phone preview — top-left, overlaps below metric card */}
      <div className="absolute top-[60px] left-0 w-[60%] rounded-[32px] overflow-hidden bg-ink-900 border border-ink-700 shadow-[var(--shadow-gym-3)] z-[1]">
        <div className="bg-flame text-white px-5 py-5">
          <div className="font-mono text-[0.7rem] uppercase tracking-[0.1em] opacity-80 font-medium">
            Próxima aula
          </div>
          <div className="font-display text-[1.4rem] font-semibold mt-1 tracking-[-0.02em]">
            Hoje, 18:00
          </div>
        </div>
        <div className="bg-white px-5 py-3">
          {[
            { num: "1", name: "Supino reto", meta: "4×12 · 60kg" },
            { num: "2", name: "Crucifixo", meta: "3×15 · 16kg" },
            { num: "3", name: "Tríceps corda", meta: "4×12 · 25kg" },
          ].map((row, i) => (
            <div
              key={row.num}
              className={`flex items-center gap-3 py-2.5 text-[0.85rem] ${i < 2 ? "border-b border-paper-3" : ""}`}
            >
              <span className="w-[22px] h-[22px] rounded-md bg-flame-50 text-flame font-mono text-[0.68rem] font-semibold flex items-center justify-center shrink-0">
                {row.num}
              </span>
              <span className="flex-1 text-ink-700 font-semibold">
                {row.name}
              </span>
              <span className="font-mono text-[0.7rem] text-ink-400">
                {row.meta}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating note — bottom right */}
      <div className="absolute right-[8%] bottom-[20px] bg-white border border-line rounded-2xl shadow-[var(--shadow-gym-2)] px-4 py-3 flex items-center gap-3 z-[3] max-w-[220px] max-[980px]:right-2">
        <span className="w-2 h-2 rounded-full bg-emerald ring-4 ring-emerald/20 animate-gym-pulse shrink-0" />
        <div>
          <div className="text-[0.82rem] font-semibold text-ink-900">
            Mariana check-in
          </div>
          <div className="text-[0.72rem] text-ink-400">Há 30 segundos</div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Segment highlights — segment-specific value props
   ============================================================ */

function SegmentHighlights() {
  const items = [
    {
      emoji: "🏊",
      title: "Para escolas de natação",
      desc: "Controle da piscina com registro de cloro, pH, temperatura, ocupação e histórico das medições.",
    },
    {
      emoji: "🏢",
      title: "Para pilates e studios",
      desc: "Controle de salas, estúdios, recursos físicos e bloqueio de conflitos na agenda por espaço.",
    },
    {
      emoji: "📚",
      title: "Para operações com acompanhamento",
      desc: "Evolução do aluno, reposições, documentos e comunicação organizados em um único sistema.",
    },
  ];
  return (
    <section className="py-20 max-[720px]:py-14">
      <Wrap>
        <header className="mb-12 max-w-[720px]">
          <SectionEyebrow>Recursos por segmento</SectionEyebrow>
          <h2 className="font-display text-[clamp(1.8rem,3.6vw,2.6rem)] font-semibold tracking-[-0.03em] leading-[1.1]">
            Recursos pensados para cada tipo de operação
          </h2>
          <p className="text-[1.05rem] text-ink-500 mt-5 max-w-[38rem]">
            Além da base de gestão, o sistema se adapta ao seu segmento com
            recursos específicos para o dia a dia.
          </p>
        </header>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          {items.map((item) => (
            <Card key={item.title} className="p-7">
              <div className="text-[2.25rem] mb-4 leading-none">
                {item.emoji}
              </div>
              <h3 className="font-display text-[1.2rem] font-semibold text-ink-900 mb-2">
                {item.title}
              </h3>
              <p className="text-[0.95rem] text-ink-500 leading-[1.6]">
                {item.desc}
              </p>
            </Card>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

/* ============================================================
   Trust bar
   ============================================================ */

function Trust() {
  const logos = [
    "Gym",
    "FitHaus",
    "Studio Vida",
    "Academia Norte",
    "PowerLab",
    "Movimento+",
  ];
  return (
    <section className="py-10 border-y border-line bg-paper-50">
      <Wrap>
        <div className="grid grid-cols-[auto_1fr] gap-12 items-center max-[880px]:grid-cols-1 max-[880px]:gap-6 max-[880px]:text-center">
          <div className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-ink-400 max-w-[14rem]">
            Mais de 240 academias brasileiras já migraram
          </div>
          <div className="flex flex-wrap items-center justify-between gap-8 max-[880px]:justify-center">
            {logos.map((logo) => (
              <span
                key={logo}
                className="font-display text-[1.2rem] font-bold text-ink-300 tracking-[-0.02em]"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </Wrap>
    </section>
  );
}

/* ============================================================
   Features (bento grid)
   ============================================================ */

function Features() {
  return (
    <section id="features" className="py-24 max-[720px]:py-16">
      <Wrap>
        <header className="mb-16 max-w-[720px]">
          <SectionEyebrow>Recursos</SectionEyebrow>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.03em] leading-[1.05]">
            Tudo que sua academia precisa,
            <br />e nada que ela não use.
          </h2>
          <p className="text-[1.1rem] text-ink-500 mt-5 max-w-[38rem]">
            A gente já ouviu &ldquo;tem que ter relatório de inadimplência por
            instrutor&rdquo; — e tem. Mas começa simples, cresce com você, e
            nunca fica cheio de coisa que ninguém abre.
          </p>
        </header>

        <div className="grid grid-cols-6 gap-5 max-[880px]:grid-cols-2 max-[880px]:gap-4">
          {/* Big finance cell */}
          <Card className="col-span-4 max-[880px]:col-span-2 flex flex-col gap-6">
            <div>
              <div className="w-12 h-12 rounded-xl bg-paper-2 flex items-center justify-center text-ink-900 text-[1.4rem] mb-4">
                <Icon name="money" size="lg" />
              </div>
              <h3 className="font-display text-[1.5rem] font-semibold text-ink-900 leading-tight">
                Cobrança recorrente que funciona sozinha
              </h3>
              <p className="text-[0.98rem] text-ink-500 mt-3 max-w-[32rem] leading-[1.6]">
                Integração nativa com Asaas: PIX, boleto e cartão. O sistema
                cobra, reenvia, acompanha e atualiza o status do aluno
                automaticamente.
              </p>
            </div>
            <div className="bg-paper-50 border border-line rounded-2xl p-4 flex flex-col gap-[2px]">
              {[
                {
                  name: "João Silva — Mensal",
                  pill: { tone: "emerald" as const, text: "PAGO 03/04" },
                },
                {
                  name: "Ana Costa — Trimestral",
                  pill: { tone: "emerald" as const, text: "PAGO 01/04" },
                },
                {
                  name: "Carlos Souza — Mensal",
                  pill: { tone: "amber" as const, text: "PENDENTE 10/04" },
                },
                {
                  name: "Mariana Lopes — Anual",
                  pill: { tone: "rose" as const, text: "VENCIDO 28/03" },
                },
              ].map((row) => (
                <div
                  key={row.name}
                  className="flex items-center justify-between py-3 px-3 border-b border-line last:border-b-0 text-[0.88rem]"
                >
                  <span className="text-ink-700">{row.name}</span>
                  <Pill tone={row.pill.tone}>{row.pill.text}</Pill>
                </div>
              ))}
            </div>
          </Card>

          {/* White-label flame cell */}
          <Card className="col-span-2 max-[880px]:col-span-2 bg-ink-900 text-paper border-ink-700 flex flex-col gap-6">
            <div>
              <div className="w-12 h-12 rounded-xl bg-flame/15 text-flame flex items-center justify-center mb-4">
                <Icon name="phone" size="lg" />
              </div>
              <h3 className="font-display text-[1.35rem] font-semibold text-paper leading-tight">
                App white-label com sua marca
              </h3>
              <p className="text-[0.92rem] text-ink-300 mt-3 leading-[1.55]">
                A logo, as cores e o subdomínio da sua academia. O aluno baixa o
                seu app — não o nosso.
              </p>
            </div>
            <div className="mt-auto rounded-2xl bg-gradient-to-br from-flame/20 to-flame/5 border border-flame/30 p-5">
              <div className="font-display text-[1.15rem] font-semibold text-paper">
                CrossFit SP
              </div>
              <div className="font-mono text-[0.78rem] text-flame mt-1">
                crossfit-sp.gym.app
              </div>
            </div>
          </Card>

          {/* Wide rows */}
          <FeatureCell
            icon="calendar"
            title="Agenda + reservas"
            desc="Grade semanal por turma. O aluno reserva pelo app, você acompanha presença em tempo real."
            span={3}
          />
          <FeatureCell
            icon="dumbbell"
            title="Fichas de treino"
            desc="Crie treinos personalizados. O aluno acessa direto no celular, sem PDF, sem WhatsApp."
            span={3}
          />

          <FeatureCell
            icon="chart"
            title="Financeiro, documentos e controle operacional"
            desc="Frequência, retenção, MRR."
            span={2}
            iconTone="flame"
          />
          <FeatureCell
            icon="users"
            title="Avaliações físicas"
            desc="Histórico completo, comparativos."
            span={2}
            iconTone="pine"
          />
          <FeatureCell
            icon="shield"
            title="LGPD-friendly"
            desc="Dados isolados por academia."
            span={2}
          />
        </div>
      </Wrap>
    </section>
  );
}

function FeatureCell({
  icon,
  title,
  desc,
  span,
  iconTone = "ink",
}: {
  icon: "calendar" | "dumbbell" | "chart" | "users" | "shield";
  title: string;
  desc: string;
  span: 2 | 3;
  iconTone?: "ink" | "flame" | "pine";
}) {
  const spanCls =
    span === 3 ? "col-span-3 max-[880px]:col-span-2" : "col-span-2 max-[880px]:col-span-2";
  const toneCls = {
    ink: "bg-paper-2 text-ink-900",
    flame: "bg-flame-50 text-flame",
    pine: "bg-pine-50 text-pine",
  }[iconTone];
  return (
    <Card className={spanCls}>
      <div
        className={`w-12 h-12 rounded-xl ${toneCls} flex items-center justify-center mb-4`}
      >
        <Icon name={icon} size="lg" />
      </div>
      <h3 className="font-display text-[1.2rem] font-semibold text-ink-900">
        {title}
      </h3>
      <p className="text-[0.92rem] text-ink-500 mt-2 leading-[1.55]">{desc}</p>
    </Card>
  );
}

/* ============================================================
   How it works
   ============================================================ */

function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Personalize sua marca",
      desc: "Suba a logo, escolha as duas cores principais, defina o subdomínio. A partir daí, o app já é seu.",
    },
    {
      num: "02",
      title: "Cadastre planos e turmas",
      desc: "Mensal, trimestral, anual, plano família. Crie a grade de aulas com instrutores e capacidade.",
    },
    {
      num: "03",
      title: "Importe seus alunos",
      desc: "CSV ou cadastro manual. Cada aluno recebe um convite por e-mail e WhatsApp para baixar o app.",
    },
    {
      num: "04",
      title: "Comece a cobrar",
      desc: "O Asaas gera as cobranças, você acompanha pelo painel. PIX cai em segundos, boleto compensa em dias.",
    },
  ];
  return (
    <section className="py-24 bg-paper-50 border-y border-line max-[720px]:py-16">
      <Wrap>
        <header className="mb-16 max-w-[720px]">
          <SectionEyebrow>Como funciona</SectionEyebrow>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.03em] leading-[1.05]">
            Do cadastro à primeira cobrança
            <br />
            em uma tarde.
          </h2>
        </header>
        <div className="grid grid-cols-[1.2fr_0.8fr] gap-16 max-[980px]:grid-cols-1 max-[980px]:gap-10">
          <ol className="flex flex-col gap-8">
            {steps.map((step) => (
              <li key={step.num} className="grid grid-cols-[auto_1fr] gap-6">
                <div className="font-display text-[2.6rem] font-bold text-flame leading-none">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-display text-[1.25rem] font-semibold text-ink-900">
                    {step.title}
                  </h3>
                  <p className="text-[0.95rem] text-ink-500 mt-2 leading-[1.6]">
                    {step.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <aside className="rounded-[var(--radius-lg)] bg-ink-900 text-paper p-8 flex flex-col justify-center">
            <h4 className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-300 mb-3">
              Tempo médio
            </h4>
            <div className="font-display text-[4.2rem] font-semibold text-paper leading-none">
              <span className="text-flame">04</span>h12m
            </div>
            <p className="text-[0.92rem] text-ink-300 mt-4 leading-[1.6]">
              É o tempo que uma academia média leva entre criar a conta e ter o
              primeiro aluno cobrado pelo sistema. Sem treinamento, sem
              consultor.
            </p>
          </aside>
        </div>
      </Wrap>
    </section>
  );
}

/* ============================================================
   Segments — multi-segment positioning
   ============================================================ */

function Segments() {
  const items = [
    {
      emoji: "🏋️",
      title: "Academia",
      desc: "Agenda, presença, financeiro, treinos e gestão de alunos em um só lugar.",
    },
    {
      emoji: "🏊",
      title: "Escola de Natação",
      desc: "Dependentes, documentos, presença confirmada, piscina e reposição de aula.",
    },
    {
      emoji: "🧘",
      title: "Pilates",
      desc: "Agenda por turma, controle de recursos, documentos e acompanhamento do aluno.",
    },
    {
      emoji: "🩰",
      title: "Ballet",
      desc: "Dependentes, evolução pedagógica, calendário e gestão de aulas e responsáveis.",
    },
    {
      emoji: "🏢",
      title: "Studios",
      desc: "Uma operação mais enxuta, organizada e rápida para negócios de diferentes formatos.",
    },
  ];
  return (
    <section className="py-24 bg-paper-2 max-[720px]:py-16">
      <Wrap>
        <header className="mb-12 max-w-[720px]">
          <SectionEyebrow>Segmentos</SectionEyebrow>
          <h2 className="font-display text-[clamp(1.8rem,3.6vw,2.6rem)] font-semibold tracking-[-0.03em] leading-[1.1]">
            Feito para diferentes tipos de operação
          </h2>
          <p className="text-[1.05rem] text-ink-500 mt-5 max-w-[38rem]">
            A mesma base de gestão se adapta para academias, escolas de natação,
            pilates, ballet e studios.
          </p>
        </header>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          {items.map((item) => (
            <Card key={item.title} className="p-7">
              <div className="text-[2.25rem] mb-4 leading-none">
                {item.emoji}
              </div>
              <h3 className="font-display text-[1.2rem] font-semibold text-ink-900 mb-2">
                {item.title}
              </h3>
              <p className="text-[0.95rem] text-ink-500 leading-[1.6]">
                {item.desc}
              </p>
            </Card>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

/* ============================================================
   Pricing preview
   ============================================================ */

function PricingPreview() {
  const plans = [
    {
      name: "Básico",
      capacity: "Até 80 alunos",
      price: "167",
      desc: "Ideal para operações menores que querem organizar a gestão com rapidez.",
      featured: false,
    },
    {
      name: "Intermediário",
      capacity: "Até 250 alunos",
      price: "347",
      desc: "Para negócios em crescimento que precisam de mais capacidade sem trocar de sistema.",
      featured: true,
    },
    {
      name: "Premium",
      capacity: "Até 700 alunos",
      price: "697",
      desc: "Para operações maiores que precisam de escala, controle e continuidade.",
      featured: false,
    },
  ];
  return (
    <section id="pricing" className="py-24 max-[720px]:py-16">
      <Wrap>
        <header className="mb-12 max-w-[720px]">
          <SectionEyebrow>Preços</SectionEyebrow>
          <h2 className="font-display text-[clamp(1.8rem,3.6vw,2.6rem)] font-semibold tracking-[-0.03em] leading-[1.1]">
            Planos simples, definidos pelo número de alunos
          </h2>
          <p className="text-[1.05rem] text-ink-500 mt-5 max-w-[42rem]">
            Todos os planos usam o mesmo sistema completo. A diferença está
            apenas na quantidade de alunos da operação.
          </p>
        </header>
        <div className="grid grid-cols-[1fr_1.1fr_1fr] gap-8 items-stretch max-[980px]:grid-cols-1">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={
                plan.featured
                  ? "relative rounded-[var(--radius-lg)] bg-ink-900 text-paper border border-ink-700 p-10 shadow-[var(--shadow-gym-3)] md:scale-[1.02] flex flex-col"
                  : "rounded-[var(--radius-lg)] bg-white border border-line p-10 shadow-[var(--shadow-gym-1)] flex flex-col"
              }
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-flame text-white text-[0.7rem] font-mono uppercase tracking-[0.1em] px-3 py-1 rounded-full">
                  Mais escolhido
                </span>
              )}
              <div
                className={`font-display text-[1.4rem] font-semibold ${plan.featured ? "text-paper" : "text-ink-900"}`}
              >
                {plan.name}
              </div>
              <p
                className={`text-[0.9rem] mt-1 ${plan.featured ? "text-ink-300" : "text-ink-500"}`}
              >
                {plan.capacity}
              </p>
              <div
                className={`mt-6 font-display font-semibold leading-none ${plan.featured ? "text-paper" : "text-ink-900"}`}
              >
                <span className="text-[1.2rem] align-top">R$ </span>
                <span className="text-[clamp(2.8rem,5vw,3.6rem)]">
                  {plan.price}
                </span>
                <span
                  className={`text-[0.95rem] font-normal ml-1 ${plan.featured ? "text-ink-300" : "text-ink-400"}`}
                >
                  /mês
                </span>
              </div>
              <p
                className={`text-[0.95rem] mt-6 leading-[1.7] ${plan.featured ? "text-ink-300" : "text-ink-500"}`}
              >
                {plan.desc}
              </p>
              <Button
                variant={plan.featured ? "flame" : "ink"}
                block
                href="/contact"
                className="mt-auto pt-0"
              >
                Quero uma demonstração
              </Button>
            </article>
          ))}
        </div>
        <div className="mt-10 mx-auto max-w-[860px] text-center bg-sky-50 border border-sky-100 rounded-2xl px-5 py-4 text-ink-700 text-[0.98rem] leading-[1.7]">
          Todos os planos usam o mesmo sistema completo.
          <br />A diferença está apenas na quantidade de alunos da operação.
        </div>
      </Wrap>
    </section>
  );
}

/* ============================================================
   Testimonials
   ============================================================ */

function Testimonials() {
  return (
    <section className="py-24 bg-paper-2 max-[720px]:py-16">
      <Wrap>
        <header className="mb-16 max-w-[720px]">
          <SectionEyebrow>Quem já usa</SectionEyebrow>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.03em] leading-[1.05]">
            Academias que voltaram a olhar
            <br />
            pros alunos, não pra planilha.
          </h2>
        </header>

        <div className="grid grid-cols-[1.4fr_1fr] gap-8 max-[980px]:grid-cols-1">
          <Card className="relative">
            <div className="absolute top-4 left-6 font-display text-[5rem] leading-none text-flame/30">
              &ldquo;
            </div>
            <p className="font-display text-[1.4rem] font-medium text-ink-900 leading-[1.3] relative z-[1] mt-8 max-[720px]:text-[1.2rem]">
              A gente perdia 3 horas por semana mandando cobrança no zap. Agora
              o sistema faz, o aluno paga, e eu vou treinar. Em 4 meses a
              inadimplência caiu de 18% pra 4,8%.
            </p>
            <div className="flex items-center gap-4 mt-8">
              <div className="w-12 h-12 rounded-full bg-ink-900 text-paper flex items-center justify-center font-mono text-[0.85rem] font-semibold">
                RV
              </div>
              <div>
                <div className="font-semibold text-ink-900">
                  Rafael Vasconcellos
                </div>
                <div className="font-mono text-[0.72rem] text-ink-400 uppercase tracking-[0.06em]">
                  Gym · Vila Mariana
                </div>
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="p-6">
              <p className="text-[0.95rem] text-ink-700 leading-[1.55]">
                &ldquo;Coloquei a logo, escolhi a cor e mandei o link pro grupo
                dos alunos. Acabou. Não precisei explicar nada, ninguém me
                perguntou onde clicar.&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-5">
                <div className="w-10 h-10 rounded-full bg-ink-900 text-paper flex items-center justify-center font-mono text-[0.75rem] font-semibold">
                  BO
                </div>
                <div>
                  <div className="text-[0.92rem] font-semibold text-ink-900">
                    Beatriz Okamoto
                  </div>
                  <div className="font-mono text-[0.68rem] text-ink-400 uppercase tracking-[0.06em]">
                    Studio Vida Pilates
                  </div>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <p className="text-[0.95rem] text-ink-700 leading-[1.55]">
                &ldquo;O gerente da minha unidade nova entrou no painel e em
                dois dias já estava cobrando. Sem treinamento. Esse é o
                detalhe.&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-5">
                <div className="w-10 h-10 rounded-full bg-ink-900 text-paper flex items-center justify-center font-mono text-[0.75rem] font-semibold">
                  DF
                </div>
                <div>
                  <div className="text-[0.92rem] font-semibold text-ink-900">
                    Diego Ferraz
                  </div>
                  <div className="font-mono text-[0.68rem] text-ink-400 uppercase tracking-[0.06em]">
                    PowerLab · 3 unidades
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Wrap>
    </section>
  );
}

/* ============================================================
   FAQ
   ============================================================ */

function Faq({ items }: { items: Array<{ question: string; answer: string }> }) {
  return (
    <section className="py-24 max-[720px]:py-16">
      <Wrap>
        <div className="grid grid-cols-[0.9fr_1.1fr] gap-16 max-[980px]:grid-cols-1 max-[980px]:gap-8">
          <header>
            <SectionEyebrow>Dúvidas</SectionEyebrow>
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.03em] leading-[1.05]">
              Perguntas que
              <br />a gente sempre ouve.
            </h2>
            <p className="text-[1.05rem] text-ink-500 mt-5">
              Não achou o que procurava?{" "}
              <a
                href="/contact"
                className="text-flame font-medium hover:underline"
              >
                Fale com a gente
              </a>
              .
            </p>
          </header>
          <div className="flex flex-col divide-y divide-line border-y border-line">
            {items.map((item) => (
              <details
                key={item.question}
                className="group py-6 cursor-pointer"
              >
                <summary className="flex items-center justify-between gap-4 list-none font-display text-[1.08rem] font-semibold text-ink-900">
                  {item.question}
                  <span className="text-ink-400 group-open:rotate-45 transition-transform duration-200">
                    <Icon name="plus" size="lg" />
                  </span>
                </summary>
                <p className="text-[0.95rem] text-ink-500 mt-4 leading-[1.6]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </Wrap>
    </section>
  );
}

/* ============================================================
   CTA Banner
   ============================================================ */

function CtaBanner() {
  return (
    <section className="py-24 max-[720px]:py-16">
      <Wrap>
        <div className="rounded-[var(--radius-xl)] bg-ink-900 text-paper p-16 text-center relative overflow-hidden max-[720px]:p-10">
          <div className="absolute inset-0 bg-gradient-to-br from-flame/20 via-transparent to-pine/10 pointer-events-none" />
          <h2 className="font-display text-[clamp(2rem,5vw,3.6rem)] font-semibold tracking-[-0.03em] leading-[1.05] relative z-[1]">
            Sua academia merece{" "}
            <em className="not-italic text-flame">uma ferramenta de verdade.</em>
          </h2>
          <p className="text-[1.1rem] text-ink-300 mt-5 relative z-[1]">
            14 dias grátis. Sem cartão. Sem treinamento. Sem letras miúdas.
          </p>
          <div className="mt-8 relative z-[1]">
            <Button variant="flame" href="/contact">
              Criar minha conta
              <Icon name="arrow-right" />
            </Button>
          </div>
        </div>
      </Wrap>
    </section>
  );
}
