// Caso de uso de aplicación: obtiene todos los productos registrados.
// Expone la lectura como una acción de la aplicación; sin él, la presentación tendría que hablar directamente con el repositorio.

import type { Product } from '../../domain/entities/product.entity.ts';
import type { ProductRepository } from '../../domain/repositories/product.repository.ts';

export class FindAllProductsUseCase {
  private readonly repository: ProductRepository;

  constructor(repository: ProductRepository) {
    this.repository = repository;
  }

  async execute(): Promise<Product[]> {
    return this.repository.findAll();
  }
}
