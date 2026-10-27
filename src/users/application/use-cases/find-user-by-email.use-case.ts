import { User } from './../../domain/entities/user.entity.ts';
import type { UserRepository } from '../../domain/repositories/user.repository.ts';
import { NotFoundError } from '../../../shared/domain/errors/domain.errors.ts';

export class FindUserByEmailUseCase {
  private readonly repository: UserRepository;

  constructor(repository: UserRepository) {
    this.repository = repository;
  }

  async execute(email: string): Promise<User> {
    const normalizedEmail = User.normalizeEmail(email);

    const user = await this.repository.findByEmail(normalizedEmail);

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    return user;
  }
}
