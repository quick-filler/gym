import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  BookingStatusPill,
  PaymentMethodLabel,
  PaymentStatusPill,
  StudentStatusPill,
} from './StatusPill';

describe('StudentStatusPill', () => {
  it.each([
    ['active', 'ATIVO', 'text-emerald'],
    ['inactive', 'INATIVO', 'text-ink-700'],
    ['suspended', 'SUSPENSO', 'text-amber'],
  ] as const)('%s → label %s, class %s', (status, label, cls) => {
    render(<StudentStatusPill status={status} />);
    const el = screen.getByText(label);
    expect(el).toHaveClass(cls);
  });
});

describe('PaymentStatusPill', () => {
  it.each([
    ['paid', 'PAGO', 'text-emerald'],
    ['pending', 'PENDENTE', 'text-amber'],
    ['overdue', 'VENCIDO', 'text-rose'],
    ['cancelled', 'CANCELADO', 'text-ink-700'],
  ] as const)('%s → label %s', (status, label, cls) => {
    render(<PaymentStatusPill status={status} />);
    const el = screen.getByText(label);
    expect(el).toHaveClass(cls);
  });
});

describe('BookingStatusPill', () => {
  it.each([
    ['attended', 'PRESENTE'],
    ['confirmed', 'CONFIRMADO'],
    ['missed', 'FALTOU'],
    ['cancelled', 'CANCELADO'],
  ] as const)('%s → label %s', (status, label) => {
    render(<BookingStatusPill status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

describe('PaymentMethodLabel', () => {
  it.each([
    ['pix', 'PIX'],
    ['credit_card', 'Cartão'],
    ['boleto', 'Boleto'],
  ] as const)('%s → %s', (method, label) => {
    render(<PaymentMethodLabel method={method} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
