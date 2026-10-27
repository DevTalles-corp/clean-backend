import z from 'zod';

export const registerUserSchema = z.object(
  {
    name: z.string({ error: 'name debe de ser texto' }),
    email: z.string({ error: 'email debe de ser texto' }),
  },
  { error: 'El cuerpo debe de ser un JSON' }
);

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
