import { json, Router } from 'express';
import { requireJson } from '../../../server/presentation/http/require-json.ts';
import { validateBody } from '../../../server/presentation/http/validate-body.ts';
import { createPaymentSchema } from '../schemas/create-payment.schema.ts';
import type { CreatePaymentController } from '../controllers/create-payment.controller.ts';
import type { FindPaymentByIdController } from '../controllers/find-payment-by-id.controller.ts';
import type { FindAllPaymentsController } from '../controllers/find-all-payments.controller.ts';

export function createPaymentsRouter(
  createPaymentController: CreatePaymentController,
  findPaymentByIdController: FindPaymentByIdController,
  findAllPaymentsController: FindAllPaymentsController
) {
  const router = Router();

  router.post(
    '/',
    requireJson,
    json({ limit: '64kb' }),
    validateBody(createPaymentSchema),

    async (request, response) => {
      const payment = await createPaymentController.handle(request.body);
      response.status(201).json(payment);
    }
  );

  router.get('/', async (_request, response) => {
    const payments = await findAllPaymentsController.handle();
    response.status(200).json(payments);
  });

  router.get('/:id', async (request, response) => {
    const payment = await findPaymentByIdController.handle(request.params.id);
    response.status(200).json(payment);
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
