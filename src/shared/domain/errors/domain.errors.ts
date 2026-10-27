/*
Estos son los errores compartidos en el dominio. 
Expresan validación y nos permiten distinguir fallos por significado. 
*/

export class ValidationError extends Error {}
export class ConflictError extends Error {}
export class NotFoundError extends Error {}
