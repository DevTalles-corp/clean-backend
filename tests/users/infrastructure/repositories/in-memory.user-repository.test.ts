import { describe, expect, test } from 'vitest';
import { ConflictError } from '../../../../src/shared/domain/errors/domain.errors.ts';
import { User } from '../../../../src/users/domain/entities/user.entity.ts';
import { InMemoryUserRepository } from '../../../../src/users/infrastructure/repositories/in-memory.user-repository.ts';
import { beforeEach } from 'node:test';

describe('InMemoryUserRepository', () => {
  test('devuelve undefined si no existe un usuario con ese email', async () => {
    const repository = new InMemoryUserRepository();

    const user = await repository.findByEmail('ana@example.com');

    expect(user).toBeUndefined();
  });

  test('guarda un usuario y lo encuentra por su email', async () => {
    const repository = new InMemoryUserRepository();
    const user = User.create('Ana López', 'ana@example.com');

    await repository.save(user);

    expect(await repository.findByEmail('ana@example.com')).toBe(user);
  });

  test('lanza ConflictError si el email ya está registrado', async () => {
    const repository = new InMemoryUserRepository();
    await repository.save(User.create('Ana López', 'ana@example.com'));

    await expect(
      repository.save(User.create('Otra Ana', 'ana@example.com'))
    ).rejects.toThrow(ConflictError);
  });
});
