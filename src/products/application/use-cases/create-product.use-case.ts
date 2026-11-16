// Caso de uso de aplicación: coordina la creación del producto, la comprobación de nombres duplicados y el guardado.
// Hace reutilizable el alta de productos sin conocer HTTP ni el almacenamiento concreto; sin él, esa secuencia se repartiría entre adaptadores.

import {
  Product,
  type CreateProductData,
} from '../../domain/entities/product.entity.ts';
import type { ProductRepository } from '../../domain/repositories/product.repository.ts';
import type { IdGenerator } from '../../../shared/domain/services/id-generator.ts';
import { ConflictError } from '../../../shared/domain/errors/domain.errors.ts';

export class CreateProductUseCase {
  private readonly repository: ProductRepository;
  private readonly idGenerator: IdGenerator;

  constructor(repository: ProductRepository, idGenerator: IdGenerator) {
    this.repository = repository;
    this.idGenerator = idGenerator;
  }

  async execute(input: CreateProductData): Promise<Product> {
    const product = Product.create({
      ...input,
      id: this.idGenerator.generate(),
    });

    if (await this.repository.findByName(product.name)) {
      throw new ConflictError('Ya existe un producto con ese nombre');
    }

    await this.repository.save(product);
    return product;
  }
}
