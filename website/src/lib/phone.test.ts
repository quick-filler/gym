import { describe, expect, it } from 'vitest';
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  digitsOnly,
  findCountry,
  formatDisplay,
  formatPhoneForDisplay,
  parseStoredPhone,
  toStored,
} from './phone';

describe('digitsOnly', () => {
  it('strips non-digit characters', () => {
    expect(digitsOnly('+55 (11) 99999-9999')).toBe('5511999999999');
    expect(digitsOnly('abc123')).toBe('123');
    expect(digitsOnly('')).toBe('');
  });
});

describe('findCountry', () => {
  it('defaults to Brazil', () => {
    expect(findCountry(undefined)).toBe(DEFAULT_COUNTRY);
    expect(findCountry('').code).toBe('BR');
    expect(findCountry('ZZ').code).toBe('BR');
  });

  it('finds known codes', () => {
    expect(findCountry('US').dial).toBe('1');
    expect(findCountry('PT').dial).toBe('351');
  });
});

describe('Brazil formatter', () => {
  const BR = COUNTRIES.find((c) => c.code === 'BR')!;

  it('formats mobile (11 digits)', () => {
    expect(BR.format('11999999999')).toBe('(11) 99999-9999');
  });

  it('formats landline (10 digits)', () => {
    expect(BR.format('1133334444')).toBe('(11) 3333-4444');
  });

  it('progressively adds separators as user types', () => {
    expect(BR.format('')).toBe('');
    expect(BR.format('1')).toBe('(1');
    expect(BR.format('11')).toBe('(11');
    expect(BR.format('119')).toBe('(11) 9');
    expect(BR.format('1199999')).toBe('(11) 9999-9');
  });

  it('caps at 11 digits', () => {
    expect(BR.format('119999999990000')).toBe('(11) 99999-9999');
  });
});

describe('NANP formatter (US/CA)', () => {
  const US = COUNTRIES.find((c) => c.code === 'US')!;

  it('formats 10 digits', () => {
    expect(US.format('5551234567')).toBe('(555) 123-4567');
  });

  it('caps at 10 digits', () => {
    expect(US.format('55512345670000')).toBe('(555) 123-4567');
  });
});

describe('parseStoredPhone', () => {
  it('parses a Brazilian mobile — strips +55, keeps DDD + digits', () => {
    const { country, national } = parseStoredPhone('+5511999999999');
    expect(country.code).toBe('BR');
    expect(national).toBe('11999999999');
  });

  it('parses the stored digits-only Brazilian format from the spec', () => {
    // "+55119999999999" from the user spec — 14 digits after +, the
    // BR formatter caps display at 11 so anything beyond is tolerated.
    const { country, national } = parseStoredPhone('+55119999999999');
    expect(country.code).toBe('BR');
    expect(national).toBe('119999999999');
  });

  it('parses longer dial codes first (+351 → Portugal)', () => {
    const { country, national } = parseStoredPhone('+351911234567');
    expect(country.code).toBe('PT');
    expect(national).toBe('911234567');
  });

  it('falls back to default country for an unknown code', () => {
    const { country, national } = parseStoredPhone('+999123456');
    expect(country.code).toBe('BR');
    // Unknown dial kept as national — operator still sees something
    expect(national).toBe('999123456');
  });

  it('accepts a legacy formatted value without + prefix', () => {
    const { country, national } = parseStoredPhone('(11) 98888-2222');
    expect(country.code).toBe('BR');
    expect(national).toBe('11988882222');
  });

  it('empty / null returns default + empty national', () => {
    expect(parseStoredPhone(null).national).toBe('');
    expect(parseStoredPhone(undefined).country.code).toBe('BR');
    expect(parseStoredPhone('').national).toBe('');
  });
});

describe('formatDisplay', () => {
  it('combines dial code and national formatter', () => {
    const BR = findCountry('BR');
    expect(formatDisplay(BR, '11999999999')).toBe('+55 (11) 99999-9999');
  });

  it('returns "" for empty national', () => {
    expect(formatDisplay(findCountry('BR'), '')).toBe('');
  });
});

describe('toStored', () => {
  it('collapses to +<dial><digits>', () => {
    expect(toStored(findCountry('BR'), '11999999999')).toBe('+5511999999999');
    expect(toStored(findCountry('US'), '5551234567')).toBe('+15551234567');
  });

  it('strips non-digits from the national portion', () => {
    expect(toStored(findCountry('BR'), '(11) 99999-9999')).toBe(
      '+5511999999999',
    );
  });

  it('returns "" for empty digits (so caller can send null)', () => {
    expect(toStored(findCountry('BR'), '')).toBe('');
    expect(toStored(findCountry('BR'), '---')).toBe('');
  });
});

describe('formatPhoneForDisplay (round-trip)', () => {
  it('stored BR → display', () => {
    expect(formatPhoneForDisplay('+5511999999999')).toBe(
      '+55 (11) 99999-9999',
    );
  });

  it('stored US → display', () => {
    expect(formatPhoneForDisplay('+15551234567')).toBe('+1 (555) 123-4567');
  });

  it('legacy BR value → display (assumes +55)', () => {
    expect(formatPhoneForDisplay('11 98888-1111')).toBe(
      '+55 (11) 98888-1111',
    );
  });

  it('null/empty → ""', () => {
    expect(formatPhoneForDisplay(null)).toBe('');
    expect(formatPhoneForDisplay(undefined)).toBe('');
    expect(formatPhoneForDisplay('')).toBe('');
  });
});
