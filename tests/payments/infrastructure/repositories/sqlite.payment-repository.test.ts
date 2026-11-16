import Database from 'better-sqlite3';
import { describe, expect, test } from 'vitest';
import { ConflictError } from '../../../../src/shared/domain/errors/domain.errors.ts';
import { Payment } from '../../../../src/payments/domain/entities/payment.entity.ts';
import { SqlitePaymentRepository } from '../../../../src/payments/infrastructure/repositories/sqlite.payment-repository.ts';

const payment = (reference: string, id = '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e') =>
  Payment.create({
    id,
    reference,
    amount: 50.25,
    customerId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    createdAt: new Date('2026-01-15T10:00:00.000Z'),
  });

const createRepository = () =>
  new SqlitePaymentRepository(new Database(':memory:'));

describe('SqlitePaymentRepository', () => {
  test('devuelve undefined si no existe un pago con ese id', async () => {
    const repository = createRepository();

    expect(
      await repository.findById('3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e')
    ).toBeUndefined();
  });

  test('devuelve undefined si no existe un pago con esa referencia', async () => {
    const repository = createRepository();

    expect(await repository.findByReference('ORD-1')).toBeUndefined();
  });

  test('guarda un pago y lo encuentra por id y por referencia', async () => {
    const repository = createRepository();
    const saved = payment('ORD-1');

    await repository.save(saved);

    expect(await repository.findById(saved.id)).toEqual(saved);
    expect(await repository.findByReference('ORD-1')).toEqual(saved);
  });

  test('conserva las fechas como instancias de Date', async () => {
    const repository = createRepository();
    const saved = payment('ORD-1');
    await repository.save(saved);

    const found = await repository.findById(saved.id);

    expect(found?.createdAt).toBeInstanceOf(Date);
    expect(found?.createdAt.toISOString()).toBe('2026-01-15T10:00:00.000Z');
  });

  test('devuelve una lista vacía si no hay pagos', async () => {
    const repository = createRepository();

    expect(await repository.findAll()).toEqual([]);
  });

  test('devuelve todos los pagos guardados en orden de inserción', async () => {
    const repository = createRepository();
    const first = payment('ORD-1');
    const second = payment('ORD-2', '7c9e6679-7425-40de-944b-e07fc1f90ae7');

    await repository.save(first);
    await repository.save(second);

    expect(await repository.findAll()).toEqual([first, second]);
  });

  test('lanza ConflictError si la referencia ya está registrada', async () => {
    const repository = createRepository();
    await repository.save(payment('ORD-1'));

    await expect(
      repository.save(payment('ORD-1', '7c9e6679-7425-40de-944b-e07fc1f90ae7'))
    ).rejects.toThrow(new ConflictError('La referencia ya está registrada'));
  });
});
