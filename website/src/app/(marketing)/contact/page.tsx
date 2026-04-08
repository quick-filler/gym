import type { Metadata } from "next";
import Link from "next/link";
import { Wrap } from "@/components/marketing/Wrap";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon, type IconName } from "@/components/ui/Icon";
import { JsonLd, pageMetadata } from "@/lib/seo";
import { SITE_ORIGIN } from "@/lib/config";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = pageMetadata({
  title: "Contato — Fale com a gente",
  description:
    "Sem vendedor e sem SDR. Mande mensagem e cai direto numa pessoa do time. Resposta em média em 47 minutos durante o horário comercial.",
  path: "/contact",
});

const contactPageSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contato — Gym",
  url: `${SITE_ORIGIN}/contact`,
};

type Channel = {
  icon: IconName;
  iconTone: "flame" | "ink";
  name: string;
  detail: string;
  href: string;
};

const CHANNELS: Channel[] = [
  {
    icon: "whatsapp",
    iconTone: "flame",
    name: "WhatsApp",
    detail: "+55 11 99999-0000",
    href: "https://wa.me/5511999990000",
  },
  {
    icon: "mail",
    iconTone: "ink",
    name: "E-mail comercial",
    detail: "vendas@gym.app",
    href: "mailto:vendas@gym.app",
  },
  {
    icon: "mail",
    iconTone: "ink",
    name: "Suporte (clientes)",
    detail: "suporte@gym.app",
    href: "mailto:suporte@gym.app",
  },
  {
    icon: "calendar",
    iconTone: "ink",
    name: "Demo de 20 minutos",
    detail: "cal.gym.app/demo",
    href: "/contact",
  },
  {
    icon: "pin",
    iconTone: "ink",
    name: "Onde estamos",
    detail: "São Paulo · Vila Mariana",
    href: "/contact",
  },
];

export default function ContactPage() {
  return (
    <>
      <JsonLd data={contactPageSchema} />
      <section className="py-20 max-[720px]:py-14">
        <Wrap>
          <div className="grid grid-cols-[0.95fr_1.05fr] gap-16 max-[880px]:grid-cols-1 max-[880px]:gap-10">
            <aside>
              <Eyebrow>Contato direto</Eyebrow>
              <h1 className="font-display text-[clamp(2.4rem,5vw,4rem)] font-semibold tracking-[-0.03em] leading-[1.05] mt-6">
                Sem vendedor.
                <br />
                <em className="not-italic text-flame">A gente responde.</em>
              </h1>
              <p className="text-[1.08rem] text-ink-500 mt-5 leading-[1.6] max-w-[28rem]">
                Não temos SDR, BDR, nem fila de vendas. Você manda mensagem e
                cai direto numa pessoa do time. Resposta média em 47 minutos
                durante o horário comercial.
              </p>
              <nav
                className="mt-10 flex flex-col gap-3"
                aria-label="Canais de contato"
              >
                {CHANNELS.map((c) => (
                  <Link
                    key={c.name}
                    href={c.href}
                    className="group flex items-center gap-4 p-4 rounded-2xl border border-line bg-white hover:border-ink-900 hover:translate-x-1 transition-all duration-200"
                  >
                    <span
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        c.iconTone === "flame"
                          ? "bg-flame-50 text-flame"
                          : "bg-paper-2 text-ink-700"
                      }`}
                    >
                      <Icon name={c.icon} size="lg" />
                    </span>
                    <div className="flex-1">
                      <div className="font-semibold text-[0.98rem] text-ink-900">
                        {c.name}
                      </div>
                      <div className="font-mono text-[0.78rem] text-ink-500 mt-[2px]">
                        {c.detail}
                      </div>
                    </div>
                    <Icon
                      name="arrow-right"
                      size="lg"
                      className="text-ink-300 group-hover:text-ink-900 group-hover:translate-x-1 transition-all"
                    />
                  </Link>
                ))}
              </nav>
            </aside>

            <section
              className="bg-white border border-line rounded-[var(--radius-lg)] p-10 shadow-[var(--shadow-gym-2)] max-[720px]:p-6"
              aria-labelledby="form-title"
            >
              <h2
                id="form-title"
                className="font-display text-[1.6rem] font-semibold"
              >
                Mande uma mensagem
              </h2>
              <p className="text-[0.95rem] text-ink-500 mt-2 mb-8">
                A gente responde no mesmo dia útil — geralmente em menos de 1
                hora.
              </p>
              <ContactForm />
            </section>
          </div>
        </Wrap>
      </section>
    </>
  );
}
