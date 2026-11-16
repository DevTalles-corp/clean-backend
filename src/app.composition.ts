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
import { InMemoryProductRepository } from './products/infrastructure/repositories/in-memory.product-repository.ts';
import { CreateProductUseCase } from './products/application/use-cases/create-product.use-case.ts';
import { FindProductByIdUseCase } from './products/application/use-cases/find-product-by-id.use-case.ts';
import { FindAllProductsUseCase } from './products/application/use-cases/find-all-products.use-case.ts';
import { CreateProductController } from './products/presentation/controllers/create-product.controller.ts';
import { FindProductByIdController } from './products/presentation/controllers/find-product-by-id.controller.ts';
import { FindAllProductsController } from './products/presentation/controllers/find-all-products.controller.ts';
import { createProductsRouter } from './products/presentation/routes/product.routes.ts';
import { SqliteUserRepository } from './users/infrastructure/repositories/sqlite.user-repository.ts';

// SQLite
import Database from 'better-sqlite3';

export function createApp() {
  //! Database
  const db = new Database('clean-database.db', {});
  db.pragma('journal_mode = WAL');

  //! Repositorios
  // const userRepository = new InMemoryUserRepository();
  const userRepository = new SqliteUserRepository(db);
  const paymentRepository = new InMemoryPaymentRepository();
  const productRepository = new InMemoryProductRepository();

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

  const createProductUseCase = new CreateProductUseCase(
    productRepository,
    idGenerator
  );
  const findProductByIdUseCase = new FindProductByIdUseCase(productRepository);
  const findAllProductsUseCase = new FindAllProductsUseCase(productRepository);

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

  const createProductController = new CreateProductController(
    createProductUseCase
  );
  const findProductByIdController = new FindProductByIdController(
    findProductByIdUseCase
  );
  const findAllProductsController = new FindAllProductsController(
    findAllProductsUseCase
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
  router.use(
    '/products',
    createProductsRouter(
      createProductController,
      findProductByIdController,
      findAllProductsController
    )
  );

  return createExpressApp(router);
}
