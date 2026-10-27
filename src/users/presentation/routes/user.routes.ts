import { json, Router } from 'express';
import { requireJson } from '../../../server/presentation/http/require-json.ts';
import { validateBody } from '../../../server/presentation/http/validate-body.ts';
import { registerUserSchema } from '../schemas/register-user.schema.ts';
import type { RegisterUserController } from '../controllers/register-user.controller.ts';
import type { FindUserByEmailController } from '../controllers/find-user-by-email.controller.ts';

export function createUsersRouter(
  registerUserController: RegisterUserController,
  findUserByEmailController: FindUserByEmailController
) {
  //todo: controlador
  const router = Router();

  router.post(
    '/',
    requireJson,
    json({ limit: '64kb' }),
    validateBody(registerUserSchema),

    async (request, response) => {
      const body = request.body;

      const user = await registerUserController.handle(body);
      response.status(201).json(user);
    }
  );

  router.get('/:email', async (request, response) => {
    const email = request.params.email;
    const user = await findUserByEmailController.handle(email);
    response.status(200).json(user);
  });

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
