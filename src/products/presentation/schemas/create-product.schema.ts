import z from 'zod';

export const createProductSchema = z.object(
  {
    name: z.string({ error: 'name debe de ser texto' }),
    price: z.number({ error: 'price debe de ser un número' }),
    stock: z.number({ error: 'stock debe de ser un número' }),
    description: z.string({ error: 'description debe de ser texto' }).optional(),
    category: z.string({ error: 'category debe de ser texto' }),
    images: z
      .array(z.string({ error: 'cada imagen debe de ser texto' }), {
        error: 'images debe de ser una lista de textos',
      })
      .optional(),
  },
  { error: 'El cuerpo debe de ser un JSON' }
);

export type CreateProductInput = z.infer<typeof createProductSchema>;
