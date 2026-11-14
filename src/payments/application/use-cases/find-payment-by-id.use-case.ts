// Caso de uso de aplicación: busca un pago por su id y avisa si no existe.
// Concentra la regla de "pago no encontrado"; sin él, cada adaptador decidiría por su cuenta qué hacer ante un id inexistente.

import { Payment } from '../../domain/entities/payment.entity.ts';
import type { PaymentRepository } from '../../domain/repositories/payment.repository.ts';
import { NotFoundError } from '../../../shared/domain/errors/domain.errors.ts';

export class FindPaymentByIdUseCase {
  private readonly repository: PaymentRepository;

  constructor(repository: PaymentRepository) {
    this.repository = repository;
  }

  async execute(id: string): Promise<Payment> {
    const payment = await this.repository.findById(Payment.normalizeId(id));

    if (!payment) {
      throw new NotFoundError('Pago no encontrado');
    }

    return payment;
  }
}
