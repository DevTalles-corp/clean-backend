// Contrato del dominio: define cómo buscar y guardar usuarios sin elegir una tecnología de almacenamiento.
// Invierte la dependencia hacia una abstracción
// Sin él, los casos de uso quedarían acoplados a un repositorio concreto.

import type { User } from './../entities/user.entity.ts';

export interface UserRepository {
  findByEmail(email: string): Promise<User | undefined>;
  save(user: User): Promise<void>;
}
