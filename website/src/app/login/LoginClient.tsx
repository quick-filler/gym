"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Brand } from "@/components/ui/Brand";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { GRAPHQL_ENDPOINT, JWT_STORAGE_KEY, USE_MOCKS } from "@/lib/config";

const DEFAULT_EMAIL = process.env.NEXT_PUBLIC_DEFAULT_LOGIN_EMAIL ?? "";
const DEFAULT_PASSWORD = process.env.NEXT_PUBLIC_DEFAULT_LOGIN_PASSWORD ?? "";

export function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (USE_MOCKS) {
      // Demo mode: accept anything and drop a fake JWT so admin pages
      // see the "session" exists. No real auth check.
      if (typeof window !== "undefined") {
        localStorage.setItem(JWT_STORAGE_KEY, "mock-demo-token");
      }
      setTimeout(() => router.push("/admin/dashboard"), 300);
      return;
    }

    try {
      // Strapi users-permissions REST login.
      const res = await fetch(
        `${GRAPHQL_ENDPOINT.replace(/\/graphql$/, "")}/api/auth/local`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: email, password }),
        },
      );
      if (!res.ok) {
        throw new Error("E-mail ou senha inválidos.");
      }
      const data = (await res.json()) as { jwt: string };
      localStorage.setItem(JWT_STORAGE_KEY, data.jwt);
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar.");
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-[1.05fr_0.95fr] min-h-screen max-[880px]:grid-cols-1">
      {/* Form side */}
      <section
        className="bg-paper flex flex-col px-16 py-10 max-[720px]:px-6"
        aria-labelledby="login-title"
      >
        <header className="flex items-center justify-between">
          <Brand />
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[0.88rem] text-ink-500 hover:text-ink-900 transition-colors"
          >
            <Icon name="arrow-left" /> Voltar
          </Link>
        </header>

        <div className="flex-1 flex flex-col justify-center max-w-[28rem] mx-auto w-full">
          <h1
            id="login-title"
            className="font-display text-[clamp(2rem,4vw,2.8rem)] font-semibold tracking-[-0.025em] leading-[1.1]"
          >
            Bem-vindo de volta.
          </h1>
          <p className="text-ink-500 mt-3">
            Acesse o painel da sua academia.
          </p>

          {USE_MOCKS && (
            <div className="mt-6 rounded-xl bg-flame-50 border border-flame-100 p-4 text-[0.82rem] text-flame">
              <strong className="font-semibold">Modo demo:</strong> use
              qualquer e-mail e senha para entrar. Nenhuma validação é feita
              contra o backend.
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8">
            <Field label="E-mail">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@academia.com.br"
                autoComplete="email"
                required
              />
            </Field>
            <Field label="Senha">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </Field>

            <div className="flex items-center justify-between text-[0.82rem] mt-2 mb-6">
              <label className="inline-flex items-center gap-2 text-ink-600 cursor-pointer">
                <input type="checkbox" className="accent-flame" />
                Manter conectado por 30 dias
              </label>
              <Link href="/login" className="text-flame hover:underline">
                Esqueci a senha
              </Link>
            </div>

            {error && (
              <div className="text-[0.82rem] text-rose mb-4">{error}</div>
            )}

            <Button
              type="submit"
              variant="flame"
              block
              disabled={submitting}
            >
              {submitting ? "Entrando…" : "Entrar"}
              <Icon name="arrow-right" />
            </Button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="h-px bg-line flex-1" />
            <span className="font-mono text-[0.72rem] text-ink-400 uppercase tracking-[0.1em]">
              ou
            </span>
            <div className="h-px bg-line flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-line-strong bg-white text-[0.88rem] font-medium text-ink-700 hover:border-ink-900 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.96 10.96 0 0 0 12 1a11 11 0 0 0-9.82 6.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
                />
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-line-strong bg-white text-[0.88rem] font-medium text-ink-700 hover:border-ink-900 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#5E5E5E"
                  d="M21 7H3V5h18v2zm0 6H3v-2h18v2zm0 6H3v-2h18v2z"
                />
              </svg>
              Microsoft
            </button>
          </div>
        </div>

        <footer className="flex items-center justify-between text-[0.82rem] text-ink-400 mt-8">
          <span>
            Ainda não tem conta?{" "}
            <Link href="/contact" className="text-flame hover:underline">
              Comece grátis
            </Link>
          </span>
          <span>© 2026 Gym</span>
        </footer>
      </section>

      {/* Visual side */}
      <aside
        className="bg-ink-900 text-paper flex items-center justify-center p-16 relative overflow-hidden max-[880px]:hidden"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(232,85,28,0.2)_0%,transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(15,118,110,0.15)_0%,transparent_50%)] pointer-events-none" />
        <div className="relative z-[1] max-w-[30rem]">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.15em] text-flame">
            Em produção
          </span>
          <p className="font-display text-[clamp(1.8rem,3vw,2.6rem)] font-medium leading-[1.2] text-paper mt-5">
            &ldquo;O sistema cobra, o aluno paga, eu vou treinar.{" "}
            <em className="text-flame not-italic">É isso.</em>&rdquo;
          </p>
          <div className="flex items-center gap-3 mt-8">
            <div className="w-12 h-12 rounded-full bg-flame text-white flex items-center justify-center font-mono text-[0.9rem] font-semibold">
              RV
            </div>
            <div>
              <div className="font-semibold text-paper">
                Rafael Vasconcellos
              </div>
              <div className="font-mono text-[0.72rem] text-ink-300 uppercase tracking-[0.06em]">
                CrossFit SP · Vila Mariana
              </div>
            </div>
          </div>
          <div className="mt-12 bg-ink-700/40 backdrop-blur-sm border border-ink-700 rounded-[var(--radius-lg)] p-5 flex flex-col divide-y divide-ink-700">
            {[
              ["João Silva — Mensal", "PAGO 03/04"],
              ["Ana Costa — Trimestral", "PAGO 01/04"],
              ["Carlos Souza — Mensal", "PENDENTE 10/04"],
              ["Mariana Lopes — Anual", "PAGO 28/03"],
            ].map(([name, meta]) => (
              <div
                key={name}
                className="flex justify-between items-center py-3 first:pt-0 last:pb-0 text-[0.88rem]"
              >
                <span className="text-paper">{name}</span>
                <span className="font-mono text-[0.72rem] text-ink-300">
                  {meta}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
