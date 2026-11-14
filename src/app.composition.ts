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

export function createApp() {
  //! Repositorios
  const userRepository = new InMemoryUserRepository();

  //! Servicios
  const idGenerator = new CryptoIdGenerator();

  //! Casos de uso
  const registerUserUseCase = new RegisterUserUseCase(
    userRepository,
    idGenerator
  );
  const findUserByEmailUseCase = new FindUserByEmailUseCase(userRepository);

  //! Controladores
  const registerUserController = new RegisterUserController(
    registerUserUseCase
  );

  const findUserByEmailController = new FindUserByEmailController(
    findUserByEmailUseCase
  );

  // Rutas de la app
  const router = Router();

  router.use('/', createPublicRouter());
  router.use(
    '/users',
    createUsersRouter(registerUserController, findUserByEmailController)
  );
  // Todo: /payments

  return createExpressApp(router);
}
