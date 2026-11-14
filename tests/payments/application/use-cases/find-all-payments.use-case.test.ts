import { beforeEach, describe, expect, test } from 'vitest';
import { Payment } from '../../../../src/payments/domain/entities/payment.entity.ts';
import { FindAllPaymentsUseCase } from '../../../../src/payments/application/use-cases/find-all-payments.use-case.ts';
import { InMemoryPaymentRepository } from '../../../../src/payments/infrastructure/repositories/in-memory.payment-repository.ts';

const payment = (id: string, reference: string) =>
  Payment.create({
    id,
    reference,
    amount: 10,
    customerId: '9b2d4f6a-1c3e-4a5b-8c7d-0e1f2a3b4c5d',
    createdAt: new Date('2026-01-15T10:00:00.000Z'),
  });

describe('FindAllPaymentsUseCase', () => {
  let repository: InMemoryPaymentRepository;
  let useCase: FindAllPaymentsUseCase;

  beforeEach(() => {
    repository = new InMemoryPaymentRepository();
    useCase = new FindAllPaymentsUseCase(repository);
  });

  test('devuelve una lista vacía si no hay pagos', async () => {
    expect(await useCase.execute()).toEqual([]);
  });

  test('devuelve todos los pagos registrados', async () => {
    const first = payment('3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e', 'ORD-1');
    const second = payment('7c9e6679-7425-40de-944b-e07fc1f90ae7', 'ORD-2');
    await repository.save(first);
    await repository.save(second);

    expect(await useCase.execute()).toEqual([first, second]);
  });
});
