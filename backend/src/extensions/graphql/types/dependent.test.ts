import { describe, expect, it } from 'vitest';
import { pickDependentFields, MY_DEPENDENT_FIELDS } from './dependent';

describe('pickDependentFields', () => {
  it('keeps only whitelisted, guardian-editable fields', () => {
    const out = pickDependentFields({
      name: 'Sofia',
      birthdate: '2018-03-12',
      relationship: 'filha',
      bloodType: 'A+',
      // non-editable / forced server-side — must be dropped:
      guardian: 'someGuardianDoc',
      academy: 'someAcademyDoc',
      status: 'inactive',
      enrollments: [{ id: 1 }],
      documentId: 'x',
    });
    expect(out).toEqual({
      name: 'Sofia',
      birthdate: '2018-03-12',
      relationship: 'filha',
      bloodType: 'A+',
    });
    expect(out).not.toHaveProperty('guardian');
    expect(out).not.toHaveProperty('academy');
    expect(out).not.toHaveProperty('status');
    expect(out).not.toHaveProperty('enrollments');
  });

  it('drops undefined keys but keeps explicit null (clears a field)', () => {
    const out = pickDependentFields({ name: 'Pedro', cpf: null, gender: undefined });
    expect(out).toEqual({ name: 'Pedro', cpf: null });
    expect(out).not.toHaveProperty('gender');
  });

  it('normalizes a datetime birthdate down to yyyy-mm-dd', () => {
    const out = pickDependentFields({ birthdate: '2018-03-12T00:00:00.000Z' });
    expect(out.birthdate).toBe('2018-03-12');
  });

  it('returns an empty object when no editable field is present', () => {
    expect(pickDependentFields({ guardian: 'g', status: 'active' })).toEqual({});
    expect(pickDependentFields(null)).toEqual({});
  });

  it('whitelist excludes the security-sensitive fields', () => {
    expect(MY_DEPENDENT_FIELDS).not.toContain('guardian');
    expect(MY_DEPENDENT_FIELDS).not.toContain('academy');
    expect(MY_DEPENDENT_FIELDS).not.toContain('status');
  });
});
