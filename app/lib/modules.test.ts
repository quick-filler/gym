import { describe, expect, it } from 'vitest';
import { hasModule } from './modules';

describe('hasModule', () => {
  it('null/undefined = all on (never configured)', () => {
    expect(hasModule(null, 'workouts')).toBe(true);
    expect(hasModule(undefined, 'pool')).toBe(true);
  });

  it('only listed modules are on once configured', () => {
    expect(hasModule(['pool'], 'pool')).toBe(true);
    expect(hasModule(['pool'], 'workouts')).toBe(false);
    expect(hasModule(['pool'], 'classes')).toBe(false);
    expect(hasModule(['pool'], 'dependents')).toBe(false);
  });

  it('empty array = nothing on', () => {
    expect(hasModule([], 'classes')).toBe(false);
  });

  it('multiple modules', () => {
    expect(hasModule(['workouts', 'classes'], 'classes')).toBe(true);
    expect(hasModule(['workouts', 'classes'], 'dependents')).toBe(false);
  });
});
