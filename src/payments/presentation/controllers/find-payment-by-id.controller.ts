import type { FindPaymentByIdUseCase } from '../../application/use-cases/find-payment-by-id.use-case.ts';

export class FindPaymentByIdController {
  private readonly findPaymentByIdUseCase: FindPaymentByIdUseCase;

  constructor(findPaymentByIdUseCase: FindPaymentByIdUseCase) {
    this.findPaymentByIdUseCase = findPaymentByIdUseCase;
  }

  async handle(id: string) {
    return this.findPaymentByIdUseCase.execute(id);
  }
}
