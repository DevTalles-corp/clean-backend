# Plantilla: prueba de repositorio en memoria

Ruta: `tests/<module>/infrastructure/repositories/in-memory.<entity>-repository.test.ts`
Basada en: `tests/payments/infrastructure/repositories/in-memory.payment-repository.test.ts`

Una prueba por método del contrato + caso de conflicto.

```ts
import { describe, expect, test } from 'vitest';
import { ConflictError } from '../../../../src/shared/domain/errors/domain.errors.ts';
import { <Entity> } from '../../../../src/<module>/domain/entities/<entity>.entity.ts';
import { InMemory<Entity>Repository } from '../../../../src/<module>/infrastructure/repositories/in-memory.<entity>-repository.ts';

const <entityVar> = (<field>: string, id = '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e') =>
  <Entity>.create({
    id,
    <field>,
    createdAt: new Date('2026-01-15T10:00:00.000Z'),
  });

describe('InMemory<Entity>Repository', () => {
  test('devuelve undefined si no existe un <entidad> con ese id', async () => {
    const repository = new InMemory<Entity>Repository();

    expect(
      await repository.findById('3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e')
    ).toBeUndefined();
  });

  test('devuelve undefined si no existe un <entidad> con ese <campo>', async () => {
    const repository = new InMemory<Entity>Repository();

    expect(await repository.findBy<Field>('A')).toBeUndefined();
  });

  test('guarda un <entidad> y lo encuentra por id y por <campo>', async () => {
    const repository = new InMemory<Entity>Repository();
    const saved = <entityVar>('A');

    await repository.save(saved);

    expect(await repository.findById(saved.id)).toBe(saved);
    expect(await repository.findBy<Field>('A')).toBe(saved);
  });

  test('devuelve una lista vacía si no hay <entidades>', async () => {
    const repository = new InMemory<Entity>Repository();

    expect(await repository.findAll()).toEqual([]);
  });

  test('devuelve todos los <entidades> guardados', async () => {
    const repository = new InMemory<Entity>Repository();
    const first = <entityVar>('A');
    const second = <entityVar>('B', '7c9e6679-7425-40de-944b-e07fc1f90ae7');

    await repository.save(first);
    await repository.save(second);

    expect(await repository.findAll()).toEqual([first, second]);
  });

  test('lanza ConflictError si el <campo> ya está registrado', async () => {
    const repository = new InMemory<Entity>Repository();
    await repository.save(<entityVar>('A'));

    await expect(
      repository.save(<entityVar>('A', '7c9e6679-7425-40de-944b-e07fc1f90ae7'))
    ).rejects.toThrow(new ConflictError('El <campo> ya está registrado'));
  });
});
```
