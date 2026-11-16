import { ConflictError } from '../../../shared/domain/errors/domain.errors.ts';
import { Product } from '../../domain/entities/product.entity.ts';
import type { ProductRepository } from '../../domain/repositories/product.repository.ts';

export class InMemoryProductRepository implements ProductRepository {
  private readonly products = new Map<string, Product>();

  async findById(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async findByName(name: string): Promise<Product | undefined> {
    const searchName = Product.normalizeName(name);
    for (const product of this.products.values()) {
      if (Product.normalizeName(product.name) === searchName) return product;
    }
    return undefined;
  }

  async findAll(): Promise<Product[]> {
    return [...this.products.values()];
  }

  async save(product: Product): Promise<void> {
    if (await this.findByName(product.name)) {
      throw new ConflictError('Ya existe un producto con ese nombre');
    }
    this.products.set(product.id, product);
  }
}
