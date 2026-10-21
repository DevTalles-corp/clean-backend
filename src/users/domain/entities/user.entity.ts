import { ValidationError } from './../../../shared/domain/errors/domain.errors';

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
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) throw new ValidationError('El nombre es obligatorio.');

    if (!cleanEmail.includes('@'))
      throw new ValidationError('El email debe de contener una @');

    return new User(cleanName, cleanEmail);
  }
}
