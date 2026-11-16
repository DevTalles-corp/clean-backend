# Plantilla frontend: repositorio HTTP

Ruta: `src/<module>/infrastructure/repositories/http.<entity>-repository.ts`

Implementa el contrato del dominio contra la API. Traduce status HTTP a errores de dominio (inverso de `error-handler.ts` del backend). `baseUrl` llega por constructor desde la composición.

```ts
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../../shared/domain/errors/domain.errors.ts';
import type {
  <Entity>,
  Create<Entity>Data,
} from '../../domain/entities/<entity>.entity.ts';
import type { <Entity>Repository } from '../../domain/repositories/<entity>.repository.ts';
import { <Entity>Mapper, type <Entity>Dto } from '../mappers/<entity>.mapper.ts';

export class Http<Entity>Repository implements <Entity>Repository {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async findById(id: string): Promise<<Entity> | undefined> {
    const response = await fetch(`${this.baseUrl}/<module>/${encodeURIComponent(id)}`);
    if (response.status === 404) return undefined;
    await this.assertOk(response);
    return <Entity>Mapper.toDomain((await response.json()) as <Entity>Dto);
  }

  async findAll(): Promise<<Entity>[]> {
    const response = await fetch(`${this.baseUrl}/<module>`);
    await this.assertOk(response);
    const dtos = (await response.json()) as <Entity>Dto[];
    return dtos.map(<Entity>Mapper.toDomain);
  }

  async create(data: Create<Entity>Data): Promise<<Entity>> {
    const response = await fetch(`${this.baseUrl}/<module>`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(<Entity>Mapper.toCreateDto(data)),
    });
    await this.assertOk(response);
    return <Entity>Mapper.toDomain((await response.json()) as <Entity>Dto);
  }

  // Traduce la respuesta HTTP a errores del dominio.
  private async assertOk(response: Response): Promise<void> {
    if (response.ok) return;

    const body = (await response.json().catch(() => ({}))) as { error?: string };
    const message = body.error ?? 'Error inesperado';

    if (response.status === 400 || response.status === 422) throw new ValidationError(message);
    if (response.status === 404) throw new NotFoundError(message);
    if (response.status === 409) throw new ConflictError(message);
    throw new Error(`HTTP ${response.status}: ${message}`); // error técnico, no de negocio
  }
}
```

Si varios repositorios repiten `assertOk`, extráelo a `src/shared/infrastructure/http/fetch.http-client.ts` implementando un contrato `HttpClient` (`src/shared/domain/services/http-client.ts`) e inyéctalo por constructor.
