import { describe, expect, test } from 'vitest';
import { ConflictError } from '../../../../src/shared/domain/errors/domain.errors.ts';
import { User } from '../../../../src/users/domain/entities/user.entity.ts';
import { InMemoryUserRepository } from '../../../../src/users/infrastructure/repositories/in-memory.user-repository.ts';

const ana = (name: string, id = '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e') =>
  User.create({ id, name, email: 'ana@example.com' });

describe('InMemoryUserRepository', () => {
  test('devuelve undefined si no existe un usuario con ese email', async () => {
    const repository = new InMemoryUserRepository();

    const user = await repository.findByEmail('ana@example.com');

    expect(user).toBeUndefined();
  });

  test('guarda un usuario y lo encuentra por su email', async () => {
    const repository = new InMemoryUserRepository();
    const user = ana('Ana López');

    await repository.save(user);

    expect(await repository.findByEmail('ana@example.com')).toBe(user);
  });

  test('lanza ConflictError si el email ya está registrado', async () => {
    const repository = new InMemoryUserRepository();
    await repository.save(ana('Ana López'));

    await expect(
      repository.save(ana('Otra Ana', '7c9e6679-7425-40de-944b-e07fc1f90ae7'))
    ).rejects.toThrow(ConflictError);
  });
});
