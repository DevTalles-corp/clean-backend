import { describe, expect, test } from 'vitest';
import { SystemClock } from '../../../../src/shared/infrastructure/clock/system.clock.ts';

describe('SystemClock', () => {
  test('devuelve la fecha actual del sistema', () => {
    const before = Date.now();
    const now = new SystemClock().now();
    const after = Date.now();

    expect(now).toBeInstanceOf(Date);
    expect(now.getTime()).toBeGreaterThanOrEqual(before);
    expect(now.getTime()).toBeLessThanOrEqual(after);
  });
});
