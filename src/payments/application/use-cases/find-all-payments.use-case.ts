// Caso de uso de aplicación: obtiene todos los pagos registrados.
// Expone la lectura como una acción de la aplicación; sin él, la presentación tendría que hablar directamente con el repositorio.

import type { Payment } from '../../domain/entities/payment.entity.ts';
import type { PaymentRepository } from '../../domain/repositories/payment.repository.ts';

export class FindAllPaymentsUseCase {
  private readonly repository: PaymentRepository;

  constructor(repository: PaymentRepository) {
    this.repository = repository;
  }

  async execute(): Promise<Payment[]> {
    return this.repository.findAll();
  }
}
