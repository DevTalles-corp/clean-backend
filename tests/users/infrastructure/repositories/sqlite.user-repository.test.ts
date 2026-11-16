import Database from 'better-sqlite3';
import { describe, expect, test } from 'vitest';
import { ConflictError } from '../../../../src/shared/domain/errors/domain.errors.ts';
import { User } from '../../../../src/users/domain/entities/user.entity.ts';
import { SqliteUserRepository } from '../../../../src/users/infrastructure/repositories/sqlite.user-repository.ts';

const ana = (name: string, id = '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e') =>
  User.create({ id, name, email: 'ana@example.com' });

const createRepository = () =>
  new SqliteUserRepository(new Database(':memory:'));

describe('SqliteUserRepository', () => {
  test('devuelve undefined si no existe un usuario con ese email', async () => {
    const repository = createRepository();

    const user = await repository.findByEmail('ana@example.com');

    expect(user).toBeUndefined();
  });

  test('guarda un usuario y lo encuentra por su email', async () => {
    const repository = createRepository();
    const user = ana('Ana López');

    await repository.save(user);

    expect(await repository.findByEmail('ana@example.com')).toEqual(user);
  });

  test('lanza ConflictError si el email ya está registrado', async () => {
    const repository = createRepository();
    await repository.save(ana('Ana López'));

    await expect(
      repository.save(ana('Otra Ana', '7c9e6679-7425-40de-944b-e07fc1f90ae7'))
    ).rejects.toThrow(ConflictError);
  });

  test('conserva el role del usuario', async () => {
    const repository = createRepository();
    const admin = User.create({
      id: '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e',
      name: 'Ana López',
      email: 'ana@example.com',
      role: 'admin',
    });

    await repository.save(admin);

    const user = await repository.findByEmail('ana@example.com');
    expect(user?.role).toBe('admin');
  });
});
