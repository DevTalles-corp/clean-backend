import Database from 'better-sqlite3';
import { ConflictError } from '../../../shared/domain/errors/domain.errors.ts';
import { User, type UserRole } from '../../domain/entities/user.entity.ts';
import type { UserRepository } from './../../domain/repositories/user.repository.ts';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export class SqliteUserRepository implements UserRepository {
  private readonly db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL
      )
    `);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const row = this.db
      .prepare<[string], UserRow>(
        'SELECT id, name, email, role FROM users WHERE email = ?'
      )
      .get(email);

    return row ? User.create(row) : undefined;
  }

  async save(user: User): Promise<void> {
    try {
      this.db
        .prepare(
          'INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)'
        )
        .run(user.id, user.name, user.email, user.role);
    } catch (error) {
      if (
        error instanceof Database.SqliteError &&
        error.code === 'SQLITE_CONSTRAINT_UNIQUE'
      ) {
        throw new ConflictError('El email ya está registrado');
      }
      throw error;
    }
  }
}
