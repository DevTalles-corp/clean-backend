import type { CreatePaymentUseCase } from '../../application/use-cases/create-payment.use-case.ts';
import type { CreatePaymentInput } from '../schemas/create-payment.schema.ts';

export class CreatePaymentController {
  private readonly createPaymentUseCase: CreatePaymentUseCase;

  constructor(createPaymentUseCase: CreatePaymentUseCase) {
    this.createPaymentUseCase = createPaymentUseCase;
  }

  async handle(input: CreatePaymentInput) {
    return this.createPaymentUseCase.execute({
      reference: input.reference,
      amount: input.amount,
      customerId: input.customerId,
    });
  }
}
