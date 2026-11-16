import Database from 'better-sqlite3';
import { ConflictError } from '../../../shared/domain/errors/domain.errors.ts';
import { Product } from '../../domain/entities/product.entity.ts';
import type { ProductRepository } from '../../domain/repositories/product.repository.ts';

interface ProductRow {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  category: string;
  images: string; // JSON con la lista de URLs
}

const selectColumns =
  'SELECT id, name, price, stock, description, category, images FROM products';

export class SqliteProductRepository implements ProductRepository {
  private readonly db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
    // normalized_name guarda Product.normalizeName(name) para que la unicidad
    // ignore mayúsculas y espacios igual que el dominio (COLLATE NOCASE solo cubre ASCII).
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        normalized_name TEXT NOT NULL UNIQUE,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        images TEXT NOT NULL
      )
    `);
  }

  async findById(id: string): Promise<Product | undefined> {
    const row = this.db
      .prepare<[string], ProductRow>(`${selectColumns} WHERE id = ?`)
      .get(id);

    return row ? this.toEntity(row) : undefined;
  }

  async findByName(name: string): Promise<Product | undefined> {
    const row = this.db
      .prepare<[string], ProductRow>(`${selectColumns} WHERE normalized_name = ?`)
      .get(Product.normalizeName(name));

    return row ? this.toEntity(row) : undefined;
  }

  async findAll(): Promise<Product[]> {
    const rows = this.db
      .prepare<[], ProductRow>(`${selectColumns} ORDER BY rowid`)
      .all();

    return rows.map((row) => this.toEntity(row));
  }

  async save(product: Product): Promise<void> {
    try {
      this.db
        .prepare(
          `INSERT INTO products (id, name, normalized_name, price, stock, description, category, images)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          product.id,
          product.name,
          Product.normalizeName(product.name),
          product.price,
          product.stock,
          product.description,
          product.category,
          JSON.stringify(product.images)
        );
    } catch (error) {
      if (
        error instanceof Database.SqliteError &&
        error.code === 'SQLITE_CONSTRAINT_UNIQUE'
      ) {
        throw new ConflictError('Ya existe un producto con ese nombre');
      }
      throw error;
    }
  }

  private toEntity(row: ProductRow): Product {
    return Product.create({
      ...row,
      images: JSON.parse(row.images) as string[],
    });
  }
}
