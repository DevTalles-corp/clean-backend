# Plantilla: repositorio en memoria

Ruta: `src/<module>/infrastructure/repositories/in-memory.<entity>-repository.ts`
Basada en: `src/payments/infrastructure/repositories/in-memory.payment-repository.ts`

Para otra tecnología: `<tecnologia>.<entity>-repository.ts` → `<Tecnologia><Entity>Repository implements <Entity>Repository`. Sin comentario de cabecera (convención actual de infraestructura).

```ts
import { ConflictError } from '../../../shared/domain/errors/domain.errors.ts';
import { <Entity> } from '../../domain/entities/<entity>.entity.ts';
import type { <Entity>Repository } from '../../domain/repositories/<entity>.repository.ts';

export class InMemory<Entity>Repository implements <Entity>Repository {
  private readonly <entitiesVar> = new Map<string, <Entity>>();

  async findById(id: string): Promise<<Entity> | undefined> {
    return this.<entitiesVar>.get(id);
  }

  async findBy<Field>(<field>: string): Promise<<Entity> | undefined> {
    for (const <entityVar> of this.<entitiesVar>.values()) {
      if (<entityVar>.<field> === <field>) return <entityVar>;
    }
    return undefined;
  }

  async findAll(): Promise<<Entity>[]> {
    return [...this.<entitiesVar>.values()];
  }

  async save(<entityVar>: <Entity>): Promise<void> {
    // Defensa en profundidad: la unicidad también se protege al guardar.
    if (await this.findBy<Field>(<entityVar>.<field>)) {
      throw new ConflictError('El <campo> ya está registrado');
    }
    this.<entitiesVar>.set(<entityVar>.id, <entityVar>);
  }
}
```
