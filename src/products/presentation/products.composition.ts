import type Database from 'better-sqlite3';
import type { Router } from 'express';
import type { IdGenerator } from '../../shared/domain/services/id-generator.ts';
// import { InMemoryProductRepository } from '../infrastructure/repositories/in-memory.product-repository.ts';
import { SqliteProductRepository } from '../infrastructure/repositories/sqlite.product-repository.ts';
import { CreateProductUseCase } from '../application/use-cases/create-product.use-case.ts';
import { FindProductByIdUseCase } from '../application/use-cases/find-product-by-id.use-case.ts';
import { FindAllProductsUseCase } from '../application/use-cases/find-all-products.use-case.ts';
import { CreateProductController } from './controllers/create-product.controller.ts';
import { FindProductByIdController } from './controllers/find-product-by-id.controller.ts';
import { FindAllProductsController } from './controllers/find-all-products.controller.ts';
import { createProductsRouter } from './routes/product.routes.ts';

interface ProductsModuleDeps {
  db: Database.Database;
  idGenerator: IdGenerator;
}

// Composición del módulo de productos: arma repositorio, casos de uso y controladores.
// Evita que el punto de arranque conozca los detalles internos de cada módulo.
export function createProductsModule({
  db,
  idGenerator,
}: ProductsModuleDeps): Router {
  //! Repositorio
  // const productRepository = new InMemoryProductRepository();
  const productRepository = new SqliteProductRepository(db);

  //! Casos de uso
  const createProductUseCase = new CreateProductUseCase(
    productRepository,
    idGenerator
  );
  const findProductByIdUseCase = new FindProductByIdUseCase(productRepository);
  const findAllProductsUseCase = new FindAllProductsUseCase(productRepository);

  //! Controladores
  const createProductController = new CreateProductController(
    createProductUseCase
  );
  const findProductByIdController = new FindProductByIdController(
    findProductByIdUseCase
  );
  const findAllProductsController = new FindAllProductsController(
    findAllProductsUseCase
  );

  return createProductsRouter(
    createProductController,
    findProductByIdController,
    findAllProductsController
  );
}
