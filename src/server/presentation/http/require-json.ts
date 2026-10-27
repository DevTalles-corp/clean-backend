import type { RequestHandler } from 'express';

// Comprueba el formato antes de que Express lea el cuerpo.
export const requireJson: RequestHandler = (request, response, next) => {
  const contentType = request.headers['content-type']
    ?.split(';')[0]
    ?.trim()
    .toLowerCase();
  if (contentType !== 'application/json') {
    response.status(415).json({ error: 'Usa Content-Type: application/json' });
    return;
  }

  next();
};
