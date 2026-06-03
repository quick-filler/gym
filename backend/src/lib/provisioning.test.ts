import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildResetUrl } from './provisioning';

describe('buildResetUrl', () => {
  const original = process.env.WEBSITE_ORIGIN;

  afterEach(() => {
    if (original === undefined) delete process.env.WEBSITE_ORIGIN;
    else process.env.WEBSITE_ORIGIN = original;
  });

  it('builds a reset URL from WEBSITE_ORIGIN', () => {
    process.env.WEBSITE_ORIGIN = 'https://app.gym.app';
    expect(buildResetUrl('abc123')).toBe(
      'https://app.gym.app/reset-password?code=abc123',
    );
  });

  it('strips a trailing slash from the origin', () => {
    process.env.WEBSITE_ORIGIN = 'https://app.gym.app/';
    expect(buildResetUrl('abc123')).toBe(
      'https://app.gym.app/reset-password?code=abc123',
    );
  });

  it('falls back to localhost when WEBSITE_ORIGIN is unset', () => {
    delete process.env.WEBSITE_ORIGIN;
    expect(buildResetUrl('tok')).toBe(
      'http://localhost:9999/reset-password?code=tok',
    );
  });

  it('url-encodes tokens with reserved characters', () => {
    process.env.WEBSITE_ORIGIN = 'https://app.gym.app';
    expect(buildResetUrl('a b/c+d')).toBe(
      'https://app.gym.app/reset-password?code=a%20b%2Fc%2Bd',
    );
  });
});
