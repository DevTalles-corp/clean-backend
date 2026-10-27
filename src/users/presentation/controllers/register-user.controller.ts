import type { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case.ts';
import type { RegisterUserInput } from '../schemas/register-user.schema.ts';

export class RegisterUserController {
  private readonly registerUserUseCase: RegisterUserUseCase;

  constructor(registerUserUseCase: RegisterUserUseCase) {
    this.registerUserUseCase = registerUserUseCase;
  }

  async handle(input: RegisterUserInput) {
    return this.registerUserUseCase.execute(input.name, input.email);
  }
}
