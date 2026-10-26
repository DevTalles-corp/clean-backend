import { Router } from 'express';
import { createExpressApp } from './server/presentation/config/express.config.ts';
import { createPublicRouter } from './server/presentation/routes/public.routes.ts';

export function createApp() {
  // Todo: repositorios

  // Todos: casos de uso

  // Todo: controladores

  const router = Router();

  router.use('/', createPublicRouter());

  // Todo: /users
  // Todo: /payments

  return createExpressApp(router);
}
