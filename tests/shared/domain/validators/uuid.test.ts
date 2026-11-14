import { describe, expect, test } from 'vitest';
import { isUuid } from '../../../../src/shared/domain/validators/uuid.ts';

describe('isUuid', () => {
  test('acepta un UUID válido', () => {
    expect(isUuid('3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e')).toBe(true);
  });

  test.each([
    '',
    'abc',
    '123',
    '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4',
    '3F2B8C1E-4D5A-4B6C-8D7E-9F0A1B2C3D4E',
  ])('rechaza el valor %j', (value) => {
    expect(isUuid(value)).toBe(false);
  });
});
