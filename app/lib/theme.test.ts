import { describe, expect, it } from 'vitest';
import { theme, withAlpha } from './theme';

describe('theme tokens', () => {
  it('exports the expected neutral palette keys', () => {
    const keys = Object.keys(theme);
    expect(keys).toContain('paper');
    expect(keys).toContain('ink900');
    expect(keys).toContain('ink700');
    expect(keys).toContain('line');
    expect(keys).toContain('emerald');
  });

  it('hex tokens are valid 7-char hex strings', () => {
    for (const [key, value] of Object.entries(theme)) {
      expect(value, `${key} should match #RRGGBB`).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe('withAlpha', () => {
  it('converts #rrggbb + alpha → rgba()', () => {
    expect(withAlpha('#0a84ff', 0.5)).toBe('rgba(10, 132, 255, 0.5)');
    expect(withAlpha('#ffffff', 1)).toBe('rgba(255, 255, 255, 1)');
    expect(withAlpha('#000000', 0)).toBe('rgba(0, 0, 0, 0)');
  });

  it('accepts hex without #-prefix', () => {
    expect(withAlpha('0a84ff', 0.25)).toBe('rgba(10, 132, 255, 0.25)');
  });

  it('falls back to a safe red rgba for malformed input', () => {
    expect(withAlpha('#fff', 0.5)).toBe('rgba(239, 68, 68, 0.5)');
    expect(withAlpha('not-a-color', 0.5)).toBe('rgba(239, 68, 68, 0.5)');
    expect(withAlpha('', 0.5)).toBe('rgba(239, 68, 68, 0.5)');
  });
});
