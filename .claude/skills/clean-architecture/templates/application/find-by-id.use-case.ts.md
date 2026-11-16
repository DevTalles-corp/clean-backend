# Plantilla: caso de uso de búsqueda por campo

Ruta: `src/<module>/application/use-cases/find-<entity>-by-<campo>.use-case.ts`
Basada en: `src/payments/application/use-cases/find-payment-by-id.use-case.ts`, `src/users/application/use-cases/find-user-by-email.use-case.ts`

```ts
// Caso de uso de aplicación: busca un <entidad en español> por su <campo> y avisa si no existe.
// Concentra la regla de "<entidad> no encontrado"; sin él, cada adaptador decidiría por su cuenta qué hacer ante un <campo> inexistente.

import { <Entity> } from '../../domain/entities/<entity>.entity.ts';
import type { <Entity>Repository } from '../../domain/repositories/<entity>.repository.ts';
import { NotFoundError } from '../../../shared/domain/errors/domain.errors.ts';

export class Find<Entity>ByIdUseCase {
  private readonly repository: <Entity>Repository;

  constructor(repository: <Entity>Repository) {
    this.repository = repository;
  }

  async execute(id: string): Promise<<Entity>> {
    // Normaliza igual que la entidad para que la búsqueda coincida.
    const <entityVar> = await this.repository.findById(<Entity>.normalizeId(id));

    if (!<entityVar>) {
      throw new NotFoundError('<Entidad en español> no encontrado');
    }

    return <entityVar>;
  }
}
```
