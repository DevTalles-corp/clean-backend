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

// Datos para construir la entidad: el id lo genera quien la crea (p. ej. el caso de uso).
export interface CreateUserProps extends CreateUserData {
  id: string;
}

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export class User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;

  private constructor(user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  }) {
    const { id, name, role, email } = user;

    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;

    Object.freeze(this);
  }

  static create(input: CreateUserProps): User {
    const { id, name, email, role = 'user' } = input;

    const cleanId = id.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanEmail = User.normalizeEmail(email);

    if (!uuidRegex.test(cleanId)) {
      throw new ValidationError('El id debe ser un UUID válido.');
    }
    if (!cleanName) throw new ValidationError('El nombre es obligatorio.');
    if (!userRoles.includes(role)) {
      throw new ValidationError(`El role ${role} no es valido.`);
    }

    if (!cleanEmail.includes('@'))
      throw new ValidationError('El email debe de contener una @');

    return new User({
      id: cleanId,
      name: cleanName,
      email: cleanEmail,
      role: role,
    });
  }

  static normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }
}
