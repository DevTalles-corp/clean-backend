// Caso de uso de aplicación: coordina la creación del pago, la comprobación de referencias duplicadas y el guardado.
// Hace reutilizable el registro de pagos sin conocer HTTP ni el almacenamiento concreto; sin él, esa secuencia se repartiría entre adaptadores.

import {
  Payment,
  type CreatePaymentData,
} from '../../domain/entities/payment.entity.ts';
import type { PaymentRepository } from '../../domain/repositories/payment.repository.ts';
import type { IdGenerator } from '../../../shared/domain/services/id-generator.ts';
import type { Clock } from '../../../shared/domain/services/clock.ts';
import { ConflictError } from '../../../shared/domain/errors/domain.errors.ts';

export class CreatePaymentUseCase {
  private readonly repository: PaymentRepository;
  private readonly idGenerator: IdGenerator;
  private readonly clock: Clock;

  constructor(
    repository: PaymentRepository,
    idGenerator: IdGenerator,
    clock: Clock
  ) {
    this.repository = repository;
    this.idGenerator = idGenerator;
    this.clock = clock;
  }

  async execute(input: CreatePaymentData): Promise<Payment> {
    const payment = Payment.create({
      ...input,
      id: this.idGenerator.generate(),
      createdAt: this.clock.now(),
    });

    if (await this.repository.findByReference(payment.reference)) {
      throw new ConflictError('La referencia ya está registrada');
    }

    await this.repository.save(payment);
    return payment;
  }
}
