/**
 * Unit tests for the mock payment gateway's pure helpers.
 *
 * These guard the two properties the mock must keep: determinism (same
 * input → same fake artifact, so tests/smoke runs reproduce) and the
 * declined-card convention (number ending 0002 → declined).
 */

import { describe, expect, it } from 'vitest';
import {
  cardBrand,
  cardLast4,
  mockBoletoBarCode,
  mockBoletoCharge,
  mockCardCharge,
  mockDigits,
  mockHash,
  mockPixCharge,
} from './mock-gateway';
import type { ChargeRequest } from './types';

const req: ChargeRequest = {
  paymentId: 'pay_abc123',
  amount: 99.9,
  dueDate: '2026-07-15',
  description: 'Mensalidade',
  customer: { documentId: 'stu_xyz', name: 'Aluno A', email: 'a@email.com' },
};

describe('mockHash / mockDigits', () => {
  it('is deterministic', () => {
    expect(mockHash('foo')).toBe(mockHash('foo'));
    expect(mockHash('foo')).not.toBe(mockHash('bar'));
  });

  it('mockDigits returns the requested length of digits only', () => {
    const d = mockDigits('seed', 47);
    expect(d).toHaveLength(47);
    expect(d).toMatch(/^\d+$/);
  });
});

describe('mockPixCharge', () => {
  it('is deterministic for the same payment', () => {
    const a = mockPixCharge(req, new Date('2026-06-17T12:00:00Z'));
    const b = mockPixCharge(req, new Date('2026-06-17T12:00:00Z'));
    expect(a.copyPaste).toBe(b.copyPaste);
    expect(a.externalId).toBe(b.externalId);
  });

  it('encodes the amount and expires 30min out', () => {
    const c = mockPixCharge(req, new Date('2026-06-17T12:00:00Z'));
    expect(c.copyPaste).toContain('99.90');
    expect(c.qrCode.startsWith('mock:')).toBe(true);
    expect(c.expiresAt).toBe('2026-06-17T12:30:00.000Z');
  });
});

describe('mockBoletoCharge', () => {
  it('returns a 47-digit barcode and carries the due date', () => {
    const c = mockBoletoCharge(req);
    expect(mockBoletoBarCode(req.paymentId)).toHaveLength(47);
    expect(c.barCode).toHaveLength(47);
    expect(c.dueDate).toBe('2026-07-15');
    expect(c.boletoUrl).toContain('.pdf');
  });
});

describe('cardLast4 / cardBrand', () => {
  it('extracts last 4 ignoring spaces', () => {
    expect(cardLast4('4111 1111 1111 1234')).toBe('1234');
  });
  it('sniffs the brand from the BIN', () => {
    expect(cardBrand('4111111111111111')).toBe('Visa');
    expect(cardBrand('5212345678901234')).toBe('Mastercard');
    expect(cardBrand('341111111111111')).toBe('Amex');
    expect(cardBrand('9999999999999999')).toBe('Cartão');
  });
});

describe('mockCardCharge', () => {
  it('approves a normal card', () => {
    const r = mockCardCharge(req, {
      number: '4111 1111 1111 1111',
      holderName: 'ALUNO A',
      expiry: '12/30',
      cvv: '123',
    });
    expect(r.status).toBe('approved');
    expect(r.last4).toBe('1111');
    expect(r.brand).toBe('Visa');
  });

  it('declines a card ending in 0002', () => {
    const r = mockCardCharge(req, {
      number: '4111 1111 1111 0002',
      holderName: 'ALUNO A',
      expiry: '12/30',
      cvv: '123',
    });
    expect(r.status).toBe('declined');
    expect(r.declineReason).toBeTruthy();
  });
});
