// Regla compartida del dominio: decide si un texto es un UUID válido.
// Centraliza el formato de los identificadores; sin ella, cada entidad repetiría la misma expresión regular y podrían divergir.

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function isUuid(value: string): boolean {
  return uuidRegex.test(value);
}
