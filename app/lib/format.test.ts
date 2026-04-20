import { describe, expect, it, beforeAll, afterAll, vi } from 'vitest';
import { ageFrom, fmtDateBR, monthlyBRL } from './format';

describe('monthlyBRL', () => {
  it('formats integer with R$ and no decimals', () => {
    expect(monthlyBRL(120)).toBe('R$ 120');
    expect(monthlyBRL(1499)).toBe('R$ 1.499');
  });

  it('rounds fractional input', () => {
    expect(monthlyBRL(120.49)).toBe('R$ 120');
    expect(monthlyBRL(120.5)).toBe('R$ 121');
  });

  it('handles zero', () => {
    expect(monthlyBRL(0)).toBe('R$ 0');
  });
});

describe('fmtDateBR', () => {
  it('reformats an ISO date to DD/MM/YYYY', () => {
    expect(fmtDateBR('2018-03-12')).toBe('12/03/2018');
  });

  it('slices datetimes to their date portion', () => {
    expect(fmtDateBR('2026-04-20T11:14:45.861Z')).toBe('20/04/2026');
  });

  it('returns "" for empty / invalid input', () => {
    expect(fmtDateBR('')).toBe('');
    expect(fmtDateBR(null)).toBe('');
    expect(fmtDateBR(undefined)).toBe('');
    expect(fmtDateBR('notadate')).toBe('');
  });
});

describe('ageFrom', () => {
  beforeAll(() => {
    // Pin "now" to 2026-04-20 so age math is deterministic.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-20T12:00:00Z'));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('returns age in full years when birthday has passed this year', () => {
    // Sofia (Jan 12, 2018) — birthday already passed by April
    // Wait — Sofia's real birthdate is 2018-03-12, so 8 as of 2026-04-20.
    expect(ageFrom('2018-03-12')).toBe(8);
  });

  it('subtracts one year when the birthday has not yet passed', () => {
    // Someone born 2018-12-31 — not yet 8 on 2026-04-20
    expect(ageFrom('2018-12-31')).toBe(7);
  });

  it('returns 0 for same-day-as-today birthday', () => {
    // Born today, in whatever year. 0 years old.
    expect(ageFrom('2026-04-20')).toBe(0);
  });

  it('returns 0 for empty/invalid/null', () => {
    expect(ageFrom('')).toBe(0);
    expect(ageFrom(null)).toBe(0);
    expect(ageFrom(undefined)).toBe(0);
    expect(ageFrom('notadate')).toBe(0);
  });

  it('handles month-boundary edge case', () => {
    // Born exactly on this month's day — has had birthday
    expect(ageFrom('2020-04-20')).toBe(6);
    // Born same month, one day later — not yet
    expect(ageFrom('2020-04-21')).toBe(5);
  });
});
