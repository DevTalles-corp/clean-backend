import { Router } from 'express';

export function createPublicRouter() {
  const router = Router();

  router.get('/', (_request, response) => {
    response.json({
      message: 'Hola Mundo!',
    });
  });

  return router;
}
