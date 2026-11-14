import { describe, expect, test } from 'vitest';
import { User } from '../../../../src/users/domain/entities/user.entity.ts';
import { ValidationError } from '../../../../src/shared/domain/errors/domain.errors.ts';

const id = '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e';

describe('User Entity', () => {
  test('crea un usuario y normaliza su nombre y email', () => {
    const user = User.create({
      id,
      name: '     Ana López     ',
      email: '    ANA@example.coM   ',
    });

    expect(user).toBeInstanceOf(User);
    expect(user.id).toBe(id);
    expect(user.name).toBe('Ana López');
    expect(user.email).toBe('ana@example.com');
    expect(user.role).toBe('user');
  });

  test('normaliza el id a minúsculas y sin espacios', () => {
    const user = User.create({
      id: `  ${id.toUpperCase()}  `,
      name: 'Ana',
      email: 'ana@example.com',
    });

    expect(user.id).toBe(id);
  });

  test.each(['', '   ', 'abc', '123', '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4'])(
    'rechaza el id inválido %j',
    (invalidId) => {
      expect(() =>
        User.create({ id: invalidId, name: 'Ana', email: 'ana@example.com' })
      ).toThrow(new ValidationError('El id debe ser un UUID válido.'));
    }
  );

  test.each(['', '   ', '\t\n'])('rechaza el nombre vacío %j', (name) => {
    expect(() => User.create({ id, name, email: 'ana@example.com' })).toThrow(
      new ValidationError('El nombre es obligatorio.')
    );
  });

  test.each(['', '   ', 'ana.example.com'])(
    'rechaza el email sin @ %j',
    (email) => {
      expect(() => User.create({ id, name: 'Ana', email })).toThrow(
        new ValidationError('El email debe de contener una @')
      );
    }
  );

  test('acepta un email con @ según la regla actual de dominio', () => {
    const user = User.create({ id, name: 'Ana', email: 'A@B' });
    expect(user.email).toBe('a@b');
  });

  test('impide modificar sus datos en ejecución', () => {
    const user = User.create({ id, name: 'Ana', email: 'ana@example.com' });

    expect(Reflect.set(user, 'id', 'otro-id')).toBe(false);
    expect(Reflect.set(user, 'name', 'Pedro')).toBe(false);
    expect(Reflect.set(user, 'email', 'otro@example.com')).toBe(false);
    expect(user.id).toBe(id);
    expect(user.name).toBe('Ana');
    expect(user.email).toBe('ana@example.com');
  });
});
