import { describe, expect, it } from 'vitest';
import { validatePasswordChange, verifyActivationIdentity } from './account';

describe('verifyActivationIdentity', () => {
  it('matches on birthdate', () => {
    expect(
      verifyActivationIdentity(
        { birthdate: '1990-05-12', phone: '11999990000' },
        { birthdate: '1990-05-12' },
      ),
    ).toBe(true);
  });

  it('matches birthdate even when a datetime is provided (slices to date)', () => {
    expect(
      verifyActivationIdentity(
        { birthdate: '1990-05-12' },
        { birthdate: '1990-05-12T00:00:00.000Z' },
      ),
    ).toBe(true);
  });

  it('falls back to phone when the record has no birthdate', () => {
    expect(
      verifyActivationIdentity(
        { birthdate: null, phone: '(11) 98888-1111' },
        { phone: '11988881111' },
      ),
    ).toBe(true);
  });

  it('normalises phone punctuation/spacing on both sides', () => {
    expect(
      verifyActivationIdentity(
        { phone: '11 98888-1111' },
        { phone: '(11) 98888 1111' },
      ),
    ).toBe(true);
  });

  it('fails when neither factor matches', () => {
    expect(
      verifyActivationIdentity(
        { birthdate: '1990-05-12', phone: '11999990000' },
        { birthdate: '1991-01-01', phone: '11000000000' },
      ),
    ).toBe(false);
  });

  it('does not match on empty record fields', () => {
    expect(
      verifyActivationIdentity({ birthdate: null, phone: null }, { phone: '' }),
    ).toBe(false);
    expect(
      verifyActivationIdentity({ birthdate: '', phone: '' }, { birthdate: '' }),
    ).toBe(false);
  });

  it('rejects too-short phone numbers even if equal', () => {
    expect(
      verifyActivationIdentity({ phone: '123' }, { phone: '123' }),
    ).toBe(false);
  });

  it('birthdate mismatch with no phone provided fails', () => {
    expect(
      verifyActivationIdentity(
        { birthdate: '1990-05-12', phone: '11999990000' },
        { birthdate: '2000-01-01' },
      ),
    ).toBe(false);
  });
});

describe('validatePasswordChange', () => {
  it('accepts a valid change', () => {
    expect(validatePasswordChange('oldpass', 'newpass123')).toBeNull();
  });

  it('requires both passwords', () => {
    expect(validatePasswordChange('', 'newpass')).toMatch(/atual e a nova/);
    expect(validatePasswordChange('old', '')).toMatch(/atual e a nova/);
  });

  it('enforces a minimum length on the new password', () => {
    expect(validatePasswordChange('oldpass', '123')).toMatch(/pelo menos 6/);
  });

  it('rejects reusing the same password', () => {
    expect(validatePasswordChange('samepass', 'samepass')).toMatch(/diferente da atual/);
  });
});
