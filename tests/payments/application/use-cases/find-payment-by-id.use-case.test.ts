import { beforeEach, describe, expect, test } from 'vitest';
import { NotFoundError } from '../../../../src/shared/domain/errors/domain.errors.ts';
import { Payment } from '../../../../src/payments/domain/entities/payment.entity.ts';
import { FindPaymentByIdUseCase } from '../../../../src/payments/application/use-cases/find-payment-by-id.use-case.ts';
import { InMemoryPaymentRepository } from '../../../../src/payments/infrastructure/repositories/in-memory.payment-repository.ts';

const id = '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e';

describe('FindPaymentByIdUseCase', () => {
  let repository: InMemoryPaymentRepository;
  let useCase: FindPaymentByIdUseCase;
  let payment: Payment;

  beforeEach(async () => {
    repository = new InMemoryPaymentRepository();
    useCase = new FindPaymentByIdUseCase(repository);
    payment = Payment.create({
      id,
      reference: 'ORD-1',
      amount: 10,
      customerId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      createdAt: new Date('2026-01-15T10:00:00.000Z'),
    });
    await repository.save(payment);
  });

  test.each([id, `  ${id.toUpperCase()}  `])(
    'devuelve el pago con el id %j',
    async (searchId) => {
      expect(await useCase.execute(searchId)).toBe(payment);
    }
  );

  test('lanza NotFoundError si el pago no existe', async () => {
    await expect(
      useCase.execute('7c9e6679-7425-40de-944b-e07fc1f90ae7')
    ).rejects.toThrow(new NotFoundError('Pago no encontrado'));
  });
});
