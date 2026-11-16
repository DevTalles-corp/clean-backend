# Plantilla: controlador

Ruta: `src/<module>/presentation/controllers/<verbo>-<entity>.controller.ts`
Basada en: `src/payments/presentation/controllers/*.controller.ts`

Un controlador por caso de uso. No conoce `request`/`response` ni códigos HTTP.

## Con body (crear)

```ts
import type { Create<Entity>UseCase } from '../../application/use-cases/create-<entity>.use-case.ts';
import type { Create<Entity>Input } from '../schemas/create-<entity>.schema.ts';

export class Create<Entity>Controller {
  private readonly create<Entity>UseCase: Create<Entity>UseCase;

  constructor(create<Entity>UseCase: Create<Entity>UseCase) {
    this.create<Entity>UseCase = create<Entity>UseCase;
  }

  async handle(input: Create<Entity>Input) {
    // Mapeo explícito campo a campo: la entrada externa no se pasa tal cual al dominio.
    return this.create<Entity>UseCase.execute({
      <field>: input.<field>,
    });
  }
}
```

## Con parámetro (buscar)

```ts
import type { Find<Entity>ByIdUseCase } from '../../application/use-cases/find-<entity>-by-id.use-case.ts';

export class Find<Entity>ByIdController {
  private readonly find<Entity>ByIdUseCase: Find<Entity>ByIdUseCase;

  constructor(find<Entity>ByIdUseCase: Find<Entity>ByIdUseCase) {
    this.find<Entity>ByIdUseCase = find<Entity>ByIdUseCase;
  }

  async handle(id: string) {
    return this.find<Entity>ByIdUseCase.execute(id);
  }
}
```

## Sin parámetros (listar)

```ts
import type { FindAll<Entities>UseCase } from '../../application/use-cases/find-all-<entities>.use-case.ts';

export class FindAll<Entities>Controller {
  private readonly findAll<Entities>UseCase: FindAll<Entities>UseCase;

  constructor(findAll<Entities>UseCase: FindAll<Entities>UseCase) {
    this.findAll<Entities>UseCase = findAll<Entities>UseCase;
  }

  async handle() {
    return this.findAll<Entities>UseCase.execute();
  }
}
```
