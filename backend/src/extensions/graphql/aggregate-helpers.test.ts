import { describe, expect, it } from 'vitest';
import {
  BRL,
  BRL_SHORT,
  CATEGORY_LABEL,
  MONTH_LABELS_PT,
  MONTH_SHORT_PT,
  fmtDateBR,
  initialsFor,
  monthWindow,
  weekdayISO,
} from './aggregate-helpers';

describe('BRL', () => {
  it('formats integers with two decimals', () => {
    expect(BRL(1234)).toBe('R$ 1.234,00');
  });

  it('formats decimals with two places', () => {
    expect(BRL(18420.5)).toBe('R$ 18.420,50');
  });

  it('handles zero', () => {
    expect(BRL(0)).toBe('R$ 0,00');
  });

  it('handles negatives', () => {
    expect(BRL(-99.9)).toBe('R$ -99,90');
  });

  it('coerces numeric strings', () => {
    expect(BRL(Number('42.25'))).toBe('R$ 42,25');
  });
});

describe('BRL_SHORT', () => {
  it('omits decimals', () => {
    expect(BRL_SHORT(18420)).toBe('R$ 18.420');
  });

  it('rounds fractional input', () => {
    expect(BRL_SHORT(8620.49)).toBe('R$ 8.620');
    expect(BRL_SHORT(8620.5)).toBe('R$ 8.621');
  });
});

describe('monthWindow', () => {
  it('returns [start, end) for a mid-year month', () => {
    expect(monthWindow(2026, 4)).toEqual({
      start: '2026-04-01',
      end: '2026-05-01',
    });
  });

  it('wraps December to January of next year', () => {
    expect(monthWindow(2026, 12)).toEqual({
      start: '2026-12-01',
      end: '2027-01-01',
    });
  });

  it('pads single-digit months', () => {
    expect(monthWindow(2026, 1)).toEqual({
      start: '2026-01-01',
      end: '2026-02-01',
    });
  });
});

describe('initialsFor', () => {
  it('uses first + last initial for multi-word names', () => {
    expect(initialsFor('Ana Beatriz Souza')).toBe('AS');
    expect(initialsFor('João Silva')).toBe('JS');
  });

  it('returns first 2 chars for single-word names', () => {
    expect(initialsFor('Ana')).toBe('AN');
    expect(initialsFor('X')).toBe('X');
  });

  it('collapses extra whitespace', () => {
    expect(initialsFor('  Ana   Souza  ')).toBe('AS');
  });

  it('falls back to "?" for empty / null-like input', () => {
    expect(initialsFor('')).toBe('?');
    expect(initialsFor('   ')).toBe('?');
    // @ts-expect-error — exercising runtime fallback
    expect(initialsFor(null)).toBe('?');
    // @ts-expect-error
    expect(initialsFor(undefined)).toBe('?');
  });

  it('uppercases Unicode names', () => {
    expect(initialsFor('Átila Ōkubo')).toBe('ÁŌ');
  });
});

describe('fmtDateBR', () => {
  it('reformats an ISO date to DD/MM/YYYY', () => {
    expect(fmtDateBR('2026-04-20')).toBe('20/04/2026');
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

describe('weekdayISO', () => {
  it('treats Sunday as 0', () => {
    // 2026-04-19 is a Sunday
    expect(weekdayISO('2026-04-19')).toBe(0);
  });

  it('treats Saturday as 6', () => {
    // 2026-04-18 is a Saturday
    expect(weekdayISO('2026-04-18')).toBe(6);
  });

  it('does not drift across DST (anchors at noon)', () => {
    // US DST starts 2026-03-08. Anchoring at T12:00 avoids the 2am jump.
    expect(weekdayISO('2026-03-08')).toBe(0);
  });
});

describe('MONTH_LABELS_PT / MONTH_SHORT_PT', () => {
  it('has 12 entries each', () => {
    expect(MONTH_LABELS_PT).toHaveLength(12);
    expect(MONTH_SHORT_PT).toHaveLength(12);
  });

  it('long labels are title-cased', () => {
    expect(MONTH_LABELS_PT[0]).toBe('Janeiro');
    expect(MONTH_LABELS_PT[11]).toBe('Dezembro');
  });

  it('short labels are 3 letters', () => {
    for (const m of MONTH_SHORT_PT) {
      expect(m.length).toBe(3);
    }
    expect(MONTH_SHORT_PT[2]).toBe('Mar');
  });
});

describe('CATEGORY_LABEL', () => {
  it('maps every backend enum to a pt-BR label', () => {
    const enumKeys = [
      'rent',
      'utilities',
      'payroll',
      'equipment',
      'marketing',
      'supplies',
      'taxes',
      'software',
      'other',
    ];
    for (const key of enumKeys) {
      expect(CATEGORY_LABEL[key]).toBeTruthy();
      expect(typeof CATEGORY_LABEL[key]).toBe('string');
    }
  });

  it('falls through to undefined for unknown keys (callers default)', () => {
    expect(CATEGORY_LABEL['unknown']).toBeUndefined();
  });
});
