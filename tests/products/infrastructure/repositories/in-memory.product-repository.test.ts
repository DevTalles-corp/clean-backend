import { describe, expect, test } from 'vitest';
import { ConflictError } from '../../../../src/shared/domain/errors/domain.errors.ts';
import { Product } from '../../../../src/products/domain/entities/product.entity.ts';
import { InMemoryProductRepository } from '../../../../src/products/infrastructure/repositories/in-memory.product-repository.ts';

const product = (name: string, id = '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e') =>
  Product.create({
    id,
    name,
    price: 50,
    stock: 3,
    category: 'periféricos',
  });

describe('InMemoryProductRepository', () => {
  test('devuelve undefined si no existe un producto con ese id', async () => {
    const repository = new InMemoryProductRepository();

    expect(
      await repository.findById('3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e')
    ).toBeUndefined();
  });

  test('devuelve undefined si no existe un producto con ese nombre', async () => {
    const repository = new InMemoryProductRepository();

    expect(await repository.findByName('Teclado')).toBeUndefined();
  });

  test('guarda un producto y lo encuentra por id y por nombre', async () => {
    const repository = new InMemoryProductRepository();
    const saved = product('Teclado');

    await repository.save(saved);

    expect(await repository.findById(saved.id)).toBe(saved);
    expect(await repository.findByName('Teclado')).toBe(saved);
  });

  test.each(['teclado', '  TECLADO  '])(
    'encuentra el producto por nombre sin importar mayúsculas ni espacios %j',
    async (name) => {
      const repository = new InMemoryProductRepository();
      const saved = product('Teclado');
      await repository.save(saved);

      expect(await repository.findByName(name)).toBe(saved);
    }
  );

  test('devuelve una lista vacía si no hay productos', async () => {
    const repository = new InMemoryProductRepository();

    expect(await repository.findAll()).toEqual([]);
  });

  test('devuelve todos los productos guardados', async () => {
    const repository = new InMemoryProductRepository();
    const first = product('Teclado');
    const second = product('Ratón', '7c9e6679-7425-40de-944b-e07fc1f90ae7');

    await repository.save(first);
    await repository.save(second);

    expect(await repository.findAll()).toEqual([first, second]);
  });

  test('lanza ConflictError si el nombre ya está registrado', async () => {
    const repository = new InMemoryProductRepository();
    await repository.save(product('Teclado'));

    await expect(
      repository.save(product('TECLADO', '7c9e6679-7425-40de-944b-e07fc1f90ae7'))
    ).rejects.toThrow(new ConflictError('Ya existe un producto con ese nombre'));
  });
});
