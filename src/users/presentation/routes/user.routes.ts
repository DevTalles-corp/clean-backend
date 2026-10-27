import { json, Router } from 'express';
import { requireJson } from '../../../server/presentation/http/require-json.ts';
import { validateBody } from '../../../server/presentation/http/validate-body.ts';
import { registerUserSchema } from '../schemas/register-user.schema.ts';

export function createUsersRouter() {
  //todo: controlador
  const router = Router();

  router.post(
    '/',
    requireJson,
    json({ limit: '64kb' }),
    validateBody(registerUserSchema),

    async (request, response) => {
      response.json({
        message: 'Hola Mundo!',
      });
    }
  );

  router.all('/', (_request, response) => {
    response
      .set('Allow', 'POST')
      .status(405) // method not allowed
      .json({
        error: 'Método no permitido',
      });
  });

  return router;
}
