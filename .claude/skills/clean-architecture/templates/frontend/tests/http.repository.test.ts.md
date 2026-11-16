# Plantilla frontend: prueba del repositorio HTTP

Ruta: `tests/<module>/infrastructure/repositories/http.<entity>-repository.test.ts`

Sustituye `fetch` global; verifica URL, método, mapeo a entidad y traducción de status a errores de dominio.

```ts
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../../../src/shared/domain/errors/domain.errors.ts';
import { <Entity> } from '../../../../src/<module>/domain/entities/<entity>.entity.ts';
import { Http<Entity>Repository } from '../../../../src/<module>/infrastructure/repositories/http.<entity>-repository.ts';

const baseUrl = 'https://api.test';
const dto = {
  id: '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e',
  <field>: '<valor>',
  status: 'active',
  createdAt: '2026-01-15T10:00:00.000Z',
};

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('Http<Entity>Repository', () => {
  const fetchMock = vi.fn<typeof fetch>();
  let repository: Http<Entity>Repository;

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    repository = new Http<Entity>Repository(baseUrl);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  test('convierte la respuesta de la API en entidades del dominio', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, [dto]));

    const result = await repository.findAll();

    expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/<module>`);
    expect(result[0]).toBeInstanceOf(<Entity>);
    expect(result[0]?.createdAt).toEqual(new Date(dto.createdAt));
  });

  test('devuelve undefined si la API responde 404 al buscar por id', async () => {
    fetchMock.mockResolvedValue(jsonResponse(404, { error: 'No encontrado' }));

    expect(await repository.findById(dto.id)).toBeUndefined();
  });

  test('envía los datos con POST y JSON al crear', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, dto));

    await repository.create({ <field>: '<valor>' });

    const [, init] = fetchMock.mock.calls[0]!;
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({ <field>: '<valor>' });
  });

  test.each([
    [400, ValidationError],
    [404, NotFoundError],
    [409, ConflictError],
  ])('traduce el status %j a %o', async (status, ErrorType) => {
    fetchMock.mockResolvedValue(jsonResponse(status, { error: 'mensaje' }));

    await expect(repository.create({ <field>: '<valor>' })).rejects.toThrow(
      new ErrorType('mensaje')
    );
  });
});
```

Pruebas de hooks/componentes: usa Testing Library del framework montando `UseCasesProvider` con casos de uso sobre `InMemory<Entity>Repository`.
