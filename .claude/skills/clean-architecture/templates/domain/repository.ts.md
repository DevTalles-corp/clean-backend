# Plantilla: contrato de repositorio

Ruta: `src/<module>/domain/repositories/<entity>.repository.ts`
Basada en: `src/payments/domain/repositories/payment.repository.ts`

Declara solo los métodos que los casos de uso necesitan.

```ts
// Contrato del dominio: define cómo buscar y guardar <entidades> sin elegir una tecnología de almacenamiento.
// Invierte la dependencia hacia una abstracción
// Sin él, los casos de uso quedarían acoplados a un repositorio concreto.

import type { <Entity> } from '../entities/<entity>.entity.ts';

export interface <Entity>Repository {
  findById(id: string): Promise<<Entity> | undefined>;
  findBy<Field>(<field>: string): Promise<<Entity> | undefined>;
  findAll(): Promise<<Entity>[]>;
  save(<entityVar>: <Entity>): Promise<void>;
}
```
