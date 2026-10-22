import { describe, expect, test } from 'vitest';
import { User } from '../../../../src/users/domain/entities/user.entity.ts';

describe('User Entity', () => {
  test('crea un usuario y normaliza su nombre y email', () => {
    const user = User.create('     Ana López     ', '    ANA@example.coM   ');

    expect(user).toBeInstanceOf(User);
    expect(user.name).toBe('Ana López');
    expect(user.email).toBe('ana@example.com');
  });
});
