import type Database from 'better-sqlite3';
import type { Router } from 'express';
import type { IdGenerator } from '../../shared/domain/services/id-generator.ts';
// import { InMemoryUserRepository } from '../infrastructure/repositories/in-memory.user-repository.ts';
import { SqliteUserRepository } from '../infrastructure/repositories/sqlite.user-repository.ts';
import { RegisterUserUseCase } from '../application/use-cases/register-user.use-case.ts';
import { FindUserByEmailUseCase } from '../application/use-cases/find-user-by-email.use-case.ts';
import { RegisterUserController } from './controllers/register-user.controller.ts';
import { FindUserByEmailController } from './controllers/find-user-by-email.controller.ts';
import { createUsersRouter } from './routes/user.routes.ts';

interface UsersModuleDeps {
  db: Database.Database;
  idGenerator: IdGenerator;
}

// Composición del módulo de usuarios: arma repositorio, casos de uso y controladores.
// Evita que el punto de arranque conozca los detalles internos de cada módulo.
export function createUsersModule({ db, idGenerator }: UsersModuleDeps): Router {
  //! Repositorio
  // const userRepository = new InMemoryUserRepository();
  const userRepository = new SqliteUserRepository(db);

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

  return createUsersRouter(registerUserController, findUserByEmailController);
}
