import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PREFS,
  kindToCategory,
  pushAllowed,
  resolvePrefs,
  sanitizePrefsInput,
} from './notification-prefs';

describe('resolvePrefs', () => {
  it('defaults everything on for null/empty', () => {
    expect(resolvePrefs(null)).toEqual(DEFAULT_PREFS);
    expect(resolvePrefs(undefined)).toEqual(DEFAULT_PREFS);
    expect(resolvePrefs({})).toEqual(DEFAULT_PREFS);
  });

  it('only an explicit false turns a category off', () => {
    expect(resolvePrefs({ payments: false })).toEqual({
      payments: false,
      classes: true,
      workouts: true,
    });
  });

  it('ignores unknown keys and keeps the rest on', () => {
    expect(resolvePrefs({ bogus: false, classes: false })).toEqual({
      payments: true,
      classes: false,
      workouts: true,
    });
  });
});

describe('sanitizePrefsInput', () => {
  it('keeps only known boolean categories', () => {
    expect(
      sanitizePrefsInput({ payments: false, classes: true, bogus: true, workouts: "no" }),
    ).toEqual({ payments: false, classes: true });
  });
  it('returns empty for junk', () => {
    expect(sanitizePrefsInput(null)).toEqual({});
    expect(sanitizePrefsInput({ x: 1 })).toEqual({});
  });
});

describe('kindToCategory', () => {
  it('maps known kinds', () => {
    expect(kindToCategory('payment_due')).toBe('payments');
    expect(kindToCategory('payment_paid')).toBe('payments');
    expect(kindToCategory('booking_confirmed')).toBe('classes');
    expect(kindToCategory('class_reminder')).toBe('classes');
    expect(kindToCategory('workout_new')).toBe('workouts');
  });
  it('returns null for admin/unknown kinds', () => {
    expect(kindToCategory('admin_booking')).toBeNull();
    expect(kindToCategory('whatever')).toBeNull();
  });
});

describe('pushAllowed', () => {
  it('blocks a push when its category is off', () => {
    const prefs = { payments: false, classes: true, workouts: true };
    expect(pushAllowed(prefs, 'payment_due')).toBe(false);
    expect(pushAllowed(prefs, 'class_reminder')).toBe(true);
  });
  it('always allows uncategorized / admin / missing kinds', () => {
    expect(pushAllowed({ payments: false, classes: false, workouts: false }, 'admin_booking')).toBe(true);
    expect(pushAllowed(DEFAULT_PREFS, undefined)).toBe(true);
  });
});
