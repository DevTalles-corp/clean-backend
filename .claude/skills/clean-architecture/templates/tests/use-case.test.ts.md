# Plantilla: pruebas de casos de uso

Ruta: `tests/<module>/application/use-cases/<verbo>-<entity>.use-case.test.ts`
Basada en: `tests/payments/application/use-cases/*.use-case.test.ts`

Inyecta el repositorio en memoria y fakes que hacen `implements` del contrato. Nunca tecnología real.

## Crear

```ts
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  ConflictError,
  ValidationError,
} from '../../../../src/shared/domain/errors/domain.errors.ts';
import type { IdGenerator } from '../../../../src/shared/domain/services/id-generator.ts';
import type { Clock } from '../../../../src/shared/domain/services/clock.ts';
import { <Entity> } from '../../../../src/<module>/domain/entities/<entity>.entity.ts';
import { Create<Entity>UseCase } from '../../../../src/<module>/application/use-cases/create-<entity>.use-case.ts';
import { InMemory<Entity>Repository } from '../../../../src/<module>/infrastructure/repositories/in-memory.<entity>-repository.ts';

class SequentialIdGenerator implements IdGenerator {
  private readonly ids: string[];

  constructor(ids: string[]) {
    this.ids = [...ids];
  }

  generate(): string {
    const id = this.ids.shift();
    if (!id) throw new Error('No quedan ids de prueba');
    return id;
  }
}

class FixedClock implements Clock {
  private readonly date: Date;

  constructor(date: Date) {
    this.date = date;
  }

  now(): Date {
    return new Date(this.date);
  }
}

const firstId = '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e';
const secondId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
const fixedDate = new Date('2026-01-15T10:00:00.000Z');

describe('Create<Entity>UseCase', () => {
  let repository: InMemory<Entity>Repository;
  let idGenerator: SequentialIdGenerator;
  let clock: FixedClock;
  let useCase: Create<Entity>UseCase;

  beforeEach(() => {
    repository = new InMemory<Entity>Repository();
    idGenerator = new SequentialIdGenerator([firstId, secondId]);
    clock = new FixedClock(fixedDate);
    useCase = new Create<Entity>UseCase(repository, idGenerator, clock);
  });

  test('crea un <entidad> normalizado y lo devuelve', async () => {
    const <entityVar> = await useCase.execute({ <field>: '  <valor>  ' });

    expect(<entityVar>).toBeInstanceOf(<Entity>);
    expect(<entityVar>.<field>).toBe('<valor>');
  });

  test('asigna el id del generador y la fecha del reloj inyectados', async () => {
    const generate = vi.spyOn(idGenerator, 'generate');
    const now = vi.spyOn(clock, 'now');

    const <entityVar> = await useCase.execute({ <field>: '<valor>' });

    expect(generate).toHaveBeenCalledOnce();
    expect(now).toHaveBeenCalledOnce();
    expect(<entityVar>.id).toBe(firstId);
    expect(<entityVar>.createdAt).toEqual(fixedDate);
  });

  test('guarda el <entidad> creado en el repositorio', async () => {
    const <entityVar> = await useCase.execute({ <field>: '<valor>' });

    expect(await repository.findById(firstId)).toBe(<entityVar>);
  });

  test.each(['<valor>', '  <valor>  '])(
    'lanza ConflictError y no guarda si el <campo> ya está registrado %j',
    async (<field>) => {
      await useCase.execute({ <field>: '<valor>' });
      const save = vi.spyOn(repository, 'save');

      await expect(useCase.execute({ <field> })).rejects.toThrow(
        new ConflictError('El <campo> ya está registrado')
      );
      expect(save).not.toHaveBeenCalled();
    }
  );

  test.each(['', '   '])(
    'lanza ValidationError y no consulta el repositorio con datos inválidos %j',
    async (<field>) => {
      const findBy<Field> = vi.spyOn(repository, 'findBy<Field>');
      const save = vi.spyOn(repository, 'save');

      await expect(useCase.execute({ <field> })).rejects.toThrow(ValidationError);

      expect(findBy<Field>).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();
    }
  );
});
```

## Buscar por id

```ts
import { beforeEach, describe, expect, test } from 'vitest';
import { NotFoundError } from '../../../../src/shared/domain/errors/domain.errors.ts';
import { <Entity> } from '../../../../src/<module>/domain/entities/<entity>.entity.ts';
import { Find<Entity>ByIdUseCase } from '../../../../src/<module>/application/use-cases/find-<entity>-by-id.use-case.ts';
import { InMemory<Entity>Repository } from '../../../../src/<module>/infrastructure/repositories/in-memory.<entity>-repository.ts';

const id = '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e';

describe('Find<Entity>ByIdUseCase', () => {
  let repository: InMemory<Entity>Repository;
  let useCase: Find<Entity>ByIdUseCase;
  let <entityVar>: <Entity>;

  beforeEach(async () => {
    repository = new InMemory<Entity>Repository();
    useCase = new Find<Entity>ByIdUseCase(repository);
    <entityVar> = <Entity>.create({
      id,
      <field>: '<valor>',
      createdAt: new Date('2026-01-15T10:00:00.000Z'),
    });
    await repository.save(<entityVar>);
  });

  test.each([id, `  ${id.toUpperCase()}  `])(
    'devuelve el <entidad> con el id %j',
    async (searchId) => {
      expect(await useCase.execute(searchId)).toBe(<entityVar>);
    }
  );

  test('lanza NotFoundError si el <entidad> no existe', async () => {
    await expect(
      useCase.execute('7c9e6679-7425-40de-944b-e07fc1f90ae7')
    ).rejects.toThrow(new NotFoundError('<Entidad en español> no encontrado'));
  });
});
```

## Listar

```ts
import { beforeEach, describe, expect, test } from 'vitest';
import { <Entity> } from '../../../../src/<module>/domain/entities/<entity>.entity.ts';
import { FindAll<Entities>UseCase } from '../../../../src/<module>/application/use-cases/find-all-<entities>.use-case.ts';
import { InMemory<Entity>Repository } from '../../../../src/<module>/infrastructure/repositories/in-memory.<entity>-repository.ts';

const <entityVar> = (id: string, <field>: string) =>
  <Entity>.create({
    id,
    <field>,
    createdAt: new Date('2026-01-15T10:00:00.000Z'),
  });

describe('FindAll<Entities>UseCase', () => {
  let repository: InMemory<Entity>Repository;
  let useCase: FindAll<Entities>UseCase;

  beforeEach(() => {
    repository = new InMemory<Entity>Repository();
    useCase = new FindAll<Entities>UseCase(repository);
  });

  test('devuelve una lista vacía si no hay <entidades>', async () => {
    expect(await useCase.execute()).toEqual([]);
  });

  test('devuelve todos los <entidades> registrados', async () => {
    const first = <entityVar>('3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e', 'A');
    const second = <entityVar>('7c9e6679-7425-40de-944b-e07fc1f90ae7', 'B');
    await repository.save(first);
    await repository.save(second);

    expect(await useCase.execute()).toEqual([first, second]);
  });
});
```
