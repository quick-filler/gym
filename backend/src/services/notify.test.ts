import { describe, expect, it } from 'vitest';
import { buildExpoPushMessages } from './notify';

describe('buildExpoPushMessages', () => {
  it('builds one message per valid Expo token', () => {
    const out = buildExpoPushMessages(
      ['ExponentPushToken[aaa]', 'ExponentPushToken[bbb]'],
      { title: 'Oi', body: 'corpo', data: { route: '/x' } },
    );
    expect(out).toEqual([
      { to: 'ExponentPushToken[aaa]', title: 'Oi', body: 'corpo', data: { route: '/x' }, sound: 'default' },
      { to: 'ExponentPushToken[bbb]', title: 'Oi', body: 'corpo', data: { route: '/x' }, sound: 'default' },
    ]);
  });

  it('drops invalid / non-Expo tokens and empties', () => {
    const out = buildExpoPushMessages(
      ['fcm-token-xyz', '', null, undefined, 'ExponentPushToken[ok]'],
      { title: 'T' },
    );
    expect(out).toHaveLength(1);
    expect(out[0]!.to).toBe('ExponentPushToken[ok]');
    expect(out[0]!.body).toBeUndefined();
  });

  it('returns [] for no tokens', () => {
    expect(buildExpoPushMessages([], { title: 'T' })).toEqual([]);
  });
});
