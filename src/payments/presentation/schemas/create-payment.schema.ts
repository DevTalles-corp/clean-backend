import z from 'zod';

export const createPaymentSchema = z.object(
  {
    reference: z.string({ error: 'reference debe de ser texto' }),
    amount: z.number({ error: 'amount debe de ser un número' }),
    customerId: z.string({ error: 'customerId debe de ser texto' }),
  },
  { error: 'El cuerpo debe de ser un JSON' }
);

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
