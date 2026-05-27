"use client";

/**
 * Página de billing — destino do banner de subscription. Por enquanto é
 * um placeholder informativo: mostra o estado da assinatura, dias de
 * trial restantes e CTA pra entrar em contato (integração de pagamento
 * automático é fora de escopo do PR atual).
 *
 * Quando a integração Asaas central da GYM ficar pronta, essa página
 * vira o ponto de upgrade/downgrade (chama `changeSubscriptionPlan`)
 * + edição do `updateMyBilling` pros dados de NF-e.
 */

import Link from "next/link";
import { Topbar } from "@/components/admin/Topbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Icon } from "@/components/ui/Icon";
import { useMySubscription } from "@/lib/hooks";

const STATUS_TONE: Record<
  string,
  { tone: "emerald" | "amber" | "rose" | "ink"; label: string }
> = {
  active: { tone: "emerald", label: "ATIVA" },
  trialing: { tone: "amber", label: "EM TESTE" },
  past_due: { tone: "rose", label: "PAGAMENTO EM ATRASO" },
  cancelled: { tone: "rose", label: "CANCELADA" },
  expired: { tone: "rose", label: "EXPIRADA" },
};

export default function BillingPage() {
  const { data: sub, loading, error } = useMySubscription();

  return (
    <>
      <Topbar title="Assinatura" />
      <main className="flex-1 p-8 max-[720px]:p-4">
        <PageHeader
          title="Assinatura e cobrança"
          subtitle="Plano atual, status e dados de faturamento da sua academia."
        />

        {loading && <LoadingState />}
        {error && <div className="text-rose">{error.message}</div>}

        {sub && (
          <div className="grid grid-cols-[1.2fr_1fr] gap-5 max-[980px]:grid-cols-1">
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-3">
                <Pill tone={STATUS_TONE[sub.status]?.tone ?? "ink"}>
                  {STATUS_TONE[sub.status]?.label ?? sub.status}
                </Pill>
                <span className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink-400">
                  Plano · {sub.recurrency === "annual" ? "Anual" : "Mensal"}
                </span>
              </div>
              <h2 className="font-display text-[2rem] font-semibold text-ink-900 leading-[1.1]">
                {sub.planName}
              </h2>

              {sub.status === "trialing" && sub.trialDaysLeft != null && (
                <div className="mt-6 p-4 rounded-xl bg-amber-50 text-amber-900 text-[0.92rem]">
                  <strong className="font-semibold">
                    {sub.trialDaysLeft === 1
                      ? "Resta 1 dia"
                      : `Restam ${sub.trialDaysLeft} dias`}
                  </strong>{" "}
                  no seu período de teste. Escolha um plano antes do fim pra
                  não ter interrupção.
                </div>
              )}

              {sub.status !== "trialing" && sub.status !== "active" && (
                <div className="mt-6 p-4 rounded-xl bg-rose-50 text-rose text-[0.92rem]">
                  <strong className="font-semibold">
                    Sua academia está em modo somente leitura.
                  </strong>{" "}
                  Cadastro e edição de alunos, planos, cobranças e agendas
                  estão pausados até regularização.
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-line">
                <div className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-400 mb-3">
                  Próximos passos
                </div>
                <p className="text-[0.92rem] text-ink-600 leading-[1.55]">
                  Pra escolher / trocar de plano ou regularizar pagamento, fale
                  com a gente:
                </p>
                <Link
                  href="mailto:contato@quickfiller.org?subject=Assinatura%20Gym"
                  className="inline-flex items-center gap-2 mt-4 px-5 py-3 rounded-full bg-ink-900 text-paper text-[0.92rem] font-medium hover:bg-ink-700 transition-colors"
                >
                  <Icon name="mail" /> Falar com vendas
                </Link>
              </div>
            </Card>

            <Card className="p-8">
              <h3 className="font-display text-[1.1rem] font-semibold text-ink-900 mb-1">
                Datas
              </h3>
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-400 mb-6">
                Ciclo atual
              </p>
              <dl className="flex flex-col gap-4">
                {sub.trialEndsAt && (
                  <div>
                    <dt className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-400">
                      Fim do trial
                    </dt>
                    <dd className="text-[0.95rem] text-ink-900 font-semibold mt-1">
                      {new Date(sub.trialEndsAt).toLocaleDateString("pt-BR")}
                    </dd>
                  </div>
                )}
                {sub.currentPeriodEnd && (
                  <div>
                    <dt className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-400">
                      Próxima cobrança
                    </dt>
                    <dd className="text-[0.95rem] text-ink-900 font-semibold mt-1">
                      {new Date(sub.currentPeriodEnd).toLocaleDateString(
                        "pt-BR",
                      )}
                    </dd>
                  </div>
                )}
              </dl>
              <div className="mt-8 pt-6 border-t border-line text-[0.82rem] text-ink-500 leading-[1.55]">
                Cobrança gerenciada pela equipe Gym. Em breve, troca de plano
                e dados de NF-e diretamente por aqui.
              </div>
            </Card>
          </div>
        )}

        {!loading && !sub && (
          <Card className="p-12 text-center">
            <div className="text-ink-400">
              Sua academia ainda não tem uma assinatura ativa.
            </div>
          </Card>
        )}
      </main>
    </>
  );
}
