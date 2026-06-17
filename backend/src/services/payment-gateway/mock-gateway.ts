/**
 * Mock payment gateway — the default until a real provider is chosen.
 *
 * Returns deterministic fake artifacts derived from the paymentId so the
 * app's full checkout UI (PIX QR, boleto, card) works end-to-end without
 * any external account, and so smoke/unit tests are stable.
 *
 * Card decisions are deterministic: a card number ending in `0002` is
 * declined (mirrors the convention real sandboxes use for a "recusado"
 * test card); everything else is approved. This lets us exercise the
 * declined-card path in the app without a real gateway.
 *
 * The helpers below are pure and exported for unit tests; the default
 * export is the gateway object the resolvers consume.
 */

import type {
  BoletoCheckout,
  CardChargeResult,
  CardData,
  ChargeRequest,
  PaymentGateway,
  PixCheckout,
} from './types';

const PIX_TTL_MINUTES = 30;

/** Small stable hash so fake codes look unique per payment but reproduce. */
export function mockHash(seed: string): string {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Unsigned hex, padded.
  return (h >>> 0).toString(16).padStart(8, '0');
}

/** Digits-only string of length `len` derived from the seed. */
export function mockDigits(seed: string, len: number): string {
  let out = '';
  let i = 0;
  while (out.length < len) {
    out += String(parseInt(mockHash(`${seed}:${i}`), 16)).replace(/\D/g, '');
    i += 1;
  }
  return out.slice(0, len);
}

/** EMV-ish "copia e cola" payload — looks like PIX, isn't real. */
export function mockPixCopyPaste(req: ChargeRequest): string {
  const merchant = mockHash(req.customer.documentId).toUpperCase();
  const txid = mockHash(req.paymentId).toUpperCase();
  const amount = req.amount.toFixed(2);
  return `00020126MOCK-PIX-${merchant}5204000053039865406${amount}5802BR5913GYM%20DEMO6009SAO%20PAULO62070503${txid}6304MOCK`;
}

export function mockPixCharge(req: ChargeRequest, now: Date = new Date()): PixCheckout {
  const copyPaste = mockPixCopyPaste(req);
  return {
    externalId: `mock_pix_${mockHash(req.paymentId)}`,
    // The app treats a `mock:` payload as "render the copy-paste string as
    // a QR locally" — keeps us free of a server-side QR image dependency.
    qrCode: `mock:${copyPaste}`,
    copyPaste,
    expiresAt: new Date(now.getTime() + PIX_TTL_MINUTES * 60_000).toISOString(),
  };
}

/** 47-digit linha digitável (fake). */
export function mockBoletoBarCode(paymentId: string): string {
  return mockDigits(`boleto:${paymentId}`, 47);
}

export function mockBoletoCharge(req: ChargeRequest): BoletoCheckout {
  const id = mockHash(req.paymentId);
  return {
    externalId: `mock_bol_${id}`,
    boletoUrl: `https://mock-gateway.local/boleto/${id}.pdf`,
    barCode: mockBoletoBarCode(req.paymentId),
    dueDate: req.dueDate,
  };
}

/** Last 4 digits of a (possibly spaced) card number. */
export function cardLast4(number: string): string {
  return number.replace(/\D/g, '').slice(-4);
}

/** Crude brand sniff from the leading digit — enough for a mock label. */
export function cardBrand(number: string): string {
  const digits = number.replace(/\D/g, '');
  if (digits.startsWith('4')) return 'Visa';
  if (/^5[1-5]/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'Amex';
  if (/^(636|438935|504175|451416|636297|5067|4576|4011|506699)/.test(digits))
    return 'Elo';
  return 'Cartão';
}

export function mockCardCharge(req: ChargeRequest, card: CardData): CardChargeResult {
  const last4 = cardLast4(card.number);
  const externalId = `mock_card_${mockHash(req.paymentId)}`;
  if (last4 === '0002') {
    return {
      externalId,
      status: 'declined',
      brand: cardBrand(card.number),
      last4,
      declineReason: 'Cartão recusado pela operadora (mock).',
    };
  }
  return {
    externalId,
    status: 'approved',
    brand: cardBrand(card.number),
    last4,
  };
}

const mockGateway: PaymentGateway = {
  provider: 'mock',
  isMock: true,
  createPixCharge: async (req) => mockPixCharge(req),
  createBoletoCharge: async (req) => mockBoletoCharge(req),
  chargeCard: async (req, card) => mockCardCharge(req, card),
};

export default mockGateway;
