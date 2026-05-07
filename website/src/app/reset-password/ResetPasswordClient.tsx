"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Brand } from "@/components/ui/Brand";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { LoadingState, Spinner } from "@/components/ui/LoadingState";
import { GRAPHQL_ENDPOINT } from "@/lib/config";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!code) {
      setError("Link inválido. Solicite um novo e-mail à nossa equipe.");
      return;
    }
    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmation) {
      setError("As senhas não conferem.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `${GRAPHQL_ENDPOINT.replace(/\/graphql$/, "")}/api/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            password,
            passwordConfirmation: confirmation,
          }),
        },
      );
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        const message =
          payload?.error?.message ??
          "Não foi possível redefinir a senha. O link pode ter expirado.";
        throw new Error(message);
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao redefinir senha.");
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-paper min-h-screen flex flex-col px-16 py-10 max-[720px]:px-6">
      <header className="flex items-center justify-between">
        <Brand />
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-[0.88rem] text-ink-500 hover:text-ink-900 transition-colors"
        >
          <Icon name="arrow-left" /> Login
        </Link>
      </header>

      <div className="flex-1 flex flex-col justify-center max-w-[28rem] mx-auto w-full">
        <h1 className="font-display text-[clamp(2rem,4vw,2.6rem)] font-semibold tracking-[-0.025em] leading-[1.1]">
          Defina sua senha
        </h1>
        <p className="text-ink-500 mt-3">
          Escolha a senha que você usará para acessar o painel da sua academia.
        </p>

        {done ? (
          <div className="mt-8 rounded-xl bg-emerald/10 border border-emerald/30 p-5">
            <div className="flex items-center gap-2 text-emerald font-semibold mb-1">
              <Icon name="check" /> Senha definida com sucesso
            </div>
            <p className="text-[0.88rem] text-ink-700">
              Redirecionando para a página de login…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8">
            <Field label="Nova senha">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                minLength={6}
                autoFocus
              />
            </Field>
            <Field label="Confirme a nova senha">
              <Input
                type="password"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                minLength={6}
              />
            </Field>

            {error && (
              <div className="text-[0.82rem] text-rose mb-4">{error}</div>
            )}

            <Button
              type="submit"
              variant="flame"
              block
              disabled={submitting || !code}
            >
              {submitting ? (
                <>
                  <Spinner size={14} />
                  Salvando
                </>
              ) : (
                <>
                  Definir senha
                  <Icon name="arrow-right" />
                </>
              )}
            </Button>

            {!code && (
              <p className="text-[0.82rem] text-rose mt-3">
                Link inválido — abra o e-mail novamente ou peça outro à equipe.
              </p>
            )}
          </form>
        )}
      </div>

      <footer className="text-[0.82rem] text-ink-400 text-center mt-8">
        © 2026 Gym
      </footer>
    </div>
  );
}

export function ResetPasswordClient() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
