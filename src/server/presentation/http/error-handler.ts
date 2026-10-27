import type { ErrorRequestHandler } from 'express';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../../shared/domain/errors/domain.errors.ts';

// Traduce los errores de la aplicación a respuestas HTTP.
export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  next
) => {
  if (response.headersSent) {
    // Si los encabezados ya se han enviado, pasa el error al siguiente middleware.
    next(error);
    return;
  }

  if (error instanceof ValidationError) {
    response.status(400).json({ error: error.message });
    return;
  }

  if (error instanceof NotFoundError) {
    response.status(404).json({ error: error.message });
  }

  if (error instanceof ConflictError) {
    response.status(409).json({ error: error.message });
    return;
  }

  // Express identifica los errores al leer JSON mediante la propiedad type.
  if (error instanceof Error && 'type' in error) {
    switch (error.type) {
      case 'entity.parse.failed':
        response
          .status(400)
          .json({ error: 'El cuerpo debe contener un objeto JSON válido' });
        return;
      case 'entity.too.large':
        response
          .status(413)
          .json({ error: 'El cuerpo supera el límite de 64 KiB' });
        return;
      case 'charset.unsupported':
      case 'encoding.unsupported':
        response
          .status(415)
          .json({ error: 'Codificación del cuerpo no soportada' });
        return;
    }
  }

  console.error(error);
  response.status(500).json({ error: 'Error interno del servidor' });
};
