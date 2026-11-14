import { randomUUID } from 'node:crypto';
import type { IdGenerator } from '../../domain/services/id-generator.ts';

export class CryptoIdGenerator implements IdGenerator {
  generate(): string {
    return randomUUID();
  }
}
