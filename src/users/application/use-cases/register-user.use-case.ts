// Caso de uso de aplicación: coordina la creación del usuario, la comprobación de duplicados por email y el guardado.
// Hace reutilizable el registro sin conocer HTTP ni el almacenamiento concreto; sin él, esa secuencia se repartiría entre adaptadores.

import { User } from './../../domain/entities/user.entity.ts';
import type { UserRepository } from '../../domain/repositories/user.repository.ts';
import { ConflictError } from '../../../shared/domain/errors/domain.errors.ts';

export class RegisterUserUseCase {
  private readonly repository: UserRepository;

  constructor(repository: UserRepository) {
    this.repository = repository;
  }

  async execute(name: string, email: string): Promise<User> {
    const user = User.create(name, email);

    if (await this.repository.findByEmail(user.email)) {
      throw new ConflictError('El email ya está registrado');
    }

    await this.repository.save(user);
    return user;
  }
}
