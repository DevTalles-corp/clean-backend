import type { CreateProductUseCase } from '../../application/use-cases/create-product.use-case.ts';
import type { CreateProductInput } from '../schemas/create-product.schema.ts';

export class CreateProductController {
  private readonly createProductUseCase: CreateProductUseCase;

  constructor(createProductUseCase: CreateProductUseCase) {
    this.createProductUseCase = createProductUseCase;
  }

  async handle(input: CreateProductInput) {
    return this.createProductUseCase.execute({
      name: input.name,
      price: input.price,
      stock: input.stock,
      description: input.description,
      category: input.category,
      images: input.images,
    });
  }
}
