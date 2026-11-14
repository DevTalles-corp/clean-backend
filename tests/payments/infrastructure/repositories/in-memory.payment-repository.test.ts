import { describe, expect, test } from 'vitest';
import { ConflictError } from '../../../../src/shared/domain/errors/domain.errors.ts';
import { Payment } from '../../../../src/payments/domain/entities/payment.entity.ts';
import { InMemoryPaymentRepository } from '../../../../src/payments/infrastructure/repositories/in-memory.payment-repository.ts';

const payment = (reference: string, id = '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e') =>
  Payment.create({
    id,
    reference,
    amount: 50,
    customerId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    createdAt: new Date('2026-01-15T10:00:00.000Z'),
  });

describe('InMemoryPaymentRepository', () => {
  test('devuelve undefined si no existe un pago con ese id', async () => {
    const repository = new InMemoryPaymentRepository();

    expect(
      await repository.findById('3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e')
    ).toBeUndefined();
  });

  test('devuelve undefined si no existe un pago con esa referencia', async () => {
    const repository = new InMemoryPaymentRepository();

    expect(await repository.findByReference('ORD-1')).toBeUndefined();
  });

  test('guarda un pago y lo encuentra por id y por referencia', async () => {
    const repository = new InMemoryPaymentRepository();
    const saved = payment('ORD-1');

    await repository.save(saved);

    expect(await repository.findById(saved.id)).toBe(saved);
    expect(await repository.findByReference('ORD-1')).toBe(saved);
  });

  test('devuelve una lista vacía si no hay pagos', async () => {
    const repository = new InMemoryPaymentRepository();

    expect(await repository.findAll()).toEqual([]);
  });

  test('devuelve todos los pagos guardados', async () => {
    const repository = new InMemoryPaymentRepository();
    const first = payment('ORD-1');
    const second = payment('ORD-2', '7c9e6679-7425-40de-944b-e07fc1f90ae7');

    await repository.save(first);
    await repository.save(second);

    expect(await repository.findAll()).toEqual([first, second]);
  });

  test('lanza ConflictError si la referencia ya está registrada', async () => {
    const repository = new InMemoryPaymentRepository();
    await repository.save(payment('ORD-1'));

    await expect(
      repository.save(payment('ORD-1', '7c9e6679-7425-40de-944b-e07fc1f90ae7'))
    ).rejects.toThrow(new ConflictError('La referencia ya está registrada'));
  });
});
