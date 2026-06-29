import { describe, expect, it } from 'vitest';
import { mapViaCep, sanitizeCep } from './cep';

describe('sanitizeCep', () => {
  it('keeps only digits', () => {
    expect(sanitizeCep('01310-100')).toBe('01310100');
    expect(sanitizeCep(' 01310 100 ')).toBe('01310100');
  });
  it('caps at 8 digits', () => {
    expect(sanitizeCep('013101009999')).toBe('01310100');
  });
  it('handles empty/null', () => {
    expect(sanitizeCep('')).toBe('');
    expect(sanitizeCep(null)).toBe('');
  });
});

describe('mapViaCep', () => {
  it('maps a successful ViaCEP payload', () => {
    expect(
      mapViaCep({
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'sp',
      }),
    ).toEqual({
      cep: '01310100',
      street: 'Avenida Paulista',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
    });
  });

  it('returns null when ViaCEP flags an unknown CEP', () => {
    expect(mapViaCep({ erro: true })).toBeNull();
  });

  it('returns null for empty / malformed payloads', () => {
    expect(mapViaCep(null)).toBeNull();
    expect(mapViaCep({})).toBeNull();
  });

  it('tolerates missing optional fields', () => {
    expect(mapViaCep({ cep: '01310100' })).toEqual({
      cep: '01310100',
      street: '',
      neighborhood: '',
      city: '',
      state: '',
    });
  });
});
