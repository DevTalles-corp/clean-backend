import { ConflictError } from '../../../shared/domain/errors/domain.errors';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from './../../domain/repositories/user.repository';

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
