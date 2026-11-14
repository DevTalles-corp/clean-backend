// Contrato del dominio: define cómo buscar y guardar pagos sin elegir una tecnología de almacenamiento.
// Invierte la dependencia hacia una abstracción
// Sin él, los casos de uso quedarían acoplados a un repositorio concreto.

import type { Payment } from '../entities/payment.entity.ts';

export interface PaymentRepository {
  findById(id: string): Promise<Payment | undefined>;
  findByReference(reference: string): Promise<Payment | undefined>;
  findAll(): Promise<Payment[]>;
  save(payment: Payment): Promise<void>;
}
