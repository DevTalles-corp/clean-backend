import type { FindAllProductsUseCase } from '../../application/use-cases/find-all-products.use-case.ts';

export class FindAllProductsController {
  private readonly findAllProductsUseCase: FindAllProductsUseCase;

  constructor(findAllProductsUseCase: FindAllProductsUseCase) {
    this.findAllProductsUseCase = findAllProductsUseCase;
  }

  async handle() {
    return this.findAllProductsUseCase.execute();
  }
}
