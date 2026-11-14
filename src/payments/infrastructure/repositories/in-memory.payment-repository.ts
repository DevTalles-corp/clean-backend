import { ConflictError } from '../../../shared/domain/errors/domain.errors.ts';
import { Payment } from '../../domain/entities/payment.entity.ts';
import type { PaymentRepository } from '../../domain/repositories/payment.repository.ts';

export class InMemoryPaymentRepository implements PaymentRepository {
  private readonly payments = new Map<string, Payment>();

  async findById(id: string): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async findByReference(reference: string): Promise<Payment | undefined> {
    for (const payment of this.payments.values()) {
      if (payment.reference === reference) return payment;
    }
    return undefined;
  }

  async findAll(): Promise<Payment[]> {
    return [...this.payments.values()];
  }

  async save(payment: Payment): Promise<void> {
    if (await this.findByReference(payment.reference)) {
      throw new ConflictError('La referencia ya está registrada');
    }
    this.payments.set(payment.id, payment);
  }
}
