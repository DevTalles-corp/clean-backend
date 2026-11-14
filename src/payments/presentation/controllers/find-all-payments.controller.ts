import type { FindAllPaymentsUseCase } from '../../application/use-cases/find-all-payments.use-case.ts';

export class FindAllPaymentsController {
  private readonly findAllPaymentsUseCase: FindAllPaymentsUseCase;

  constructor(findAllPaymentsUseCase: FindAllPaymentsUseCase) {
    this.findAllPaymentsUseCase = findAllPaymentsUseCase;
  }

  async handle() {
    return this.findAllPaymentsUseCase.execute();
  }
}
