/**
 * Unit tests for the tenancy helpers.
 *
 * The scope filters (`with*Scope`) are pure shape-builders, so we assert
 * the exact filter structure they emit. The auth helpers are async and
 * touch strapi.documents — they're covered by integration tests against
 * a live backend in tests/integration/graphql.test.ts.
 */

import { describe, expect, it } from 'vitest';
import {
  isModuleEnabled,
  withAcademyScope,
  withBookingScope,
  withPaymentScope,
  withStudentScope,
  withWorkoutPlanScope,
} from './helpers';

const ACADEMY = 'abc-123';
const NO_ACADEMY = '__none__';

describe('withAcademyScope', () => {
  it('attaches the academy filter and preserves existing fields', () => {
    expect(withAcademyScope({ isActive: true }, ACADEMY)).toEqual({
      isActive: true,
      academy: { documentId: ACADEMY },
    });
  });

  it('falls back to the impossible sentinel when academyId is null', () => {
    expect(withAcademyScope({}, null)).toEqual({
      academy: { documentId: NO_ACADEMY },
    });
  });

  it('does not mutate the caller filters object', () => {
    const filters = { foo: 'bar' };
    const out = withAcademyScope(filters, ACADEMY);
    expect(filters).toEqual({ foo: 'bar' });
    expect(out).not.toBe(filters);
  });
});

describe('withPaymentScope', () => {
  it('emits the $or covering enrollment-backed and ad-hoc charges for both student and dependent', () => {
    expect(withPaymentScope(ACADEMY)).toEqual({
      $or: [
        { enrollment: { student: { academy: { documentId: ACADEMY } } } },
        { enrollment: { dependent: { academy: { documentId: ACADEMY } } } },
        { student: { academy: { documentId: ACADEMY } } },
        { dependent: { academy: { documentId: ACADEMY } } },
      ],
    });
  });

  it('uses the sentinel when academyId is null', () => {
    expect(withPaymentScope(null)).toEqual({
      $or: [
        { enrollment: { student: { academy: { documentId: NO_ACADEMY } } } },
        { enrollment: { dependent: { academy: { documentId: NO_ACADEMY } } } },
        { student: { academy: { documentId: NO_ACADEMY } } },
        { dependent: { academy: { documentId: NO_ACADEMY } } },
      ],
    });
  });
});

describe('withStudentScope', () => {
  it('emits $or matching student.academy or dependent.academy', () => {
    expect(withStudentScope({ status: 'active' }, ACADEMY)).toEqual({
      status: 'active',
      $or: [
        { student: { academy: { documentId: ACADEMY } } },
        { dependent: { academy: { documentId: ACADEMY } } },
      ],
    });
  });

  it('uses the sentinel when academyId is null', () => {
    expect(withStudentScope({}, null)).toMatchObject({
      $or: [
        { student: { academy: { documentId: NO_ACADEMY } } },
        { dependent: { academy: { documentId: NO_ACADEMY } } },
      ],
    });
  });
});

describe('withBookingScope', () => {
  it('emits $or covering student, dependent, and classSchedule academies', () => {
    expect(withBookingScope({}, ACADEMY)).toEqual({
      $or: [
        { student: { academy: { documentId: ACADEMY } } },
        { dependent: { academy: { documentId: ACADEMY } } },
        { classSchedule: { academy: { documentId: ACADEMY } } },
      ],
    });
  });

  it('uses the sentinel when academyId is null', () => {
    expect(withBookingScope({}, null)).toMatchObject({
      $or: [
        { student: { academy: { documentId: NO_ACADEMY } } },
        { dependent: { academy: { documentId: NO_ACADEMY } } },
        { classSchedule: { academy: { documentId: NO_ACADEMY } } },
      ],
    });
  });
});

describe('withWorkoutPlanScope', () => {
  it('emits $or matching the manyToMany students roster or the dependent', () => {
    expect(withWorkoutPlanScope({ isActive: true }, ACADEMY)).toEqual({
      isActive: true,
      $or: [
        { students: { academy: { documentId: ACADEMY } } },
        { dependent: { academy: { documentId: ACADEMY } } },
      ],
    });
  });

  it('uses the sentinel when academyId is null', () => {
    expect(withWorkoutPlanScope({}, null)).toMatchObject({
      $or: [
        { students: { academy: { documentId: NO_ACADEMY } } },
        { dependent: { academy: { documentId: NO_ACADEMY } } },
      ],
    });
  });
});

describe('isModuleEnabled', () => {
  it('treats null/undefined enabledModules as "all on" (never configured)', () => {
    expect(isModuleEnabled(null, 'workouts')).toBe(true);
    expect(isModuleEnabled(undefined, 'classes')).toBe(true);
    expect(isModuleEnabled(null, 'pool')).toBe(true);
  });

  it('enables only the listed modules once configured', () => {
    expect(isModuleEnabled(['pool'], 'pool')).toBe(true);
    expect(isModuleEnabled(['pool'], 'workouts')).toBe(false);
    expect(isModuleEnabled(['pool'], 'classes')).toBe(false);
    expect(isModuleEnabled(['pool'], 'dependents')).toBe(false);
  });

  it('an empty array disables everything (explicitly nothing enabled)', () => {
    expect(isModuleEnabled([], 'workouts')).toBe(false);
    expect(isModuleEnabled([], 'pool')).toBe(false);
  });

  it('handles multiple enabled modules', () => {
    const mods = ['workouts', 'classes'];
    expect(isModuleEnabled(mods, 'workouts')).toBe(true);
    expect(isModuleEnabled(mods, 'classes')).toBe(true);
    expect(isModuleEnabled(mods, 'pool')).toBe(false);
    expect(isModuleEnabled(mods, 'dependents')).toBe(false);
  });
});
