import { describe, expect, test } from 'vitest';
import { Product } from '../../../../src/products/domain/entities/product.entity.ts';
import { ValidationError } from '../../../../src/shared/domain/errors/domain.errors.ts';

const id = '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e';
const image = 'https://cdn.example.com/teclado.png';

const validProps = {
  id,
  name: 'Teclado mecánico',
  price: 49.99,
  stock: 10,
  description: 'Switches rojos',
  category: 'periféricos',
  images: [image],
};

describe('Product Entity', () => {
  test('crea un producto con sus datos normalizados', () => {
    const product = Product.create({
      ...validProps,
      id: `  ${id.toUpperCase()}  `,
      name: '  Teclado mecánico  ',
      description: '  Switches rojos  ',
      category: '  Periféricos  ',
      images: [`  ${image}  `],
    });

    expect(product).toBeInstanceOf(Product);
    expect(product.id).toBe(id);
    expect(product.name).toBe('Teclado mecánico');
    expect(product.price).toBe(49.99);
    expect(product.stock).toBe(10);
    expect(product.description).toBe('Switches rojos');
    expect(product.category).toBe('periféricos');
    expect(product.images).toEqual([image]);
  });

  test('usa descripción vacía y sin imágenes si no se indican', () => {
    const { description: _description, images: _images, ...props } =
      validProps;
    const product = Product.create(props);

    expect(product.description).toBe('');
    expect(product.images).toEqual([]);
  });

  test('no comparte la lista de imágenes recibida', () => {
    const images = [image];
    const product = Product.create({ ...validProps, images });

    images.push('https://cdn.example.com/otra.png');

    expect(product.images).toEqual([image]);
  });

  test.each(['', '   ', 'abc', '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4'])(
    'rechaza el id inválido %j',
    (invalidId) => {
      expect(() => Product.create({ ...validProps, id: invalidId })).toThrow(
        new ValidationError('El id debe ser un UUID válido.')
      );
    }
  );

  test.each(['', '   ', '\t\n'])('rechaza el nombre vacío %j', (name) => {
    expect(() => Product.create({ ...validProps, name })).toThrow(
      new ValidationError('El nombre es obligatorio.')
    );
  });

  test.each([0, -1, -0.01, NaN, Infinity, -Infinity])(
    'rechaza el precio inválido %j',
    (price) => {
      expect(() => Product.create({ ...validProps, price })).toThrow(
        new ValidationError('El precio debe ser un número mayor a 0.')
      );
    }
  );

  test.each([0.001, 10.999, 1.234])(
    'rechaza el precio con más de 2 decimales %j',
    (price) => {
      expect(() => Product.create({ ...validProps, price })).toThrow(
        new ValidationError('El precio admite como máximo 2 decimales.')
      );
    }
  );

  test.each([0.01, 0.1, 1, 19.99, 1234.56])(
    'acepta el precio válido %j',
    (price) => {
      expect(Product.create({ ...validProps, price }).price).toBe(price);
    }
  );

  test.each([-1, 1.5, NaN, Infinity])(
    'rechaza el stock inválido %j',
    (stock) => {
      expect(() => Product.create({ ...validProps, stock })).toThrow(
        new ValidationError(
          'El stock debe ser un número entero mayor o igual a 0.'
        )
      );
    }
  );

  test.each([0, 1, 500])('acepta el stock válido %j', (stock) => {
    expect(Product.create({ ...validProps, stock }).stock).toBe(stock);
  });

  test.each(['', '   '])('rechaza la categoría vacía %j', (category) => {
    expect(() => Product.create({ ...validProps, category })).toThrow(
      new ValidationError('La categoría es obligatoria.')
    );
  });

  test.each([[['']], [['no-es-url']], [[image, 'javascript:alert(1)']]])(
    'rechaza imágenes inválidas %j',
    (images) => {
      expect(() => Product.create({ ...validProps, images })).toThrow(
        new ValidationError(
          'Cada imagen debe ser una URL válida con http o https.'
        )
      );
    }
  );

  test('impide modificar sus datos en ejecución', () => {
    const product = Product.create(validProps);

    expect(Reflect.set(product, 'price', 1)).toBe(false);
    expect(Reflect.set(product, 'stock', 0)).toBe(false);
    expect(Reflect.set(product, 'name', 'OTRO')).toBe(false);
    expect(() => (product.images as string[]).push('x')).toThrow(TypeError);
    expect(product.price).toBe(49.99);
    expect(product.stock).toBe(10);
    expect(product.name).toBe('Teclado mecánico');
    expect(product.images).toEqual([image]);
  });

  test.each(['Teclado', '  teclado  ', 'TECLADO'])(
    'normaliza el nombre %j para compararlo',
    (name) => {
      expect(Product.normalizeName(name)).toBe('teclado');
    }
  );
});
