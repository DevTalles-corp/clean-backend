# Plantilla frontend: caso de uso de creación

Ruta: `src/<module>/application/use-cases/create-<entity>.use-case.ts`

En frontend el servidor genera `id` y fechas. El caso de uso valida localmente (feedback inmediato) y delega en el repositorio; el servidor sigue siendo la fuente de verdad (sus errores llegan traducidos como errores de dominio desde `infrastructure`).

```ts
// Caso de uso de aplicación: valida los datos de un nuevo <entidad en español> y solicita su creación.
// Evita que cada componente repita validaciones o hable con la API; sin él, la UI quedaría acoplada al transporte.

import {
  <Entity>,
  type Create<Entity>Data,
} from '../../domain/entities/<entity>.entity.ts';
import type { <Entity>Repository } from '../../domain/repositories/<entity>.repository.ts';

export class Create<Entity>UseCase {
  private readonly repository: <Entity>Repository;

  constructor(repository: <Entity>Repository) {
    this.repository = repository;
  }

  async execute(input: Create<Entity>Data): Promise<<Entity>> {
    // Lanza ValidationError antes de llamar a la API.
    const data = <Entity>.validate(input);
    return this.repository.create(data);
  }
}
```

Para esto la entidad expone una validación de datos de entrada sin id/fechas:

```ts
// En <entity>.entity.ts
static validate(input: Create<Entity>Data): Create<Entity>Data {
  const clean<Field> = <Entity>.normalize<Field>(input.<field>);
  if (!clean<Field>) throw new ValidationError('El <campo> es obligatorio.');
  return { ...input, <field>: clean<Field> };
}
```

`create()` puede reutilizar `validate()` internamente para no duplicar reglas.
