// Entidad del dominio Payment: reúne los datos y las reglas que mantienen válido e inmutable cada pago.
// Centraliza esas garantías; sin ella, cada consumidor tendría que repetirlas y podrían circular pagos con montos o referencias inválidas.

// El constructor privado dirige la creación a create() en TypeScript.
// readonly protege en TypeScript; Object.freeze impide cambios en ejecución.

import { ValidationError } from '../../../shared/domain/errors/domain.errors.ts';
import { isUuid } from '../../../shared/domain/validators/uuid.ts';

const paymentStatuses = ['pending', 'completed', 'failed', 'refunded'] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];

export interface CreatePaymentData {
  reference: string;
  amount: number;
  customerId: string;
}

// Datos para construir la entidad: el id y la fecha los aporta quien la crea (p. ej. el caso de uso).
export interface CreatePaymentProps extends CreatePaymentData {
  id: string;
  createdAt: Date;
}

export class Payment {
  readonly id: string; // UUID
  readonly reference: string;
  readonly amount: number;
  readonly status: PaymentStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly customerId: string;

  private constructor(payment: {
    id: string;
    reference: string;
    amount: number;
    status: PaymentStatus;
    createdAt: Date;
    updatedAt: Date;
    customerId: string;
  }) {
    const { id, reference, amount, status, createdAt, updatedAt, customerId } =
      payment;

    this.id = id;
    this.reference = reference;
    this.amount = amount;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.customerId = customerId;

    Object.freeze(this);
  }

  static create(input: CreatePaymentProps): Payment {
    const { id, reference, amount, customerId, createdAt } = input;

    const cleanId = Payment.normalizeId(id);
    const cleanReference = reference.trim();
    const cleanCustomerId = Payment.normalizeId(customerId);

    if (!isUuid(cleanId)) {
      throw new ValidationError('El id debe ser un UUID válido.');
    }
    if (!cleanReference) {
      throw new ValidationError('La referencia es obligatoria.');
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new ValidationError('El monto debe ser un número mayor a 0.');
    }
    if (!Number.isInteger(Math.round(amount * 100 * 1e6) / 1e6)) {
      throw new ValidationError('El monto admite como máximo 2 decimales.');
    }
    if (!isUuid(cleanCustomerId)) {
      throw new ValidationError('El customerId debe ser un UUID válido.');
    }
    if (!(createdAt instanceof Date) || Number.isNaN(createdAt.getTime())) {
      throw new ValidationError('La fecha de creación no es válida.');
    }

    // Un pago nuevo siempre empieza pendiente y sin modificaciones.
    return new Payment({
      id: cleanId,
      reference: cleanReference,
      amount,
      status: 'pending',
      createdAt: new Date(createdAt),
      updatedAt: new Date(createdAt),
      customerId: cleanCustomerId,
    });
  }

  static normalizeId(id: string) {
    return id.trim().toLowerCase();
  }
}
