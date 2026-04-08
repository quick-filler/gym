import type { Metadata } from "next";
import { Wrap } from "@/components/marketing/Wrap";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Recursos — da matrícula ao relatório",
  description:
    "Cobrança via PIX, boleto e cartão com integração Asaas, agenda de aulas com reservas pelo app, fichas de treino digitais, app white-label e relatórios que respondem perguntas de verdade.",
  path: "/features",
});

const FEATURES = [
  {
    num: "01 — Financeiro",
    title: (
      <>
        Cobrança que <em className="not-italic text-flame">roda sozinha</em>
      </>
    ),
    description:
      "Integração nativa com Asaas. PIX, boleto, cartão recorrente. O sistema cria, envia, cobra atrasados e atualiza o status do aluno automaticamente. Você só olha o painel.",
    bullets: [
      "PIX, boleto e cartão de crédito",
      "Régua de cobrança automática",
      "Conciliação automática via webhook",
      "Recibos enviados por e-mail e WhatsApp",
      "Sem taxa em cima das transações",
    ],
    reverse: false,
  },
  {
    num: "02 — Operação",
    title: (
      <>
        Agenda + reservas
        <br />
        <em className="not-italic text-flame">numa interface só</em>
      </>
    ),
    description:
      "Crie a grade semanal por turma, defina capacidade, e deixe os alunos reservarem direto pelo app. Você acompanha presença em tempo real e evita salas lotadas.",
    bullets: [
      "Grade semanal por instrutor e sala",
      "Reserva pelo app do aluno",
      "Check-in via QR Code ou manual",
      "Lista de espera automática",
      "Notificações push 1h antes da aula",
    ],
    reverse: true,
  },
  {
    num: "03 — Treinos",
    title: (
      <>
        Fichas de treino
        <br />
        <em className="not-italic text-flame">sem PDF, sem WhatsApp</em>
      </>
    ),
    description:
      "Crie treinos personalizados pro aluno direto no painel. Ele acessa pelo app, marca os exercícios feitos, vê o histórico. O instrutor atualiza, o aluno recebe na hora.",
    bullets: [
      "Editor de fichas com biblioteca de exercícios",
      "Vídeos demonstrativos por exercício",
      "Histórico de carga e progresso",
      "Atualização sem precisar reenviar",
    ],
    reverse: false,
  },
  {
    num: "04 — Marca",
    title: (
      <>
        App white-label.
        <br />
        <em className="not-italic text-flame">Seu, não nosso.</em>
      </>
    ),
    description:
      "O aluno baixa o app da sua academia, com a sua logo, as suas cores, o seu subdomínio. A gente fica invisível. Para ele, é só 'o app da CrossFit SP' — e essa é exatamente a ideia.",
    bullets: [
      "Logo + duas cores principais",
      "Subdomínio próprio (suaacademia.gym.app)",
      "Domínio próprio via CNAME (Business)",
      "PWA instalável (sem ir pra loja)",
    ],
    reverse: true,
  },
  {
    num: "05 — Inteligência",
    title: (
      <>
        Relatórios que respondem
        <br />
        <em className="not-italic text-flame">perguntas de verdade</em>
      </>
    ),
    description:
      "Quem é seu aluno mais engajado? Qual instrutor lota mais aula? Em que mês a inadimplência sobe? Tudo com filtros, exportação CSV e gráficos que cabem na tela do celular do dono.",
    bullets: [
      "MRR, churn e retenção mês a mês",
      "Frequência por aluno, instrutor e modalidade",
      "Inadimplência por plano e por canal",
      "Exportação CSV e dashboards salvos",
    ],
    reverse: false,
  },
];

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 max-[720px]:py-14">
        <Wrap>
          <div className="grid grid-cols-[1.2fr_1fr] gap-16 items-center max-[880px]:grid-cols-1 max-[880px]:gap-8">
            <div>
              <Eyebrow>Recursos · 100% incluso</Eyebrow>
              <h1 className="font-display text-[clamp(2.4rem,5vw,4.2rem)] font-semibold tracking-[-0.03em] leading-[1.02] mt-7">
                Tudo que sua academia precisa.
                <br />
                <em className="not-italic text-flame">Nada que ela não use.</em>
              </h1>
            </div>
            <p className="text-[1.1rem] text-ink-500 leading-[1.6]">
              Da matrícula à cobrança, da agenda ao treino, do app do aluno aos
              relatórios — o Gym entrega o caminho inteiro sem te empurrar
              dezenas de módulos que ninguém abre.
            </p>
          </div>
        </Wrap>
      </section>

      {/* Feature rows */}
      <section>
        <Wrap>
          {FEATURES.map((feature, idx) => (
            <article
              key={feature.num}
              className={cn(
                "grid grid-cols-[1fr_1fr] gap-16 py-20 border-b border-line items-center max-[880px]:grid-cols-1 max-[880px]:gap-10 max-[880px]:py-14",
                feature.reverse && "[&>div:first-child]:order-2",
                idx === FEATURES.length - 1 && "border-b-0",
              )}
            >
              <div>
                <span className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-flame">
                  {feature.num}
                </span>
                <h2 className="font-display text-[clamp(1.8rem,3.5vw,2.6rem)] font-semibold tracking-[-0.03em] leading-[1.08] mt-4">
                  {feature.title}
                </h2>
                <p className="text-[1.02rem] text-ink-500 mt-5 leading-[1.6]">
                  {feature.description}
                </p>
                <ul className="mt-6 flex flex-col gap-3">
                  {feature.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-center gap-2 text-[0.94rem] text-ink-700"
                    >
                      <Icon name="check" className="text-emerald shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div>{renderVisual(feature.num)}</div>
            </article>
          ))}
        </Wrap>
      </section>

      {/* CTA strip */}
      <section className="py-20 bg-paper-50 border-t border-line">
        <Wrap>
          <div className="flex items-center justify-between gap-8 max-[720px]:flex-col max-[720px]:text-center">
            <h2 className="font-display text-[clamp(1.8rem,3vw,2.6rem)] font-semibold tracking-[-0.03em] leading-[1.05]">
              Pronto pra ver isso
              <br />
              rodando na{" "}
              <em className="not-italic text-flame">sua academia?</em>
            </h2>
            <Button variant="flame" href="/contact">
              Começar grátis
              <Icon name="arrow-right" />
            </Button>
          </div>
        </Wrap>
      </section>
    </>
  );
}

