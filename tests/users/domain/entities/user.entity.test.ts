import { describe, expect, test } from 'vitest';
import { User } from '../../../../src/users/domain/entities/user.entity.ts';
import { ValidationError } from '../../../../src/shared/domain/errors/domain.errors.ts';

describe('User Entity', () => {
  test('crea un usuario y normaliza su nombre y email', () => {
    const user = User.create('     Ana López     ', '    ANA@example.coM   ');

    expect(user).toBeInstanceOf(User);
    expect(user.name).toBe('Ana López');
    expect(user.email).toBe('ana@example.com');
  });

  test.each(['', '   ', '\t\n'])('rechaza el nombre vacío %j', (name) => {
    expect(() => User.create(name, 'ana@example.com')).toThrow(
      new ValidationError('El nombre es obligatorio.')
    );
  });

  test.each(['', '   ', 'ana.example.com'])(
    'rechaza el email sin @ %j',
    (email) => {
      expect(() => User.create('Ana', email)).toThrow(
        new ValidationError('El email debe de contener una @')
      );
    }
  );

  test('acepta un email con @ según la regla actual de dominio', () => {
    const user = User.create('Ana', 'A@B');
    expect(user.email).toBe('a@b');
  });

  test('impide modificar sus datos en ejecución', () => {
    const user = User.create('Ana', 'ana@example.com');

    expect(Reflect.set(user, 'name', 'Pedro')).toBe(false);
    expect(Reflect.set(user, 'email', 'otro@example.com')).toBe(false);
    expect(user.name).toBe('Ana');
    expect(user.email).toBe('ana@example.com');
  });
});
