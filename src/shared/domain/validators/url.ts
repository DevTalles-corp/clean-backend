// Regla compartida del dominio: decide si un texto es una URL absoluta http o https.
// Centraliza el formato de los enlaces (p. ej. imágenes); sin ella, cada entidad validaría las URLs a su manera y podrían aceptarse esquemas peligrosos como javascript:.

export function isHttpUrl(value: string): boolean {
  if (!URL.canParse(value)) return false;

  const { protocol } = new URL(value);
  return protocol === 'http:' || protocol === 'https:';
}
