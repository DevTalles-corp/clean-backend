import { json, Router } from 'express';
import { requireJson } from '../../../server/presentation/http/require-json.ts';
import { validateBody } from '../../../server/presentation/http/validate-body.ts';
import { createProductSchema } from '../schemas/create-product.schema.ts';
import type { CreateProductController } from '../controllers/create-product.controller.ts';
import type { FindProductByIdController } from '../controllers/find-product-by-id.controller.ts';
import type { FindAllProductsController } from '../controllers/find-all-products.controller.ts';

export function createProductsRouter(
  createProductController: CreateProductController,
  findProductByIdController: FindProductByIdController,
  findAllProductsController: FindAllProductsController
) {
  const router = Router();

  router.post(
    '/',
    requireJson,
    json({ limit: '64kb' }),
    validateBody(createProductSchema),

    async (request, response) => {
      const product = await createProductController.handle(request.body);
      response.status(201).json(product);
    }
  );

  router.get('/', async (_request, response) => {
    const products = await findAllProductsController.handle();
    response.status(200).json(products);
  });

  router.get('/:id', async (request, response) => {
    const product = await findProductByIdController.handle(request.params.id);
    response.status(200).json(product);
  });

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
