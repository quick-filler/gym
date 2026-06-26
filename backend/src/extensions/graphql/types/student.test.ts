/**
 * Unit tests for the `updateMyProfile` whitelist — the security boundary
 * that keeps a student from editing academy-owned fields (email, cpf,
 * academy, role, status, name) on their own profile.
 */

import { describe, expect, it } from 'vitest';
import { MY_PROFILE_FIELDS, pickProfileFields } from './student';

describe('pickProfileFields', () => {
  it('keeps only the whitelisted fields', () => {
    const out = pickProfileFields({
      phone: '11999990000',
      birthdate: '1990-05-12',
      gender: 'male',
      address: { city: 'SP' },
      photo: 'media_1',
      // forbidden:
      email: 'hacker@evil.com',
      cpf: '00000000000',
      academy: 'other_academy',
      role: 'academy_admin',
      status: 'active',
      name: 'New Name',
      user: 99,
    });
    expect(Object.keys(out).sort()).toEqual(
      [...MY_PROFILE_FIELDS].sort(),
    );
    expect(out.email).toBeUndefined();
    expect(out.role).toBeUndefined();
    expect(out.academy).toBeUndefined();
  });

  it('drops undefined keys so partial updates do not clobber', () => {
    const out = pickProfileFields({ phone: '11988887777' });
    expect(out).toEqual({ phone: '11988887777' });
  });

  it('keeps explicit nulls (caller can clear a field)', () => {
    const out = pickProfileFields({ phone: null });
    expect(out).toHaveProperty('phone', null);
  });

  it('returns an empty object for no editable input', () => {
    expect(pickProfileFields({ email: 'x@y.com' })).toEqual({});
  });
});
