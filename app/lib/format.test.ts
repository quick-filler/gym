import { describe, expect, it, beforeAll, afterAll, vi } from 'vitest';
import {
  addDaysISO,
  ageFrom,
  brDateToISO,
  brl,
  brlAmount,
  buildWeekDays,
  fmtDateBR,
  hhmm,
  mondayOfWeekISO,
  monthlyBRL,
  nextClassTimeLabel,
  weekdayIndexISO,
} from './format';

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

describe('brl / brlAmount', () => {
  it('formats with two decimals and the symbol', () => {
    expect(brl(99)).toBe('R$ 99,00');
    expect(brl(99.9)).toBe('R$ 99,90');
    expect(brl(1499.5)).toBe('R$ 1.499,50');
  });

  it('brlAmount drops the symbol', () => {
    expect(brlAmount(99)).toBe('99,00');
    expect(brlAmount(1499.5)).toBe('1.499,50');
  });

  it('treats null/undefined as zero', () => {
    expect(brl(null)).toBe('R$ 0,00');
    expect(brlAmount(undefined)).toBe('0,00');
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

describe('hhmm', () => {
  it('trims a Strapi Time scalar to HH:mm', () => {
    expect(hhmm('18:00:00.000')).toBe('18:00');
    expect(hhmm('07:30:00.000')).toBe('07:30');
  });

  it('returns "" for empty / invalid input', () => {
    expect(hhmm('')).toBe('');
    expect(hhmm(null)).toBe('');
    expect(hhmm(undefined)).toBe('');
  });
});

describe('nextClassTimeLabel', () => {
  const NOW = new Date(2026, 3, 20, 10, 0, 0); // 2026-04-20 local

  it('labels a class today as "Hoje"', () => {
    expect(
      nextClassTimeLabel('2026-04-20', '18:00:00.000', '19:00:00.000', NOW),
    ).toBe('Hoje · 18:00 → 19:00');
  });

  it('labels a class tomorrow as "Amanhã"', () => {
    expect(
      nextClassTimeLabel('2026-04-21', '07:00:00.000', '08:00:00.000', NOW),
    ).toBe('Amanhã · 07:00 → 08:00');
  });

  it('labels a future class as DD/MM', () => {
    expect(
      nextClassTimeLabel('2026-06-12', '19:00:00.000', null, NOW),
    ).toBe('12/06 · 19:00');
  });

  it('returns "" when date is missing', () => {
    expect(nextClassTimeLabel(null, '18:00', '19:00', NOW)).toBe('');
  });

  it('drops the time when start is missing', () => {
    expect(nextClassTimeLabel('2026-04-20', null, null, NOW)).toBe('Hoje');
  });
});

describe('brDateToISO', () => {
  it('converts DD/MM/YYYY to ISO', () => {
    expect(brDateToISO('12/03/2018')).toBe('2018-03-12');
  });

  it('passes through an ISO date', () => {
    expect(brDateToISO('2018-03-12')).toBe('2018-03-12');
    expect(brDateToISO('2018-03-12T00:00:00.000Z')).toBe('2018-03-12');
  });

  it('returns "" for empty / invalid input', () => {
    expect(brDateToISO('')).toBe('');
    expect(brDateToISO(null)).toBe('');
    expect(brDateToISO('notadate')).toBe('');
    expect(brDateToISO('3/3/18')).toBe('');
  });
});

describe('weekdayIndexISO', () => {
  it('maps dates to weekday (0=Sun..6=Sat), TZ-safe', () => {
    expect(weekdayIndexISO('2026-06-08')).toBe(1); // Monday
    expect(weekdayIndexISO('2026-06-07')).toBe(0); // Sunday
    expect(weekdayIndexISO('2026-06-13')).toBe(6); // Saturday
  });
});

describe('addDaysISO', () => {
  it('adds and subtracts across boundaries', () => {
    expect(addDaysISO('2026-06-30', 1)).toBe('2026-07-01');
    expect(addDaysISO('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('mondayOfWeekISO', () => {
  it('snaps any day to its ISO-week Monday', () => {
    expect(mondayOfWeekISO('2026-06-10')).toBe('2026-06-08'); // Wed → Mon
    expect(mondayOfWeekISO('2026-06-14')).toBe('2026-06-08'); // Sun → Mon
    expect(mondayOfWeekISO('2026-06-08')).toBe('2026-06-08'); // Mon → itself
  });
});

describe('buildWeekDays', () => {
  it('builds 7 labelled days from a Monday, flagging today', () => {
    const days = buildWeekDays('2026-06-08', '2026-06-10');
    expect(days).toHaveLength(7);
    expect(days[0]).toMatchObject({
      id: '2026-06-08',
      weekdayShort: 'SEG',
      dayNumber: '08',
      fullTitle: 'Segunda-feira',
      fullSubtitle: '8 de junho, 2026',
      isToday: false,
    });
    expect(days[2]).toMatchObject({ id: '2026-06-10', isToday: true }); // Wed
    expect(days[6].id).toBe('2026-06-14'); // Sunday
    expect(days[6].weekdayShort).toBe('DOM');
  });
});
