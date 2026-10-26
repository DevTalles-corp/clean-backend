import express from 'express';
import type { Router } from 'express';

export function createExpressApp(router: Router) {
  const app = express();

  app.disable('x-powered-by'); // desactivar el encabezado

  app.use(router);

  app.use((_request, response) => {
    response.status(404).json({
      error: 'Ruta no encontrada',
    });
  });

  // Todo: Manejo de los errores

  return app;
}
