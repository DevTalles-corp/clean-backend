import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  ConflictError,
  ValidationError,
} from '../../../../src/shared/domain/errors/domain.errors.ts';
import { User } from '../../../../src/users/domain/entities/user.entity.ts';
import { RegisterUserUseCase } from '../../../../src/users/application/use-cases/register-user.use-case.ts';
import { InMemoryUserRepository } from '../../../../src/users/infrastructure/repositories/in-memory.user-repository.ts';

describe('RegisterUserUseCase', () => {
  let repository: InMemoryUserRepository;
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    useCase = new RegisterUserUseCase(repository);
  });

  test('registra un usuario normalizado y lo devuelve', async () => {
    const user = await useCase.execute('  Ana López  ', '  ANA@example.com ');

    expect(user).toBeInstanceOf(User);
    expect(user.name).toBe('Ana López');
    expect(user.email).toBe('ana@example.com');
  });

  test('guarda el usuario registrado en el repositorio', async () => {
    const user = await useCase.execute('Ana López', 'ana@example.com');

    expect(await repository.findByEmail('ana@example.com')).toBe(user);
  });

  test.each(['ana@example.com', '  ANA@Example.COM  '])(
    'lanza ConflictError si el email ya está registrado %j',
    async (email) => {
      await useCase.execute('Ana López', 'ana@example.com');

      await expect(useCase.execute('Otra Ana', email)).rejects.toThrow(
        new ConflictError('El email ya está registrado')
      );
    }
  );

  test('no reemplaza al usuario existente si el email está duplicado', async () => {
    const original = await useCase.execute('Ana López', 'ana@example.com');
    const save = vi.spyOn(repository, 'save');

    await expect(
      useCase.execute('Otra Ana', 'ana@example.com')
    ).rejects.toThrow(ConflictError);

    expect(save).not.toHaveBeenCalled();
    expect(await repository.findByEmail('ana@example.com')).toBe(original);
  });

  test.each([
    ['', 'ana@example.com'],
    ['Ana', 'ana.example.com'],
  ])(
    'lanza ValidationError y no consulta el repositorio con datos inválidos (%j, %j)',
    async (name, email) => {
      const findByEmail = vi.spyOn(repository, 'findByEmail');
      const save = vi.spyOn(repository, 'save');

      await expect(useCase.execute(name, email)).rejects.toThrow(
        ValidationError
      );

      expect(findByEmail).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();
    }
  );
});
