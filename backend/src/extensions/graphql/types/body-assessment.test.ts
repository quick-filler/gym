/**
 * Unit tests for BodyAssessment pure helpers — BMI math (with the cm/m
 * heuristic) and the newest-first sort the student queries rely on.
 */

import { describe, expect, it } from 'vitest';
import { computeBMI, sortAssessmentsDesc } from './body-assessment';

describe('computeBMI', () => {
  it('computes BMI for height in metres', () => {
    expect(computeBMI(80, 1.78)).toBe(25.2);
  });

  it('treats height > 3 as centimetres', () => {
    expect(computeBMI(80, 178)).toBe(25.2);
  });

  it('returns null for missing or invalid inputs', () => {
    expect(computeBMI(null, 1.78)).toBeNull();
    expect(computeBMI(80, 0)).toBeNull();
    expect(computeBMI(0, 1.78)).toBeNull();
    expect(computeBMI(undefined, undefined)).toBeNull();
  });
});

describe('sortAssessmentsDesc', () => {
  it('orders newest first by date', () => {
    const out = sortAssessmentsDesc([
      { date: '2026-01-15' },
      { date: '2026-03-15' },
      { date: '2026-02-15' },
    ]);
    expect(out.map((a) => a.date)).toEqual(['2026-03-15', '2026-02-15', '2026-01-15']);
  });

  it('does not mutate the input', () => {
    const input = [{ date: '2026-01-01' }, { date: '2026-02-01' }];
    sortAssessmentsDesc(input);
    expect(input[0].date).toBe('2026-01-01');
  });

  it('tolerates empty / missing dates', () => {
    expect(sortAssessmentsDesc([]).length).toBe(0);
    const out = sortAssessmentsDesc([{ date: null }, { date: '2026-01-01' }]);
    expect(out[0].date).toBe('2026-01-01');
  });
});
