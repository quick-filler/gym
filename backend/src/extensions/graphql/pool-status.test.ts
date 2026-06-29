import { describe, expect, it } from 'vitest';
import {
  classify,
  computePoolStatus,
  displayStatus,
  inspectionSortKey,
  pickLatestInspection,
  worst,
} from './pool-status';

// Defaults mirror the Brazilian-legislation seed: pH 7.2–7.8, chlorine 1–3,
// temp 28–31, tolerance 0.2.
const SETTINGS = {
  phMin: 7.2,
  phMax: 7.8,
  chlorineMin: 1,
  chlorineMax: 3,
  temperatureMin: 28,
  temperatureMax: 31,
  alertTolerance: 0.2,
};

describe('classify', () => {
  it('returns ok inside the ideal range (inclusive)', () => {
    expect(classify(7.4, 7.2, 7.8, 0.2)).toBe('ok');
    expect(classify(7.2, 7.2, 7.8, 0.2)).toBe('ok');
    expect(classify(7.8, 7.2, 7.8, 0.2)).toBe('ok');
  });

  it('returns warning just outside the range but within tolerance', () => {
    expect(classify(7.1, 7.2, 7.8, 0.2)).toBe('warning');
    expect(classify(7.9, 7.2, 7.8, 0.2)).toBe('warning');
    expect(classify(7.0, 7.2, 7.8, 0.2)).toBe('warning'); // exactly min - tol
  });

  it('returns critical beyond the tolerance band', () => {
    expect(classify(6.8, 7.2, 7.8, 0.2)).toBe('critical');
    expect(classify(8.1, 7.2, 7.8, 0.2)).toBe('critical');
  });

  it('treats null value or bounds as ok (a missing metric never degrades)', () => {
    expect(classify(null, 7.2, 7.8, 0.2)).toBe('ok');
    expect(classify(undefined, 7.2, 7.8, 0.2)).toBe('ok');
    expect(classify(6.0, null, 7.8, 0.2)).toBe('ok');
  });
});

describe('worst', () => {
  it('returns the most severe status', () => {
    expect(worst('ok', 'ok', 'ok')).toBe('ok');
    expect(worst('ok', 'warning', 'ok')).toBe('warning');
    expect(worst('warning', 'critical', 'ok')).toBe('critical');
  });
});

describe('displayStatus', () => {
  it('surfaces unknown for an unmeasured metric (not ok)', () => {
    expect(displayStatus(null, 7.2, 7.8, 0.2)).toBe('unknown');
    expect(displayStatus(undefined, 7.2, 7.8, 0.2)).toBe('unknown');
  });

  it('matches classify for measured values', () => {
    expect(displayStatus(7.4, 7.2, 7.8, 0.2)).toBe('ok');
    expect(displayStatus(7.1, 7.2, 7.8, 0.2)).toBe('warning');
    expect(displayStatus(6.8, 7.2, 7.8, 0.2)).toBe('critical');
  });
});

describe('inspectionSortKey / pickLatestInspection', () => {
  it('ranks evening above morning on the same date (lexical string order)', () => {
    const evening = inspectionSortKey({ date: '2026-06-29', shift: 'evening' });
    const morning = inspectionSortKey({ date: '2026-06-29', shift: 'morning' });
    expect(evening > morning).toBe(true);
  });

  it('returns null for an empty list', () => {
    expect(pickLatestInspection([])).toBeNull();
    expect(pickLatestInspection(null)).toBeNull();
  });

  it('picks the most recent date, evening over morning', () => {
    const rows = [
      { date: '2026-06-28', shift: 'evening', ph: 1 },
      { date: '2026-06-29', shift: 'morning', ph: 2 },
      { date: '2026-06-29', shift: 'evening', ph: 3 },
    ];
    expect(pickLatestInspection(rows)?.ph).toBe(3);
  });

  it('falls back to morning when evening is not yet recorded', () => {
    const rows = [
      { date: '2026-06-28', shift: 'evening', ph: 1 },
      { date: '2026-06-29', shift: 'morning', ph: 2 },
    ];
    expect(pickLatestInspection(rows)?.ph).toBe(2);
  });
});

describe('computePoolStatus', () => {
  it('grades each metric and the worst-of-three overall', () => {
    const view = computePoolStatus(SETTINGS, {
      date: '2026-06-29',
      shift: 'evening',
      scheduledTime: '18:00',
      ph: 7.4, // ok
      chlorine: 0.9, // warning (within tol of min 1)
      temperature: 26, // critical (well below 28)
      peopleCount: 12,
      createdAt: '2026-06-29T21:00:00.000Z',
    });

    expect(view.ph.status).toBe('ok');
    expect(view.chlorine.status).toBe('warning');
    expect(view.temperature.status).toBe('critical');
    expect(view.overall).toBe('critical');
    expect(view.ph.min).toBe(7.2);
    expect(view.ph.max).toBe(7.8);
    expect(view.measuredAt).toBe('2026-06-29T21:00:00.000Z');
    expect(view.peopleCount).toBe(12);
  });

  it('marks unmeasured metrics unknown without degrading overall', () => {
    const view = computePoolStatus(SETTINGS, {
      date: '2026-06-29',
      shift: 'morning',
      ph: 7.5, // ok
      chlorine: null,
      temperature: undefined,
    });
    expect(view.ph.status).toBe('ok');
    expect(view.chlorine.status).toBe('unknown');
    expect(view.temperature.status).toBe('unknown');
    expect(view.overall).toBe('ok');
  });

  it('handles null settings (academy never configured) — all metrics unknown', () => {
    const view = computePoolStatus(null, {
      date: '2026-06-29',
      shift: 'morning',
      ph: 7.5,
      chlorine: 2,
      temperature: 29,
    });
    // No ranges → classify returns ok (no bounds), display value present
    expect(view.ph.min).toBeNull();
    expect(view.overall).toBe('ok');
  });
});
