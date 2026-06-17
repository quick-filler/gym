/**
 * Provider-agnostic payment gateway contract.
 *
 * The product hasn't committed to a gateway yet (Asaas vs Pagar.me vs
 * Stripe), so every checkout flow goes through this interface instead of
 * a concrete SDK. Swapping providers later = implementing `PaymentGateway`
 * once and flipping `PAYMENT_PROVIDER` — no resolver or app changes.
 *
 * See docs/design-decisions.md §2.10 for the rationale.
 */

export type ChargeMethod = 'pix' | 'boleto' | 'credit_card';

/** Everything a provider needs to open a charge against one Payment row. */
export interface ChargeRequest {
  /** Our Payment.documentId — used as the provider externalReference. */
  paymentId: string;
  /** Amount in BRL (e.g. 99.9). */
  amount: number;
  /** yyyy-mm-dd. */
  dueDate: string;
  description?: string;
  customer: {
    documentId: string;
    name: string;
    email?: string | null;
  };
}

export interface PixCheckout {
  externalId: string;
  /** Base64 (or data-URI) of the QR image the app renders. */
  qrCode: string;
  /** EMV "copia e cola" payload. */
  copyPaste: string;
  /** ISO instant the PIX charge expires. */
  expiresAt: string;
}

export interface BoletoCheckout {
  externalId: string;
  /** URL of the boleto PDF. */
  boletoUrl: string;
  /** Linha digitável / código de barras. */
  barCode: string;
  /** yyyy-mm-dd. */
  dueDate: string;
}

/** Raw card data the app collects. Never persisted by us. */
export interface CardData {
  number: string;
  holderName: string;
  /** MM/YY or MM/YYYY. */
  expiry: string;
  cvv: string;
}

export interface CardChargeResult {
  externalId: string;
  status: 'approved' | 'declined';
  brand?: string;
  last4?: string;
  /** Present when declined. */
  declineReason?: string;
}

export interface PaymentGateway {
  /** Identifier surfaced in logs / debugging (e.g. "mock", "asaas"). */
  readonly provider: string;
  /** True when this gateway invents data instead of hitting a real API. */
  readonly isMock: boolean;

  createPixCharge(req: ChargeRequest): Promise<PixCheckout>;
  createBoletoCharge(req: ChargeRequest): Promise<BoletoCheckout>;
  chargeCard(req: ChargeRequest, card: CardData): Promise<CardChargeResult>;
}
