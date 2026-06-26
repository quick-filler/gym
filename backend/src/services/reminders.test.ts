import { describe, expect, it } from 'vitest';
import {
  brtClockPlus,
  chargeReminderKind,
  startsWithinMinutes,
} from './reminders';

describe('brtClockPlus', () => {
  it('returns BRT HH:MM offset by minutes (UTC-3)', () => {
    const noonUtc = new Date('2026-06-26T13:00:00Z'); // 10:00 BRT
    expect(brtClockPlus(noonUtc, 0)).toBe('10:00');
    expect(brtClockPlus(noonUtc, 65)).toBe('11:05');
  });
});

describe('chargeReminderKind', () => {
  const today = '2026-06-26';
  it('flags 3 days before', () => {
    expect(chargeReminderKind('2026-06-29', today)).toBe('due_3');
  });
  it('flags 1 day before', () => {
    expect(chargeReminderKind('2026-06-27', today)).toBe('due_1');
  });
  it('is null for other distances (today, 2 days, far, past)', () => {
    expect(chargeReminderKind('2026-06-26', today)).toBeNull();
    expect(chargeReminderKind('2026-06-28', today)).toBeNull();
    expect(chargeReminderKind('2026-07-26', today)).toBeNull();
    expect(chargeReminderKind('2026-06-20', today)).toBeNull();
  });
  it('is null for empty due date', () => {
    expect(chargeReminderKind(null, today)).toBeNull();
    expect(chargeReminderKind(undefined, today)).toBeNull();
  });
  it('handles month boundary', () => {
    expect(chargeReminderKind('2026-07-01', '2026-06-28')).toBe('due_3');
  });
});

describe('startsWithinMinutes', () => {
  const now = new Date('2026-06-26T10:00:00Z');
  it('true when start is within the window (future)', () => {
    expect(startsWithinMinutes(new Date('2026-06-26T10:45:00Z'), now, 60)).toBe(true);
    expect(startsWithinMinutes(new Date('2026-06-26T11:00:00Z'), now, 60)).toBe(true);
  });
  it('false when start is past or now', () => {
    expect(startsWithinMinutes(new Date('2026-06-26T09:59:00Z'), now, 60)).toBe(false);
    expect(startsWithinMinutes(new Date('2026-06-26T10:00:00Z'), now, 60)).toBe(false);
  });
  it('false when start is beyond the window', () => {
    expect(startsWithinMinutes(new Date('2026-06-26T11:01:00Z'), now, 60)).toBe(false);
  });
  it('false for null start', () => {
    expect(startsWithinMinutes(null, now, 60)).toBe(false);
  });
});
