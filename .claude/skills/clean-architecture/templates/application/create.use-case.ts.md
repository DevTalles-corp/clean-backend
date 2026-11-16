# Plantilla: caso de uso de creación

Ruta: `src/<module>/application/use-cases/create-<entity>.use-case.ts` (o `register-<entity>`, según el lenguaje del negocio)
Basada en: `src/payments/application/use-cases/create-payment.use-case.ts`

Quita `Clock` si la entidad no tiene fechas.

```ts
// Caso de uso de aplicación: coordina la creación del <entidad en español>, la comprobación de <campo> duplicado y el guardado.
// Hace reutilizable el registro de <entidades> sin conocer HTTP ni el almacenamiento concreto; sin él, esa secuencia se repartiría entre adaptadores.

import {
  <Entity>,
  type Create<Entity>Data,
} from '../../domain/entities/<entity>.entity.ts';
import type { <Entity>Repository } from '../../domain/repositories/<entity>.repository.ts';
import type { IdGenerator } from '../../../shared/domain/services/id-generator.ts';
import type { Clock } from '../../../shared/domain/services/clock.ts';
import { ConflictError } from '../../../shared/domain/errors/domain.errors.ts';

export class Create<Entity>UseCase {
  private readonly repository: <Entity>Repository;
  private readonly idGenerator: IdGenerator;
  private readonly clock: Clock;

  constructor(
    repository: <Entity>Repository,
    idGenerator: IdGenerator,
    clock: Clock
  ) {
    this.repository = repository;
    this.idGenerator = idGenerator;
    this.clock = clock;
  }

  async execute(input: Create<Entity>Data): Promise<<Entity>> {
    // 1. La entidad valida y normaliza antes de tocar el repositorio.
    const <entityVar> = <Entity>.create({
      ...input,
      id: this.idGenerator.generate(),
      createdAt: this.clock.now(),
    });

    // 2. Regla de negocio que necesita el repositorio.
    if (await this.repository.findBy<Field>(<entityVar>.<field>)) {
      throw new ConflictError('El <campo> ya está registrado');
    }

    // 3. Persistir y devolver.
    await this.repository.save(<entityVar>);
    return <entityVar>;
  }
}
```
