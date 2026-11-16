# Plantilla: router del módulo

Ruta: `src/<module>/presentation/routes/<entity>.routes.ts`
Basada en: `src/payments/presentation/routes/payment.routes.ts`

Factory que recibe los controladores ya construidos (los crea `app.composition.ts`). Express 5 propaga errores async al `errorHandler`: no uses try/catch aquí.

```ts
import { json, Router } from 'express';
import { requireJson } from '../../../server/presentation/http/require-json.ts';
import { validateBody } from '../../../server/presentation/http/validate-body.ts';
import { create<Entity>Schema } from '../schemas/create-<entity>.schema.ts';
import type { Create<Entity>Controller } from '../controllers/create-<entity>.controller.ts';
import type { Find<Entity>ByIdController } from '../controllers/find-<entity>-by-id.controller.ts';
import type { FindAll<Entities>Controller } from '../controllers/find-all-<entities>.controller.ts';

export function create<Entities>Router(
  create<Entity>Controller: Create<Entity>Controller,
  find<Entity>ByIdController: Find<Entity>ByIdController,
  findAll<Entities>Controller: FindAll<Entities>Controller
) {
  const router = Router();

  router.post(
    '/',
    requireJson,
    json({ limit: '64kb' }),
    validateBody(create<Entity>Schema),

    async (request, response) => {
      const <entityVar> = await create<Entity>Controller.handle(request.body);
      response.status(201).json(<entityVar>);
    }
  );

  router.get('/', async (_request, response) => {
    const <entitiesVar> = await findAll<Entities>Controller.handle();
    response.status(200).json(<entitiesVar>);
  });

  router.get('/:id', async (request, response) => {
    const <entityVar> = await find<Entity>ByIdController.handle(request.params.id);
    response.status(200).json(<entityVar>);
  });

  // Cualquier otro método sobre la colección: 405 con los métodos permitidos.
  router.all('/', (_request, response) => {
    response
      .set('Allow', 'GET, POST')
      .status(405) // method not allowed
      .json({
        error: 'Método no permitido',
      });
  });

  return router;
}
```

Mantén `Allow` coherente con los métodos realmente montados en `/`.
