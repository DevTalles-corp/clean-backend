import Database from 'better-sqlite3';
import { describe, expect, test } from 'vitest';
import { ConflictError } from '../../../../src/shared/domain/errors/domain.errors.ts';
import { Product } from '../../../../src/products/domain/entities/product.entity.ts';
import { SqliteProductRepository } from '../../../../src/products/infrastructure/repositories/sqlite.product-repository.ts';

const product = (name: string, id = '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e') =>
  Product.create({
    id,
    name,
    price: 50,
    stock: 3,
    category: 'periféricos',
  });

const createRepository = () =>
  new SqliteProductRepository(new Database(':memory:'));

describe('SqliteProductRepository', () => {
  test('devuelve undefined si no existe un producto con ese id', async () => {
    const repository = createRepository();

    expect(
      await repository.findById('3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e')
    ).toBeUndefined();
  });

  test('devuelve undefined si no existe un producto con ese nombre', async () => {
    const repository = createRepository();

    expect(await repository.findByName('Teclado')).toBeUndefined();
  });

  test('guarda un producto y lo encuentra por id y por nombre', async () => {
    const repository = createRepository();
    const saved = product('Teclado');

    await repository.save(saved);

    expect(await repository.findById(saved.id)).toEqual(saved);
    expect(await repository.findByName('Teclado')).toEqual(saved);
  });

  test.each(['teclado', '  TECLADO  '])(
    'encuentra el producto por nombre sin importar mayúsculas ni espacios %j',
    async (name) => {
      const repository = createRepository();
      const saved = product('Teclado');
      await repository.save(saved);

      expect(await repository.findByName(name)).toEqual(saved);
    }
  );

  test('conserva descripción, precio con decimales e imágenes', async () => {
    const repository = createRepository();
    const saved = Product.create({
      id: '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e',
      name: 'Monitor',
      price: 199.99,
      stock: 0,
      description: 'Monitor de 27 pulgadas',
      category: 'pantallas',
      images: ['https://example.com/a.png', 'https://example.com/b.png'],
    });

    await repository.save(saved);

    expect(await repository.findById(saved.id)).toEqual(saved);
  });

  test('devuelve una lista vacía si no hay productos', async () => {
    const repository = createRepository();

    expect(await repository.findAll()).toEqual([]);
  });

  test('devuelve todos los productos guardados en orden de inserción', async () => {
    const repository = createRepository();
    const first = product('Teclado');
    const second = product('Ratón', '7c9e6679-7425-40de-944b-e07fc1f90ae7');

    await repository.save(first);
    await repository.save(second);

    expect(await repository.findAll()).toEqual([first, second]);
  });

  test.each(['TECLADO', 'ÉCLAIR'])(
    'lanza ConflictError si el nombre ya está registrado %j',
    async (duplicated) => {
      const repository = createRepository();
      await repository.save(product(duplicated.toLowerCase()));

      await expect(
        repository.save(product(duplicated, '7c9e6679-7425-40de-944b-e07fc1f90ae7'))
      ).rejects.toThrow(new ConflictError('Ya existe un producto con ese nombre'));
    }
  );
});
