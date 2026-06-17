import { describe, expect, it } from 'vitest';
import {
  computeDurationMinutes,
  computeStreak,
  isoDateBR,
  partitionWorkoutPlans,
  seedExercisesCompleted,
  summarizeStats,
} from './workout-session';

describe('computeDurationMinutes', () => {
  it('floors the gap to whole minutes', () => {
    expect(
      computeDurationMinutes('2026-06-17T10:00:00Z', '2026-06-17T10:52:30Z'),
    ).toBe(52);
  });

  it('accepts Date instances', () => {
    expect(
      computeDurationMinutes(new Date('2026-06-17T10:00:00Z'), new Date('2026-06-17T11:00:00Z')),
    ).toBe(60);
  });

  it('never goes negative and tolerates missing/invalid input', () => {
    expect(computeDurationMinutes('2026-06-17T11:00:00Z', '2026-06-17T10:00:00Z')).toBe(0);
    expect(computeDurationMinutes(null, '2026-06-17T10:00:00Z')).toBe(0);
    expect(computeDurationMinutes('2026-06-17T10:00:00Z', undefined)).toBe(0);
    expect(computeDurationMinutes('nope', '2026-06-17T10:00:00Z')).toBe(0);
  });
});

describe('isoDateBR', () => {
  it('maps an instant to the São Paulo calendar date', () => {
    // 02:00Z on the 18th is still 23:00 on the 17th in BRT (-03:00).
    expect(isoDateBR('2026-06-18T02:00:00Z')).toBe('2026-06-17');
    expect(isoDateBR('2026-06-17T12:00:00Z')).toBe('2026-06-17');
  });

  it('returns "" for invalid input', () => {
    expect(isoDateBR('not-a-date')).toBe('');
  });
});

describe('computeStreak', () => {
  it('counts consecutive days ending today', () => {
    const dates = new Set(['2026-06-17', '2026-06-16', '2026-06-15']);
    expect(computeStreak(dates, '2026-06-17')).toBe(3);
  });

  it('still counts a streak that ends yesterday (not trained today yet)', () => {
    const dates = new Set(['2026-06-16', '2026-06-15']);
    expect(computeStreak(dates, '2026-06-17')).toBe(2);
  });

  it('returns 0 when neither today nor yesterday has a session', () => {
    const dates = new Set(['2026-06-14', '2026-06-13']);
    expect(computeStreak(dates, '2026-06-17')).toBe(0);
  });

  it('stops at the first gap', () => {
    const dates = new Set(['2026-06-17', '2026-06-16', '2026-06-14']);
    expect(computeStreak(dates, '2026-06-17')).toBe(2);
  });
});

describe('summarizeStats', () => {
  // 2026-06-17 is a Wednesday; ISO week is Mon 06-15 .. Sun 06-21.
  it('counts this week, last 30 days and the streak', () => {
    const dates = [
      '2026-06-17', // today (week + 30d + streak)
      '2026-06-16', // this week + streak
      '2026-06-15', // monday, this week + streak
      '2026-06-10', // last 30d only
      '2026-05-20', // last 30d edge (>= 05-19)
      '2026-04-01', // older — ignored
    ];
    expect(summarizeStats(dates, '2026-06-17')).toEqual({
      thisWeekCount: 3,
      thirtyDaysCount: 5,
      streakDays: 3,
    });
  });

  it('drops malformed dates', () => {
    expect(summarizeStats(['', 'bad', '2026-06-17'], '2026-06-17')).toEqual({
      thisWeekCount: 1,
      thirtyDaysCount: 1,
      streakDays: 1,
    });
  });
});

describe('partitionWorkoutPlans', () => {
  const today = '2026-06-17';

  it('picks the most recent live plan as active, rest as upcoming', () => {
    const plans = [
      { id: 'a', validFrom: '2026-06-01', validTo: null, isActive: true },
      { id: 'b', validFrom: '2026-06-10', validTo: null, isActive: true },
      { id: 'c', validFrom: '2026-05-01', validTo: '2026-05-31', isActive: true },
    ];
    const { active, upcoming } = partitionWorkoutPlans(plans, today);
    expect(active?.id).toBe('b'); // latest validFrom, still covering today
    expect(upcoming.map((p) => p.id)).toEqual(['a', 'c']);
  });

  it('treats isActive:false as not-active', () => {
    const plans = [{ id: 'x', validFrom: null, validTo: null, isActive: false }];
    const { active, upcoming } = partitionWorkoutPlans(plans, today);
    expect(active).toBeNull();
    expect(upcoming.map((p) => p.id)).toEqual(['x']);
  });

  it('excludes plans whose window does not cover today', () => {
    const plans = [
      { id: 'past', validFrom: '2026-01-01', validTo: '2026-01-31', isActive: true },
      { id: 'future', validFrom: '2026-12-01', validTo: null, isActive: true },
    ];
    const { active } = partitionWorkoutPlans(plans, today);
    expect(active).toBeNull();
  });

  it('returns null active / empty upcoming for no plans', () => {
    expect(partitionWorkoutPlans([], today)).toEqual({ active: null, upcoming: [] });
  });
});

describe('seedExercisesCompleted', () => {
  it('maps plan exercises into an unchecked checklist', () => {
    const seeded = seedExercisesCompleted([
      { name: 'Supino reto', sets: 4, reps: 12, load: '60 kg' },
      { name: 'Crucifixo', sets: 3, reps: 15 },
    ]);
    expect(seeded).toEqual([
      { name: 'Supino reto', sets: 4, reps: 12, load: '60 kg', completed: false },
      { name: 'Crucifixo', sets: 3, reps: 15, load: null, completed: false },
    ]);
  });

  it('returns [] for non-array input', () => {
    expect(seedExercisesCompleted(null)).toEqual([]);
    expect(seedExercisesCompleted(undefined)).toEqual([]);
  });
});
