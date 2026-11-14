import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  ConflictError,
  ValidationError,
} from '../../../../src/shared/domain/errors/domain.errors.ts';
import type { IdGenerator } from '../../../../src/shared/domain/services/id-generator.ts';
import type { Clock } from '../../../../src/shared/domain/services/clock.ts';
import { Payment } from '../../../../src/payments/domain/entities/payment.entity.ts';
import { CreatePaymentUseCase } from '../../../../src/payments/application/use-cases/create-payment.use-case.ts';
import { InMemoryPaymentRepository } from '../../../../src/payments/infrastructure/repositories/in-memory.payment-repository.ts';

class SequentialIdGenerator implements IdGenerator {
  private readonly ids: string[];

  constructor(ids: string[]) {
    this.ids = [...ids];
  }

  generate(): string {
    const id = this.ids.shift();
    if (!id) throw new Error('No quedan ids de prueba');
    return id;
  }
}

class FixedClock implements Clock {
  private readonly date: Date;

  constructor(date: Date) {
    this.date = date;
  }

  now(): Date {
    return new Date(this.date);
  }
}

const firstId = '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e';
const secondId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
const customerId = '9b2d4f6a-1c3e-4a5b-8c7d-0e1f2a3b4c5d';
const fixedDate = new Date('2026-01-15T10:00:00.000Z');

describe('CreatePaymentUseCase', () => {
  let repository: InMemoryPaymentRepository;
  let idGenerator: SequentialIdGenerator;
  let clock: FixedClock;
  let useCase: CreatePaymentUseCase;

  beforeEach(() => {
    repository = new InMemoryPaymentRepository();
    idGenerator = new SequentialIdGenerator([firstId, secondId]);
    clock = new FixedClock(fixedDate);
    useCase = new CreatePaymentUseCase(repository, idGenerator, clock);
  });

  test('crea un pago pendiente normalizado y lo devuelve', async () => {
    const payment = await useCase.execute({
      reference: '  ORD-1  ',
      amount: 99.5,
      customerId: customerId.toUpperCase(),
    });

    expect(payment).toBeInstanceOf(Payment);
    expect(payment.reference).toBe('ORD-1');
    expect(payment.amount).toBe(99.5);
    expect(payment.customerId).toBe(customerId);
    expect(payment.status).toBe('pending');
  });

  test('asigna el id del generador y la fecha del reloj inyectados', async () => {
    const generate = vi.spyOn(idGenerator, 'generate');
    const now = vi.spyOn(clock, 'now');

    const payment = await useCase.execute({
      reference: 'ORD-1',
      amount: 10,
      customerId,
    });

    expect(generate).toHaveBeenCalledOnce();
    expect(now).toHaveBeenCalledOnce();
    expect(payment.id).toBe(firstId);
    expect(payment.createdAt).toEqual(fixedDate);
    expect(payment.updatedAt).toEqual(fixedDate);
  });

  test('guarda el pago creado en el repositorio', async () => {
    const payment = await useCase.execute({
      reference: 'ORD-1',
      amount: 10,
      customerId,
    });

    expect(await repository.findById(firstId)).toBe(payment);
  });

  test.each(['ORD-1', '  ORD-1  '])(
    'lanza ConflictError y no guarda si la referencia ya está registrada %j',
    async (reference) => {
      const original = await useCase.execute({
        reference: 'ORD-1',
        amount: 10,
        customerId,
      });
      const save = vi.spyOn(repository, 'save');

      await expect(
        useCase.execute({ reference, amount: 20, customerId })
      ).rejects.toThrow(new ConflictError('La referencia ya está registrada'));

      expect(save).not.toHaveBeenCalled();
      expect(await repository.findAll()).toEqual([original]);
    }
  );

  test.each([
    ['', 10, customerId],
    ['ORD-1', 0, customerId],
    ['ORD-1', 10.001, customerId],
    ['ORD-1', 10, 'cliente-1'],
  ])(
    'lanza ValidationError y no consulta el repositorio con datos inválidos (%j, %j, %j)',
    async (reference, amount, invalidCustomerId) => {
      const findByReference = vi.spyOn(repository, 'findByReference');
      const save = vi.spyOn(repository, 'save');

      await expect(
        useCase.execute({ reference, amount, customerId: invalidCustomerId })
      ).rejects.toThrow(ValidationError);

      expect(findByReference).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();
    }
  );
});
