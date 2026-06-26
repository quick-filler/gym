import { describe, expect, it } from 'vitest';
import { cn, formatBRL, formatDate, timeAgo } from './utils';

describe('timeAgo', () => {
  const now = new Date('2026-06-26T12:00:00Z');
  it('formats relative buckets', () => {
    expect(timeAgo('2026-06-26T11:59:30Z', now)).toBe('agora');
    expect(timeAgo('2026-06-26T11:30:00Z', now)).toBe('há 30 min');
    expect(timeAgo('2026-06-26T09:00:00Z', now)).toBe('há 3 h');
    expect(timeAgo('2026-06-25T10:00:00Z', now)).toBe('ontem');
    expect(timeAgo('2026-06-23T10:00:00Z', now)).toBe('há 3 dias');
  });
  it('falls back to a date / empty for old or bad input', () => {
    expect(timeAgo('2026-06-01T10:00:00Z', now)).toBe('01/06/2026');
    expect(timeAgo(null, now)).toBe('');
    expect(timeAgo('nope', now)).toBe('');
  });
});

describe('cn', () => {
  it('joins truthy string/number inputs with spaces', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
    expect(cn('button', 2, 'large')).toBe('button 2 large');
  });

  it('filters out falsy values', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b');
  });

  it('returns an empty string when everything is falsy', () => {
    expect(cn(false, null, undefined, '')).toBe('');
    expect(cn()).toBe('');
  });

  it('supports conditional class patterns', () => {
    const active = true;
    const disabled = false;
    expect(cn('btn', active && 'btn-active', disabled && 'btn-disabled'))
      .toBe('btn btn-active');
  });
});

describe('formatBRL', () => {
  it('formats integers with R$ + decimals', () => {
    // Intl inserts a NBSP between "R$" and digits; use a regex to tolerate.
    expect(formatBRL(1234)).toMatch(/^R\$\s*1\.234,00$/);
  });

  it('formats decimals with two places', () => {
    expect(formatBRL(18420.5)).toMatch(/^R\$\s*18\.420,50$/);
  });

  it('handles zero', () => {
    expect(formatBRL(0)).toMatch(/^R\$\s*0,00$/);
  });

  it('handles negatives', () => {
    expect(formatBRL(-99.9)).toMatch(/-?R\$\s*99,90$|-R\$\s*99,90$/);
  });
});

describe('formatDate', () => {
  it('formats an ISO string as DD/MM/YYYY', () => {
    expect(formatDate('2026-04-20T00:00:00Z')).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it('formats a Date instance', () => {
    const d = new Date('2026-04-20T00:00:00Z');
    expect(formatDate(d)).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it('pads single-digit days/months', () => {
    const out = formatDate('2026-01-05T12:00:00Z');
    expect(out).toMatch(/^05\/01\/2026$/);
  });
});
