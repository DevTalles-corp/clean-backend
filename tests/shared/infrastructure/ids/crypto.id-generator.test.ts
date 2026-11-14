import { describe, expect, test } from 'vitest';
import { CryptoIdGenerator } from '../../../../src/shared/infrastructure/ids/crypto.id-generator.ts';

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('CryptoIdGenerator', () => {
  test('genera un UUID válido', () => {
    const id = new CryptoIdGenerator().generate();

    expect(id).toMatch(uuidRegex);
  });

  test('genera un id distinto en cada llamada', () => {
    const generator = new CryptoIdGenerator();

    expect(generator.generate()).not.toBe(generator.generate());
  });
});
