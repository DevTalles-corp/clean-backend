import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  ConflictError,
  ValidationError,
} from '../../../../src/shared/domain/errors/domain.errors.ts';
import type { IdGenerator } from '../../../../src/shared/domain/services/id-generator.ts';
import { Product } from '../../../../src/products/domain/entities/product.entity.ts';
import { CreateProductUseCase } from '../../../../src/products/application/use-cases/create-product.use-case.ts';
import { InMemoryProductRepository } from '../../../../src/products/infrastructure/repositories/in-memory.product-repository.ts';

class SequentialIdGenerator implements IdGenerator {
  private readonly ids: string[];

  constructor(ids: string[]) {
    this.ids = [...ids];
  }

  generate(): string {
    const id = this.ids.shift();
    if (!id) throw new Error('No quedan ids de prueba');
    return id;
  }
}

const firstId = '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e';
const secondId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
const image = 'https://cdn.example.com/teclado.png';

const validInput = {
  name: 'Teclado',
  price: 49.99,
  stock: 10,
  description: 'Switches rojos',
  category: 'periféricos',
  images: [image],
};

describe('CreateProductUseCase', () => {
  let repository: InMemoryProductRepository;
  let idGenerator: SequentialIdGenerator;
  let useCase: CreateProductUseCase;

  beforeEach(() => {
    repository = new InMemoryProductRepository();
    idGenerator = new SequentialIdGenerator([firstId, secondId]);
    useCase = new CreateProductUseCase(repository, idGenerator);
  });

  test('crea un producto normalizado y lo devuelve', async () => {
    const product = await useCase.execute({
      ...validInput,
      name: '  Teclado  ',
      category: '  Periféricos  ',
    });

    expect(product).toBeInstanceOf(Product);
    expect(product.name).toBe('Teclado');
    expect(product.price).toBe(49.99);
    expect(product.stock).toBe(10);
    expect(product.description).toBe('Switches rojos');
    expect(product.category).toBe('periféricos');
    expect(product.images).toEqual([image]);
  });

  test('asigna el id del generador inyectado', async () => {
    const generate = vi.spyOn(idGenerator, 'generate');

    const product = await useCase.execute(validInput);

    expect(generate).toHaveBeenCalledOnce();
    expect(product.id).toBe(firstId);
  });

  test('guarda el producto creado en el repositorio', async () => {
    const product = await useCase.execute(validInput);

    expect(await repository.findById(firstId)).toBe(product);
  });

  test.each(['Teclado', '  TECLADO  '])(
    'lanza ConflictError y no guarda si el nombre ya está registrado %j',
    async (name) => {
      const original = await useCase.execute(validInput);
      const save = vi.spyOn(repository, 'save');

      await expect(useCase.execute({ ...validInput, name })).rejects.toThrow(
        new ConflictError('Ya existe un producto con ese nombre')
      );

      expect(save).not.toHaveBeenCalled();
      expect(await repository.findAll()).toEqual([original]);
    }
  );

  test.each([
    { name: '' },
    { price: 0 },
    { price: 10.001 },
    { stock: -1 },
    { stock: 1.5 },
    { category: '' },
    { images: ['no-es-url'] },
  ])(
    'lanza ValidationError y no consulta el repositorio con datos inválidos %j',
    async (invalid) => {
      const findByName = vi.spyOn(repository, 'findByName');
      const save = vi.spyOn(repository, 'save');

      await expect(
        useCase.execute({ ...validInput, ...invalid })
      ).rejects.toThrow(ValidationError);

      expect(findByName).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();
    }
  );
});
