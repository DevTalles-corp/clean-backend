// Caso de uso de aplicación: busca un producto por su id y avisa si no existe.
// Concentra la regla de "producto no encontrado"; sin él, cada adaptador decidiría por su cuenta qué hacer ante un id inexistente.

import { Product } from '../../domain/entities/product.entity.ts';
import type { ProductRepository } from '../../domain/repositories/product.repository.ts';
import { NotFoundError } from '../../../shared/domain/errors/domain.errors.ts';

export class FindProductByIdUseCase {
  private readonly repository: ProductRepository;

  constructor(repository: ProductRepository) {
    this.repository = repository;
  }

  async execute(id: string): Promise<Product> {
    const product = await this.repository.findById(Product.normalizeId(id));

    if (!product) {
      throw new NotFoundError('Producto no encontrado');
    }

    return product;
  }
}
