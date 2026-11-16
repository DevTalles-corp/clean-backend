import { beforeEach, describe, expect, test } from 'vitest';
import { NotFoundError } from '../../../../src/shared/domain/errors/domain.errors.ts';
import { Product } from '../../../../src/products/domain/entities/product.entity.ts';
import { FindProductByIdUseCase } from '../../../../src/products/application/use-cases/find-product-by-id.use-case.ts';
import { InMemoryProductRepository } from '../../../../src/products/infrastructure/repositories/in-memory.product-repository.ts';

const id = '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e';

describe('FindProductByIdUseCase', () => {
  let repository: InMemoryProductRepository;
  let useCase: FindProductByIdUseCase;
  let product: Product;

  beforeEach(async () => {
    repository = new InMemoryProductRepository();
    useCase = new FindProductByIdUseCase(repository);
    product = Product.create({
      id,
      name: 'Teclado',
      price: 10,
      stock: 5,
      category: 'periféricos',
    });
    await repository.save(product);
  });

  test.each([id, `  ${id.toUpperCase()}  `])(
    'devuelve el producto con el id %j',
    async (searchId) => {
      expect(await useCase.execute(searchId)).toBe(product);
    }
  );

  test('lanza NotFoundError si el producto no existe', async () => {
    await expect(
      useCase.execute('7c9e6679-7425-40de-944b-e07fc1f90ae7')
    ).rejects.toThrow(new NotFoundError('Producto no encontrado'));
  });
});