/* ============================================================
   Visual helpers per feature row
   ============================================================ */

function renderVisual(num: string) {
  if (num.startsWith("01")) return <FinanceVisual />;
  if (num.startsWith("02")) return <ScheduleVisual />;
  if (num.startsWith("03")) return <WorkoutVisual />;
  if (num.startsWith("04")) return <WhiteLabelVisual />;
  return <ReportsVisual />;
}

function FinanceVisual() {
  return (
    <Card className="p-7 flex flex-col gap-4">
      <div>
        <div className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ink-400">
          Receita do mês
        </div>
        <div className="font-display text-[2.6rem] font-semibold mt-1 leading-none">
          R$ 18.420
        </div>
        <div className="text-[0.82rem] text-emerald mt-1">
          +8,2% vs mês anterior
        </div>
      </div>
      {[
        { who: "João Silva", desc: "Mensal · PIX", pill: "PAGO", tone: "emerald" as const },
        { who: "Ana Costa", desc: "Trimestral · Cartão", pill: "PAGO", tone: "emerald" as const },
        { who: "Carlos Souza", desc: "Mensal · Boleto", pill: "PENDENTE", tone: "amber" as const },
      ].map((row) => (
        <div
          key={row.who}
          className="flex items-center justify-between py-3 px-4 rounded-xl bg-paper-50 border border-line"
        >
          <div>
            <div className="text-[0.9rem] font-semibold text-ink-900">
              {row.who}
            </div>
            <div className="text-[0.78rem] text-ink-400">{row.desc}</div>
          </div>
          <Pill tone={row.tone}>{row.pill}</Pill>
        </div>
      ))}
    </Card>
  );
}

function ScheduleVisual() {
  const days = [
    { d: "30", out: true },
    { d: "31", out: true },
    { d: "1", has: true },
    { d: "2" },
    { d: "3", has: true },
    { d: "4" },
    { d: "5" },
    { d: "6" },
    { d: "7", has: true },
    { d: "8", flame: true },
    { d: "9", has: true },
    { d: "10" },
    { d: "11", has: true },
    { d: "12" },
    { d: "13" },
    { d: "14", has: true },
    { d: "15", has: true },
    { d: "16", has: true },
    { d: "17" },
    { d: "18", has: true },
    { d: "19" },
    { d: "20" },
    { d: "21", has: true },
    { d: "22", has: true },
    { d: "23", has: true },
    { d: "24" },
    { d: "25", has: true },
    { d: "26" },
    { d: "27" },
    { d: "28", has: true },
    { d: "29", has: true },
    { d: "30", has: true },
    { d: "1", out: true },
    { d: "2", out: true },
    { d: "3", out: true },
  ];
  return (
    <Card className="p-7">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ink-400">
            Abril 2026
          </div>
          <div className="font-display text-[1.5rem] font-semibold mt-1">
            94% de ocupação
          </div>
        </div>
        <Pill tone="flame">8 AULAS HOJE</Pill>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((h, i) => (
          <div
            key={`h${i}`}
            className="text-center text-[0.7rem] font-mono text-ink-400 py-2"
          >
            {h}
          </div>
        ))}
        {days.map((day, i) => (
          <div
            key={i}
            className={cn(
              "aspect-square flex items-center justify-center text-[0.8rem] rounded-lg font-medium",
              day.out
                ? "text-ink-200"
                : day.flame
                  ? "bg-flame text-white"
                  : day.has
                    ? "bg-paper-2 text-ink-900"
                    : "text-ink-600",
            )}
          >
            {day.d}
          </div>
        ))}
      </div>
    </Card>
  );
}

