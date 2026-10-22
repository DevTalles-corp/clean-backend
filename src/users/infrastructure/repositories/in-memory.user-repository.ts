import { ConflictError } from '../../../shared/domain/errors/domain.errors.ts';
import { User } from '../../domain/entities/user.entity.ts';
import type { UserRepository } from './../../domain/repositories/user.repository.ts';

export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>();

  async findByEmail(email: string): Promise<User | undefined> {
    const user = this.users.get(email);
    return user;
  }

  async save(user: User): Promise<void> {
    if (this.users.has(user.email)) {
      throw new ConflictError('El email ya está registrado');
    }
    this.users.set(user.email, user);
  }
}
