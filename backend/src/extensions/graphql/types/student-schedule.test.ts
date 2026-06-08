import { describe, expect, it } from 'vitest';
import {
  addDaysISO,
  classStartInstant,
  decideBookingStatus,
  isISODate,
  isWithinBookingWindow,
  isWithinCancelWindow,
  mondayOfWeek,
  timeToMinutes,
  weekdayOfISO,
} from './student-schedule';

describe('weekdayOfISO', () => {
  it('maps known calendar dates to weekdays (0=Sun..6=Sat)', () => {
    expect(weekdayOfISO('2026-06-08')).toBe(1); // Monday
    expect(weekdayOfISO('2026-06-07')).toBe(0); // Sunday
    expect(weekdayOfISO('2026-06-13')).toBe(6); // Saturday
  });

  it('is TZ-stable (uses UTC, not the host TZ)', () => {
    // Same calendar date must yield the same weekday regardless of host TZ.
    expect(weekdayOfISO('2026-01-01')).toBe(4); // Thursday
  });
});

describe('addDaysISO', () => {
  it('adds and subtracts days across month boundaries', () => {
    expect(addDaysISO('2026-06-08', 1)).toBe('2026-06-09');
    expect(addDaysISO('2026-06-30', 1)).toBe('2026-07-01');
    expect(addDaysISO('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('crosses a leap-year February correctly', () => {
    expect(addDaysISO('2028-02-28', 1)).toBe('2028-02-29');
  });
});

describe('mondayOfWeek', () => {
  it('snaps any day to the Monday of its ISO week', () => {
    expect(mondayOfWeek('2026-06-08')).toBe('2026-06-08'); // Mon → itself
    expect(mondayOfWeek('2026-06-10')).toBe('2026-06-08'); // Wed → Mon
    expect(mondayOfWeek('2026-06-14')).toBe('2026-06-08'); // Sun → prev Mon
    expect(mondayOfWeek('2026-06-13')).toBe('2026-06-08'); // Sat → Mon
  });
});

describe('isISODate', () => {
  it('accepts strict yyyy-mm-dd', () => {
    expect(isISODate('2026-06-08')).toBe(true);
  });
  it('rejects junk, partials, and non-strings', () => {
    expect(isISODate('2026-6-8')).toBe(false);
    expect(isISODate('08/06/2026')).toBe(false);
    expect(isISODate('')).toBe(false);
    expect(isISODate(null)).toBe(false);
    expect(isISODate(undefined)).toBe(false);
    expect(isISODate('2026-13-40')).toBe(false);
  });
});

describe('classStartInstant', () => {
  it('builds a BRT (-03:00) instant from date + HH:MM', () => {
    const t = classStartInstant('2026-06-08', '18:00');
    // 18:00 BRT == 21:00 UTC
    expect(t?.toISOString()).toBe('2026-06-08T21:00:00.000Z');
  });
  it('tolerates HH:MM:SS', () => {
    const t = classStartInstant('2026-06-08', '06:30:00');
    expect(t?.toISOString()).toBe('2026-06-08T09:30:00.000Z');
  });
  it('returns null on missing/invalid time or date', () => {
    expect(classStartInstant('2026-06-08', null)).toBeNull();
    expect(classStartInstant('2026-06-08', 'manhã')).toBeNull();
    expect(classStartInstant('bad', '18:00')).toBeNull();
  });
});

describe('isWithinBookingWindow (closes 1h before start)', () => {
  const start = new Date('2026-06-08T21:00:00.000Z'); // 18:00 BRT
  it('allows when more than 1h before start', () => {
    expect(isWithinBookingWindow(new Date('2026-06-08T19:30:00Z'), start)).toBe(true);
  });
  it('allows exactly at the 1h boundary', () => {
    expect(isWithinBookingWindow(new Date('2026-06-08T20:00:00Z'), start)).toBe(true);
  });
  it('rejects inside the last hour', () => {
    expect(isWithinBookingWindow(new Date('2026-06-08T20:30:00Z'), start)).toBe(false);
  });
  it('rejects after start and when start is null', () => {
    expect(isWithinBookingWindow(new Date('2026-06-08T21:30:00Z'), start)).toBe(false);
    expect(isWithinBookingWindow(new Date(), null)).toBe(false);
  });
});

describe('isWithinCancelWindow (closes 24h before start)', () => {
  const start = new Date('2026-06-08T21:00:00.000Z');
  it('allows more than 24h before', () => {
    expect(isWithinCancelWindow(new Date('2026-06-07T10:00:00Z'), start)).toBe(true);
  });
  it('allows exactly at the 24h boundary', () => {
    expect(isWithinCancelWindow(new Date('2026-06-07T21:00:00Z'), start)).toBe(true);
  });
  it('rejects inside the last 24h', () => {
    expect(isWithinCancelWindow(new Date('2026-06-08T10:00:00Z'), start)).toBe(false);
  });
  it('never blocks when start is null', () => {
    expect(isWithinCancelWindow(new Date(), null)).toBe(true);
  });
});

describe('decideBookingStatus', () => {
  it('confirms while seats remain', () => {
    expect(decideBookingStatus(0, 10)).toBe('confirmed');
    expect(decideBookingStatus(9, 10)).toBe('confirmed');
  });
  it('waitlists once full', () => {
    expect(decideBookingStatus(10, 10)).toBe('waitlist');
    expect(decideBookingStatus(11, 10)).toBe('waitlist');
  });
  it('always confirms with unlimited capacity (null)', () => {
    expect(decideBookingStatus(999, null)).toBe('confirmed');
  });
});

describe('timeToMinutes', () => {
  it('parses HH:MM', () => {
    expect(timeToMinutes('06:30')).toBe(390);
    expect(timeToMinutes('00:00')).toBe(0);
    expect(timeToMinutes('23:59')).toBe(1439);
  });
  it('returns 0 on bad input', () => {
    expect(timeToMinutes(null)).toBe(0);
    expect(timeToMinutes(undefined)).toBe(0);
    expect(timeToMinutes('abc')).toBe(0);
  });
});