function WorkoutVisual() {
  return (
    <Card className="p-7">
      <div className="flex items-center gap-3 pb-4 border-b border-line">
        <div className="w-10 h-10 rounded-xl bg-flame-50 text-flame flex items-center justify-center">
          <Icon name="dumbbell" size="lg" />
        </div>
        <div>
          <div className="font-display font-semibold text-[1.02rem]">
            Treino A — Peito e Tríceps
          </div>
          <div className="font-mono text-[0.72rem] text-ink-400 uppercase tracking-[0.06em]">
            Rafael · atualizado 03/04
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-col">
        {[
          { n: "1", name: "Supino reto", meta: "4×12 · 60kg" },
          { n: "2", name: "Crucifixo inclinado", meta: "3×15 · 16kg" },
          { n: "3", name: "Tríceps corda", meta: "4×12 · 25kg" },
          { n: "4", name: "Mergulho assistido", meta: "3×10" },
        ].map((ex) => (
          <div
            key={ex.n}
            className="flex items-center gap-3 py-3 border-b border-line/50 last:border-b-0"
          >
            <span className="w-8 h-8 rounded-lg bg-flame-50 text-flame font-mono text-[0.78rem] flex items-center justify-center font-semibold">
              {ex.n}
            </span>
            <span className="flex-1 text-[0.92rem] text-ink-900">
              {ex.name}
            </span>
            <span className="font-mono text-[0.78rem] text-ink-400">
              {ex.meta}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function WhiteLabelVisual() {
  return (
    <div className="rounded-[var(--radius-lg)] overflow-hidden border border-flame/40 shadow-[var(--shadow-gym-3)]">
      <div className="bg-gradient-to-br from-flame to-flame-dark text-white p-6">
        <div className="font-mono text-[0.65rem] uppercase tracking-[0.14em] opacity-75">
          CROSSFIT SP — APP DO ALUNO
        </div>
        <div className="font-display text-[1.6rem] font-semibold mt-1">
          Bem-vindo, João
        </div>
      </div>
      <div className="bg-white p-6 flex flex-col gap-4">
        {[
          ["Próxima aula", "Hoje, 18:00"],
          ["Plano", "Mensal · R$ 99"],
          ["Vencimento", "15/05/2026"],
          ["Treino atual", "Treino A"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between pb-3 border-b border-line/60 last:border-b-0 last:pb-0"
          >
            <span className="text-[0.82rem] text-ink-400">{label}</span>
            <strong className="text-[0.92rem] text-ink-900 font-semibold">
              {value}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsVisual() {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-5">
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ink-400">
            Alunos ativos
          </div>
          <div className="font-display text-[2.2rem] font-semibold mt-1 leading-none">
            248
          </div>
          <div className="text-[0.76rem] text-emerald mt-1">+12 este mês</div>
        </Card>
        <Card className="p-5">
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ink-400">
            Retenção 90d
          </div>
          <div className="font-display text-[2.2rem] font-semibold mt-1 leading-none">
            87%
          </div>
          <div className="text-[0.76rem] text-emerald mt-1">+2,1pp</div>
        </Card>
      </div>
      <Card className="p-5">
        <div className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ink-400">
          Receita últimos 6 meses
        </div>
        <svg
          viewBox="0 0 320 80"
          preserveAspectRatio="none"
          className="w-full h-20 mt-2"
        >
          <defs>
            <linearGradient id="fv-gz" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e8551c" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#e8551c" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,60 L53,55 L106,48 L160,52 L213,38 L266,28 L320,12 L320,80 L0,80 Z"
            fill="url(#fv-gz)"
          />
          <path
            d="M0,60 L53,55 L106,48 L160,52 L213,38 L266,28 L320,12"
            fill="none"
            stroke="#e8551c"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </Card>
    </div>
  );
}
