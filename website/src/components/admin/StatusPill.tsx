import { Pill } from "@/components/ui/Pill";
import type {
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
  StudentStatus,
} from "@/lib/types";

export function StudentStatusPill({ status }: { status: StudentStatus }) {
  if (status === "active") return <Pill tone="emerald">ATIVO</Pill>;
  if (status === "suspended") return <Pill tone="amber">SUSPENSO</Pill>;
  return <Pill tone="ink">INATIVO</Pill>;
}

export function PaymentStatusPill({ status }: { status: PaymentStatus }) {
  if (status === "paid") return <Pill tone="emerald">PAGO</Pill>;
  if (status === "pending") return <Pill tone="amber">PENDENTE</Pill>;
  if (status === "overdue") return <Pill tone="rose">VENCIDO</Pill>;
  return <Pill tone="ink">CANCELADO</Pill>;
}

export function BookingStatusPill({ status }: { status: BookingStatus }) {
  if (status === "attended") return <Pill tone="emerald">PRESENTE</Pill>;
  if (status === "confirmed") return <Pill tone="sky">CONFIRMADO</Pill>;
  if (status === "missed") return <Pill tone="rose">FALTOU</Pill>;
  return <Pill tone="ink">CANCELADO</Pill>;
}

const METHOD_LABEL: Record<PaymentMethod, string> = {
  pix: "PIX",
  credit_card: "Cartão",
  boleto: "Boleto",
};

export function PaymentMethodLabel({ method }: { method: PaymentMethod }) {
  return (
    <span className="font-mono text-[0.78rem] text-ink-600">
      {METHOD_LABEL[method]}
    </span>
  );
}
