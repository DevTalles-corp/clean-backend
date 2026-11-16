// Entidad del dominio Product: reúne los datos y las reglas que mantienen válido e inmutable cada producto.
// Centraliza esas garantías; sin ella, cada consumidor tendría que repetirlas y podrían circular productos con precios, stock o imágenes inválidos.

// El constructor privado dirige la creación a create() en TypeScript.
// readonly protege en TypeScript; Object.freeze impide cambios en ejecución (también en la lista de imágenes).

import { ValidationError } from '../../../shared/domain/errors/domain.errors.ts';
import { isUuid } from '../../../shared/domain/validators/uuid.ts';
import { isHttpUrl } from '../../../shared/domain/validators/url.ts';

export interface CreateProductData {
  name: string;
  price: number;
  stock: number;
  description?: string;
  category: string;
  images?: string[];
}

// Datos para construir la entidad: el id lo aporta quien la crea (p. ej. el caso de uso).
export interface CreateProductProps extends CreateProductData {
  id: string;
}

export class Product {
  readonly id: string; // UUID
  readonly name: string;
  readonly price: number;
  readonly stock: number;
  readonly description: string;
  readonly category: string;
  readonly images: readonly string[];

  private constructor(product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    description: string;
    category: string;
    images: readonly string[];
  }) {
    const { id, name, price, stock, description, category, images } = product;

    this.id = id;
    this.name = name;
    this.price = price;
    this.stock = stock;
    this.description = description;
    this.category = category;
    this.images = images;

    Object.freeze(this);
  }

  static create(input: CreateProductProps): Product {
    const {
      id,
      name,
      price,
      stock,
      description = '',
      category,
      images = [],
    } = input;

    const cleanId = Product.normalizeId(id);
    const cleanName = name.trim();
    const cleanDescription = description.trim();
    const cleanCategory = category.trim().toLowerCase();
    const cleanImages = images.map((image) => image.trim());

    if (!isUuid(cleanId)) {
      throw new ValidationError('El id debe ser un UUID válido.');
    }
    if (!cleanName) {
      throw new ValidationError('El nombre es obligatorio.');
    }
    if (!Number.isFinite(price) || price <= 0) {
      throw new ValidationError('El precio debe ser un número mayor a 0.');
    }
    if (!Number.isInteger(Math.round(price * 100 * 1e6) / 1e6)) {
      throw new ValidationError('El precio admite como máximo 2 decimales.');
    }
    if (!Number.isSafeInteger(stock) || stock < 0) {
      throw new ValidationError(
        'El stock debe ser un número entero mayor o igual a 0.'
      );
    }
    if (!cleanCategory) {
      throw new ValidationError('La categoría es obligatoria.');
    }
    if (!cleanImages.every(isHttpUrl)) {
      throw new ValidationError(
        'Cada imagen debe ser una URL válida con http o https.'
      );
    }

    return new Product({
      id: cleanId,
      name: cleanName,
      price,
      stock,
      description: cleanDescription,
      category: cleanCategory,
      images: Object.freeze(cleanImages),
    });
  }

  static normalizeId(id: string) {
    return id.trim().toLowerCase();
  }

  // Dos productos no pueden llamarse igual sin importar mayúsculas ni espacios.
  static normalizeName(name: string) {
    return name.trim().toLowerCase();
  }
}
