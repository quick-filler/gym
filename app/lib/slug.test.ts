import { describe, expect, it } from 'vitest';
import { normalizeSlug } from './slug';

describe('normalizeSlug', () => {
  it('passes a clean slug through', () => {
    expect(normalizeSlug('crossfit-sp')).toBe('crossfit-sp');
  });

  it('trims and lowercases', () => {
    expect(normalizeSlug('  CrossFit-SP  ')).toBe('crossfit-sp');
  });

  it('turns spaces into hyphens and collapses runs', () => {
    expect(normalizeSlug('Cross Fit  SP')).toBe('cross-fit-sp');
  });

  it('strips invalid characters', () => {
    expect(normalizeSlug('cross_fit@sp!')).toBe('crossfitsp');
  });

  it('trims stray leading/trailing hyphens', () => {
    expect(normalizeSlug('-crossfit-sp-')).toBe('crossfit-sp');
  });

  it('extracts the slug from a gymapp deep link', () => {
    expect(normalizeSlug('gymapp://academy/crossfit-sp')).toBe('crossfit-sp');
  });

  it('extracts the slug from a deep link with a query string', () => {
    expect(normalizeSlug('gymapp://academy/crossfit-sp?ref=qr')).toBe('crossfit-sp');
  });

  it('extracts the slug from an https /academy/ path', () => {
    expect(normalizeSlug('https://gym.app/academy/crossfit-sp')).toBe('crossfit-sp');
  });

  it('extracts the slug from a branded subdomain URL', () => {
    expect(normalizeSlug('https://crossfit-sp.gym.app')).toBe('crossfit-sp');
  });

  it('returns empty for blank/garbage input', () => {
    expect(normalizeSlug('')).toBe('');
    expect(normalizeSlug('   ')).toBe('');
    expect(normalizeSlug(null)).toBe('');
    expect(normalizeSlug('@@@')).toBe('');
  });
});
