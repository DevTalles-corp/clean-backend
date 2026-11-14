import { Router } from 'express';
import { createExpressApp } from './server/presentation/config/express.config.ts';
import { createPublicRouter } from './server/presentation/routes/public.routes.ts';
import { InMemoryUserRepository } from './users/infrastructure/repositories/in-memory.user-repository.ts';
import { RegisterUserUseCase } from './users/application/use-cases/register-user.use-case.ts';
import { RegisterUserController } from './users/presentation/controllers/register-user.controller.ts';
import { createUsersRouter } from './users/presentation/routes/user.routes.ts';
import { FindUserByEmailUseCase } from './users/application/use-cases/find-user-by-email.use-case.ts';
import { CryptoIdGenerator } from './shared/infrastructure/ids/crypto.id-generator.ts';
import { FindUserByEmailController } from './users/presentation/controllers/find-user-by-email.controller.ts';
import { SystemClock } from './shared/infrastructure/clock/system.clock.ts';
import { InMemoryPaymentRepository } from './payments/infrastructure/repositories/in-memory.payment-repository.ts';
import { CreatePaymentUseCase } from './payments/application/use-cases/create-payment.use-case.ts';
import { FindPaymentByIdUseCase } from './payments/application/use-cases/find-payment-by-id.use-case.ts';
import { FindAllPaymentsUseCase } from './payments/application/use-cases/find-all-payments.use-case.ts';
import { CreatePaymentController } from './payments/presentation/controllers/create-payment.controller.ts';
import { FindPaymentByIdController } from './payments/presentation/controllers/find-payment-by-id.controller.ts';
import { FindAllPaymentsController } from './payments/presentation/controllers/find-all-payments.controller.ts';
import { createPaymentsRouter } from './payments/presentation/routes/payment.routes.ts';

export function createApp() {
  //! Repositorios
  const userRepository = new InMemoryUserRepository();
  const paymentRepository = new InMemoryPaymentRepository();

  //! Servicios
  const idGenerator = new CryptoIdGenerator();
  const clock = new SystemClock();

  //! Casos de uso
  const registerUserUseCase = new RegisterUserUseCase(
    userRepository,
    idGenerator
  );
  const findUserByEmailUseCase = new FindUserByEmailUseCase(userRepository);

  const createPaymentUseCase = new CreatePaymentUseCase(
    paymentRepository,
    idGenerator,
    clock
  );
  const findPaymentByIdUseCase = new FindPaymentByIdUseCase(paymentRepository);
  const findAllPaymentsUseCase = new FindAllPaymentsUseCase(paymentRepository);

  //! Controladores
  const registerUserController = new RegisterUserController(
    registerUserUseCase
  );

  const findUserByEmailController = new FindUserByEmailController(
    findUserByEmailUseCase
  );

  const createPaymentController = new CreatePaymentController(
    createPaymentUseCase
  );
  const findPaymentByIdController = new FindPaymentByIdController(
    findPaymentByIdUseCase
  );
  const findAllPaymentsController = new FindAllPaymentsController(
    findAllPaymentsUseCase
  );

  // Rutas de la app
  const router = Router();

  router.use('/', createPublicRouter());
  router.use(
    '/users',
    createUsersRouter(registerUserController, findUserByEmailController)
  );
  router.use(
    '/payments',
    createPaymentsRouter(
      createPaymentController,
      findPaymentByIdController,
      findAllPaymentsController
    )
  );

  return createExpressApp(router);
}
