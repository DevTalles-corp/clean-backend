import { describe, expect, test } from 'vitest';
import { Payment } from '../../../../src/payments/domain/entities/payment.entity.ts';
import { ValidationError } from '../../../../src/shared/domain/errors/domain.errors.ts';

const id = '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e';
const customerId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
const createdAt = new Date('2026-01-15T10:00:00.000Z');

const validProps = {
  id,
  reference: 'ORD-1',
  amount: 99.5,
  customerId,
  createdAt,
};

describe('Payment Entity', () => {
  test('crea un pago pendiente con sus datos normalizados', () => {
    const payment = Payment.create({
      ...validProps,
      id: `  ${id.toUpperCase()}  `,
      reference: '   ORD-1   ',
      customerId: ` ${customerId.toUpperCase()} `,
    });

    expect(payment).toBeInstanceOf(Payment);
    expect(payment.id).toBe(id);
    expect(payment.reference).toBe('ORD-1');
    expect(payment.amount).toBe(99.5);
    expect(payment.customerId).toBe(customerId);
    expect(payment.status).toBe('pending');
  });

  test('usa la fecha de creación también como fecha de actualización', () => {
    const payment = Payment.create(validProps);

    expect(payment.createdAt).toEqual(createdAt);
    expect(payment.updatedAt).toEqual(createdAt);
  });

  test('no comparte la instancia de fecha recibida', () => {
    const date = new Date(createdAt);
    const payment = Payment.create({ ...validProps, createdAt: date });

    date.setFullYear(2000);

    expect(payment.createdAt).toEqual(createdAt);
  });

  test.each(['', '   ', 'abc', '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4'])(
    'rechaza el id inválido %j',
    (invalidId) => {
      expect(() => Payment.create({ ...validProps, id: invalidId })).toThrow(
        new ValidationError('El id debe ser un UUID válido.')
      );
    }
  );

  test.each(['', '   ', '\t\n'])(
    'rechaza la referencia vacía %j',
    (reference) => {
      expect(() => Payment.create({ ...validProps, reference })).toThrow(
        new ValidationError('La referencia es obligatoria.')
      );
    }
  );

  test.each([0, -1, -0.01, NaN, Infinity, -Infinity])(
    'rechaza el monto inválido %j',
    (amount) => {
      expect(() => Payment.create({ ...validProps, amount })).toThrow(
        new ValidationError('El monto debe ser un número mayor a 0.')
      );
    }
  );

  test.each([0.001, 10.999, 1.234])(
    'rechaza el monto con más de 2 decimales %j',
    (amount) => {
      expect(() => Payment.create({ ...validProps, amount })).toThrow(
        new ValidationError('El monto admite como máximo 2 decimales.')
      );
    }
  );

  test.each([0.01, 0.1, 1, 19.99, 1234.56])(
    'acepta el monto válido %j',
    (amount) => {
      expect(Payment.create({ ...validProps, amount }).amount).toBe(amount);
    }
  );

  test.each(['', 'cliente-1', '123'])(
    'rechaza el customerId inválido %j',
    (invalidCustomerId) => {
      expect(() =>
        Payment.create({ ...validProps, customerId: invalidCustomerId })
      ).toThrow(new ValidationError('El customerId debe ser un UUID válido.'));
    }
  );

  test('rechaza una fecha de creación inválida', () => {
    expect(() =>
      Payment.create({ ...validProps, createdAt: new Date('no-es-fecha') })
    ).toThrow(new ValidationError('La fecha de creación no es válida.'));
  });

  test('impide modificar sus datos en ejecución', () => {
    const payment = Payment.create(validProps);

    expect(Reflect.set(payment, 'amount', 1)).toBe(false);
    expect(Reflect.set(payment, 'status', 'completed')).toBe(false);
    expect(Reflect.set(payment, 'reference', 'OTRA')).toBe(false);
    expect(payment.amount).toBe(99.5);
    expect(payment.status).toBe('pending');
    expect(payment.reference).toBe('ORD-1');
  });
});
