import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { ValidationError } from '../../../shared/domain/errors/domain.errors.ts';

// Valida el cuerpo antes de que llegue al controlador y lo reemplaza por los datos ya tipados.
export function validateBody(schema: ZodType): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      throw new ValidationError(firstIssue?.message ?? 'Cuerpo inválido');
    }

    request.body = result.data;
    next();
  };
}
