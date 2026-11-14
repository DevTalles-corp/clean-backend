// Entidad del dominio User: reúne los datos y las reglas que mantienen válido e inmutable cada usuario.
// Centraliza esas garantías; sin ella, cada consumidor tendría que repetirlas y podrían circular datos de negocio inválidos.

// El constructor privado dirige la creación a create() en TypeScript.
// readonly protege en TypeScript; Object.freeze impide cambios en ejecución.

import { ValidationError } from './../../../shared/domain/errors/domain.errors.ts';

const userRoles = ['user', 'admin', 'sales'] as const;
export type UserRole = (typeof userRoles)[number];

export interface CreateUserData {
  name: string;
  email: string;
  role?: UserRole;
}

export class User {
  // readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;

  private constructor(user: { name: string; email: string; role: UserRole }) {
    const { name, role, email } = user;

    this.name = name;
    this.email = email;
    this.role = role;

    Object.freeze(this);
  }

  static create(input: CreateUserData): User {
    const { name, email, role = 'user' } = input;

    const cleanName = name.trim();
    const cleanEmail = User.normalizeEmail(email);

    if (!cleanName) throw new ValidationError('El nombre es obligatorio.');
    if (!userRoles.includes(role)) {
      throw new ValidationError(`El role ${role} no es valido.`);
    }

    if (!cleanEmail.includes('@'))
      throw new ValidationError('El email debe de contener una @');

    return new User({ name: cleanName, email: cleanEmail, role: role });
  }

  static normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }
}
