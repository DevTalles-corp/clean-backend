# Plantilla: caso de uso de listado

Ruta: `src/<module>/application/use-cases/find-all-<entities>.use-case.ts` (plural)
Basada en: `src/payments/application/use-cases/find-all-payments.use-case.ts`

```ts
// Caso de uso de aplicación: obtiene todos los <entidades en español> registrados.
// Expone la lectura como una acción de la aplicación; sin él, la presentación tendría que hablar directamente con el repositorio.

import type { <Entity> } from '../../domain/entities/<entity>.entity.ts';
import type { <Entity>Repository } from '../../domain/repositories/<entity>.repository.ts';

export class FindAll<Entities>UseCase {
  private readonly repository: <Entity>Repository;

  constructor(repository: <Entity>Repository) {
    this.repository = repository;
  }

  async execute(): Promise<<Entity>[]> {
    return this.repository.findAll();
  }
}
```

Nota: aquí `<Entity>` se importa con `import type` porque solo se usa como tipo.
