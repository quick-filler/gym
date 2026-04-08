import Link from "next/link";
import { Brand } from "@/components/ui/Brand";

const COLS = [
  {
    title: "Produto",
    links: [
      { href: "/features", label: "Recursos" },
      { href: "/pricing", label: "Preços" },
      { href: "/about", label: "A plataforma" },
      { href: "/contact", label: "Demonstração" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { href: "/about", label: "Nossa história" },
      { href: "/about#valores", label: "Valores" },
      { href: "/about#time", label: "Time" },
      { href: "/contact", label: "Contato" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/termos", label: "Termos" },
      { href: "/privacidade", label: "Privacidade" },
      { href: "/seguranca", label: "Segurança" },
      { href: "/status", label: "Status" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="bg-paper border-t border-line pt-16 pb-8 mt-16">
      <div className="w-full max-w-[1280px] mx-auto px-8 max-[720px]:px-5">
        <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-12 mb-12 max-[720px]:grid-cols-2 max-[720px]:gap-8">
          <div className="max-w-[18rem]">
            <Brand />
            <p className="text-ink-400 text-[0.88rem] mt-4 leading-[1.55]">
              Gestão white-label para academias brasileiras. Cobrança PIX,
              agenda, fichas e app com a cara da sua marca.
            </p>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <h5 className="font-mono text-[0.72rem] font-medium text-ink-400 uppercase tracking-[0.1em] mb-5">
                {col.title}
              </h5>
              <ul className="list-none flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[0.9rem] text-ink-600 hover:text-ink-900 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-line flex justify-between items-center text-[0.8rem] text-ink-400 max-[720px]:flex-col max-[720px]:gap-4">
          <span>© 2026 Gym. Feito em São Paulo.</span>
          <span className="font-mono">v1.0.0 · status: online</span>
        </div>
      </div>
    </footer>
  );
}
