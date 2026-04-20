import { Brand } from "@/components/ui/Brand";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";

const LINKS = [
  { href: "/features", label: "Recursos" },
  { href: "/pricing", label: "Preços" },
  { href: "/about", label: "A plataforma" },
  { href: "/contact", label: "Contato" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-paper/80 backdrop-blur-xl backdrop-saturate-150 border-b border-line/70">
      <div className="w-full max-w-[1280px] mx-auto px-8 max-[720px]:px-5">
        <div className="flex items-center justify-between py-4">
          <Brand />
          <nav className="hidden min-[881px]:flex gap-10">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[0.92rem] font-medium text-ink-600 hover:text-ink-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" href="/login">
              Entrar
            </Button>
            <Button variant="ink" href="/contact">
              Teste grátis
              <Icon name="arrow-right" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
