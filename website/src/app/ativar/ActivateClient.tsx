"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Brand } from "@/components/ui/Brand";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { GRAPHQL_ENDPOINT, JWT_STORAGE_KEY, USE_MOCKS } from "@/lib/config";
import { setAuthCookies } from "@/lib/auth";
import { apolloClient } from "@/lib/apollo";
import { useAcademyBranding } from "@/lib/hooks";
import { resolveAcademySlug } from "@/lib/subdomain";

/** "12/03/2018" → "2018-03-12"; passes ISO through; "" when invalid. */
function brDateToISO(input: string): string {
  const s = input.trim();
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return "";
  const [, d, mo, y] = m;
  return `${y}-${mo}-${d}`;
}

const STAFF_ROLES = new Set(["academy_admin", "instructor"]);

export function ActivateClient() {
  const router = useRouter();

  const [slug, setSlug] = useState<string | null>(null);
  useEffect(() => setSlug(resolveAcademySlug()), []);
  const { data: branding } = useAcademyBranding(slug);

  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) return setError("Informe seu e-mail.");
    if (!birthdate.trim() && !phone.trim()) {
      return setError("Confirme sua data de nascimento ou telefone.");
    }
    if (password.length < 6) {
      return setError("A senha precisa ter pelo menos 6 caracteres.");
    }
    if (password !== confirm) return setError("As senhas não conferem.");
    if (!slug) {
      return setError(
        "Não identificamos a academia. Use o link enviado pela sua academia.",
      );
    }
    const iso = brDateToISO(birthdate);
    if (birthdate.trim() && !iso) {
      return setError("Data de nascimento inválida. Use DD/MM/AAAA.");
    }

    setSubmitting(true);

    if (USE_MOCKS) {
      setTimeout(() => setDone(true), 300);
      return;
    }

    try {
      const res = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query:
            "mutation Activate($data: ActivateAccountInput!) {\n" +
            "  activateAccount(data: $data) { jwt student { role } }\n" +
            "}",
          variables: {
            data: {
              academySlug: slug,
              email: email.trim(),
              birthdate: iso || undefined,
              phone: phone.trim() || undefined,
              password,
            },
          },
        }),
      });
      const json = (await res.json()) as {
        data?: { activateAccount?: { jwt: string; student?: { role?: string } } };
        errors?: Array<{ message?: string }>;
      };
      if (json.errors?.length) {
        throw new Error(json.errors[0]?.message ?? "Não foi possível ativar.");
      }
      const result = json.data?.activateAccount;
      if (!result?.jwt) throw new Error("Não foi possível ativar a conta.");

      // Staff (admin/instructor) get logged straight into the panel.
      // Students (member) finish on the success screen → they use the app.
      if (result.student?.role && STAFF_ROLES.has(result.student.role)) {
        localStorage.setItem(JWT_STORAGE_KEY, result.jwt);
        await apolloClient.clearStore();
        setAuthCookies("academy_admin");
        router.push("/admin/dashboard");
        return;
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao ativar a conta.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="flex items-center justify-between px-8 py-6 max-[720px]:px-5">
        {branding?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={branding.logoUrl}
            alt={`Logo ${branding.name}`}
            className="h-9 max-w-[160px] object-contain"
          />
        ) : (
          <Brand />
        )}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-[0.88rem] text-ink-500 hover:text-ink-900 transition-colors"
        >
          <Icon name="arrow-left" /> Entrar
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-5 py-8">
        <div className="w-full max-w-[26rem]">
          {done ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald/10 text-emerald flex items-center justify-center mx-auto mb-5">
                <Icon name="check" />
              </div>
              <h1 className="font-display text-[1.8rem] font-semibold tracking-[-0.02em]">
                Conta ativada!
              </h1>
              <p className="text-ink-500 mt-3 leading-[1.6]">
                Sua senha foi criada. Baixe o app da{" "}
                {branding?.name ?? "sua academia"} e entre com seu e-mail e a
                senha que você acabou de definir.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 mt-7 text-flame font-medium hover:underline"
              >
                Ir para o login <Icon name="arrow-right" />
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-[clamp(1.8rem,4vw,2.4rem)] font-semibold tracking-[-0.025em] leading-[1.1]">
                Primeiro acesso
              </h1>
              <p className="text-ink-500 mt-3">
                {branding
                  ? `Ative sua conta na ${branding.name} e crie sua senha.`
                  : "Ative sua conta e crie sua senha."}
              </p>

              <div className="mt-6 rounded-xl bg-flame-50 border border-flame-100 p-4 text-[0.85rem] text-ink-600 leading-[1.5]">
                Confirme o e-mail cadastrado na academia e a sua{" "}
                <strong className="text-ink-900 font-semibold">
                  data de nascimento
                </strong>{" "}
                ou{" "}
                <strong className="text-ink-900 font-semibold">telefone</strong>{" "}
                para a gente te identificar.
              </div>

              <form onSubmit={handleSubmit} className="mt-7">
                <Field label="E-mail">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@email.com"
                    autoComplete="email"
                    required
                  />
                </Field>
                <Field label="Data de nascimento" help="DD/MM/AAAA">
                  <Input
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    placeholder="01/12/1990"
                    inputMode="numeric"
                  />
                </Field>
                <Field label="Telefone" help="se não souber a data de nascimento">
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 98888-1111"
                    inputMode="tel"
                  />
                </Field>

                <div className="h-px bg-line my-5" />

                <Field label="Crie uma senha">
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="mínimo 6 caracteres"
                    autoComplete="new-password"
                    required
                  />
                </Field>
                <Field label="Confirme a senha">
                  <Input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="repita a senha"
                    autoComplete="new-password"
                    required
                  />
                </Field>

                {error && (
                  <div className="text-[0.82rem] text-rose mb-4">{error}</div>
                )}

                <Button type="submit" variant="flame" block disabled={submitting}>
                  {submitting ? "Ativando…" : "Ativar conta"}
                  <Icon name="arrow-right" />
                </Button>
              </form>

              <p className="text-center text-[0.84rem] text-ink-400 mt-6">
                Já tem senha?{" "}
                <Link href="/login" className="text-flame hover:underline">
                  Entrar
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
