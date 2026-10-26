import { Router } from 'express';
import { createExpressApp } from './shared/presentation/config/express.config.ts';

export function createApp() {
  // Todo: repositorios

  // Todos: casos de uso

  // Todo: controladores

  const router = Router();

  // Todo: root
  // Todo: /users
  // Todo: /payments

  return createExpressApp(router);
}
