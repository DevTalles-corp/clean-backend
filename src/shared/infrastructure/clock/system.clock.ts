import type { Clock } from '../../domain/services/clock.ts';

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
