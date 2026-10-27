import { Router } from 'express';
import { createExpressApp } from './server/presentation/config/express.config.ts';
import { createPublicRouter } from './server/presentation/routes/public.routes.ts';
import { InMemoryUserRepository } from './users/infrastructure/repositories/in-memory.user-repository.ts';
import { RegisterUserUseCase } from './users/application/use-cases/register-user.use-case.ts';
import { RegisterUserController } from './users/presentation/controllers/register-user.controller.ts';

export function createApp() {
  //! Repositorios
  const userRepository = new InMemoryUserRepository();

  //! Casos de uso
  const registerUserUseCase = new RegisterUserUseCase(userRepository);

  //! Controladores
  const registerUserController = new RegisterUserController(
    registerUserUseCase
  );

  const router = Router();

  router.use('/', createPublicRouter());

  // Todo: /users
  // Todo: /payments

  return createExpressApp(router);
}
