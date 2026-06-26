/**
 * Financial status (situação financeira) presentation, shared by
 * /admin/students and /admin/finance. The status itself is derived on the
 * backend (`Enrollment.nextCharge.status`): em_dia / pendente / atrasado.
 */

export type FinancialStatus = "em_dia" | "pendente" | "atrasado";

export const FINANCIAL_STATUS: Record<
  FinancialStatus,
  { label: string; tone: "emerald" | "amber" | "rose" }
> = {
  em_dia: { label: "Em dia", tone: "emerald" },
  pendente: { label: "Pendente", tone: "amber" },
  atrasado: { label: "Atrasado", tone: "rose" },
};
