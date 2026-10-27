// Entidad del dominio User: reúne los datos y las reglas que mantienen válido e inmutable cada usuario.
// Centraliza esas garantías; sin ella, cada consumidor tendría que repetirlas y podrían circular datos de negocio inválidos.

// El constructor privado dirige la creación a create() en TypeScript.
// readonly protege en TypeScript; Object.freeze impide cambios en ejecución.

import { ValidationError } from './../../../shared/domain/errors/domain.errors.ts';

export class User {
  readonly name: string;
  readonly email: string;

  private constructor(name: string, email: string) {
    this.name = name;
    this.email = email;

    Object.freeze(this);
  }

  static create(name: string, email: string): User {
    const cleanName = name.trim();
    const cleanEmail = User.normalizeEmail(email);

    if (!cleanName) throw new ValidationError('El nombre es obligatorio.');

    if (!cleanEmail.includes('@'))
      throw new ValidationError('El email debe de contener una @');

    return new User(cleanName, cleanEmail);
  }

  static normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }
}
