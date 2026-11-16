import { beforeEach, describe, expect, test } from 'vitest';
import { Product } from '../../../../src/products/domain/entities/product.entity.ts';
import { FindAllProductsUseCase } from '../../../../src/products/application/use-cases/find-all-products.use-case.ts';
import { InMemoryProductRepository } from '../../../../src/products/infrastructure/repositories/in-memory.product-repository.ts';

const product = (id: string, name: string) =>
  Product.create({
    id,
    name,
    price: 10,
    stock: 5,
    category: 'periféricos',
  });

describe('FindAllProductsUseCase', () => {
  let repository: InMemoryProductRepository;
  let useCase: FindAllProductsUseCase;

  beforeEach(() => {
    repository = new InMemoryProductRepository();
    useCase = new FindAllProductsUseCase(repository);
  });

  test('devuelve una lista vacía si no hay productos', async () => {
    expect(await useCase.execute()).toEqual([]);
  });

  test('devuelve todos los productos registrados', async () => {
    const first = product('3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e', 'Teclado');
    const second = product('7c9e6679-7425-40de-944b-e07fc1f90ae7', 'Ratón');
    await repository.save(first);
    await repository.save(second);

    expect(await useCase.execute()).toEqual([first, second]);
  });
});
