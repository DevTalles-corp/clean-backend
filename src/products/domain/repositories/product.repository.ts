// Contrato del dominio: define cómo buscar y guardar productos sin elegir una tecnología de almacenamiento.
// Invierte la dependencia hacia una abstracción
// Sin él, los casos de uso quedarían acoplados a un repositorio concreto.

import type { Product } from '../entities/product.entity.ts';

export interface ProductRepository {
  findById(id: string): Promise<Product | undefined>;
  // La búsqueda por nombre ignora mayúsculas y espacios en los extremos.
  findByName(name: string): Promise<Product | undefined>;
  findAll(): Promise<Product[]>;
  save(product: Product): Promise<void>;
}
