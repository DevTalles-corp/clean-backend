import type Database from 'better-sqlite3';
import type { Router } from 'express';
import type { IdGenerator } from '../../shared/domain/services/id-generator.ts';
import type { Clock } from '../../shared/domain/services/clock.ts';
// import { InMemoryPaymentRepository } from '../infrastructure/repositories/in-memory.payment-repository.ts';
import { SqlitePaymentRepository } from '../infrastructure/repositories/sqlite.payment-repository.ts';
import { CreatePaymentUseCase } from '../application/use-cases/create-payment.use-case.ts';
import { FindPaymentByIdUseCase } from '../application/use-cases/find-payment-by-id.use-case.ts';
import { FindAllPaymentsUseCase } from '../application/use-cases/find-all-payments.use-case.ts';
import { CreatePaymentController } from './controllers/create-payment.controller.ts';
import { FindPaymentByIdController } from './controllers/find-payment-by-id.controller.ts';
import { FindAllPaymentsController } from './controllers/find-all-payments.controller.ts';
import { createPaymentsRouter } from './routes/payment.routes.ts';

interface PaymentsModuleDeps {
  db: Database.Database;
  idGenerator: IdGenerator;
  clock: Clock;
}

// Composición del módulo de pagos: arma repositorio, casos de uso y controladores.
// Evita que el punto de arranque conozca los detalles internos de cada módulo.
export function createPaymentsModule({
  db,
  idGenerator,
  clock,
}: PaymentsModuleDeps): Router {
  //! Repositorio
  // const paymentRepository = new InMemoryPaymentRepository();
  const paymentRepository = new SqlitePaymentRepository(db);

  //! Casos de uso
  const createPaymentUseCase = new CreatePaymentUseCase(
    paymentRepository,
    idGenerator,
    clock
  );
  const findPaymentByIdUseCase = new FindPaymentByIdUseCase(paymentRepository);
  const findAllPaymentsUseCase = new FindAllPaymentsUseCase(paymentRepository);

  //! Controladores
  const createPaymentController = new CreatePaymentController(
    createPaymentUseCase
  );
  const findPaymentByIdController = new FindPaymentByIdController(
    findPaymentByIdUseCase
  );
  const findAllPaymentsController = new FindAllPaymentsController(
    findAllPaymentsUseCase
  );

  return createPaymentsRouter(
    createPaymentController,
    findPaymentByIdController,
    findAllPaymentsController
  );
}
