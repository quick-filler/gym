"use client";

/**
 * Banner topo do AdminLayout que comunica o estado da subscription:
 *
 *  - active                  → nada (sub saudável)
 *  - trialing + N > 4 dias   → nada (trial em curso, sem urgência)
 *  - trialing + N ≤ 4 dias   → warning âmbar com contagem
 *  - past_due / expired /
 *    cancelled               → bloqueio vermelho com CTA pra billing
 *
 * O backend já recusa mutations no caso de bloqueio. Esse banner
 * existe pra avisar antes do usuário tentar e tomar um erro feio.
 */

import Link from "next/link";
import { useMySubscription } from "@/lib/hooks";
import { Icon } from "@/components/ui/Icon";

const STATUS_COPY: Record<
  string,
  { tone: "block" | "warn"; title: string; message: string; cta: string }
> = {
  expired: {
    tone: "block",
    title: "Período de teste expirado",
    message:
      "Suas alterações estão pausadas. Escolha um plano pra reativar a operação.",
    cta: "Escolher plano",
  },
  cancelled: {
    tone: "block",
    title: "Assinatura cancelada",
    message:
      "Sua academia está em modo somente leitura. Reative pra voltar a operar.",
    cta: "Reativar",
  },
  past_due: {
    tone: "block",
    title: "Pagamento em atraso",
    message:
      "Regularize a cobrança pra continuar criando e editando dados.",
    cta: "Regularizar",
  },
};

export function SubscriptionBanner() {
  const { data: sub } = useMySubscription();
  if (!sub) return null;

  // Trial saudável (> 4 dias) → nenhum banner.
  if (sub.status === "active") return null;
  if (sub.status === "trialing" && (sub.trialDaysLeft ?? 99) > 4) return null;

  // Trial entrando em zona de aviso (≤ 4 dias).
  if (sub.status === "trialing") {
    const days = sub.trialDaysLeft ?? 0;
    const dayLabel = days === 1 ? "1 dia" : `${days} dias`;
    return (
      <div
        role="status"
        className="bg-amber-50 text-amber-900 border-b border-amber/40 px-8 py-3 max-[720px]:px-4 flex items-center gap-3 text-[0.88rem]"
      >
        <Icon name="clock" className="text-amber shrink-0" />
        <span className="flex-1">
          <strong className="font-semibold">Seu teste grátis acaba em {dayLabel}.</strong>{" "}
          Escolha um plano agora pra não ter interrupção.
        </span>
        <Link
          href="/admin/billing"
          className="font-mono text-[0.75rem] uppercase tracking-[0.08em] px-3 py-1.5 rounded-full bg-amber text-white hover:bg-amber/90 transition-colors shrink-0"
        >
          Escolher plano
        </Link>
      </div>
    );
  }

  // Estados bloqueantes (expired / cancelled / past_due).
  const copy = STATUS_COPY[sub.status];
  if (!copy) return null;

  return (
    <div
      role="alert"
      className="bg-rose-50 text-rose border-b border-rose/40 px-8 py-3 max-[720px]:px-4 flex items-center gap-3 text-[0.88rem]"
    >
      <Icon name="lock" className="text-rose shrink-0" />
      <span className="flex-1">
        <strong className="font-semibold">{copy.title}.</strong> {copy.message}
      </span>
      <Link
        href="/admin/billing"
        className="font-mono text-[0.75rem] uppercase tracking-[0.08em] px-3 py-1.5 rounded-full bg-rose text-white hover:bg-rose/90 transition-colors shrink-0"
      >
        {copy.cta}
      </Link>
    </div>
  );
}
