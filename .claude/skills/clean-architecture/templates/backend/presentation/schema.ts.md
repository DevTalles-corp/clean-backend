# Plantilla: schema zod

Ruta: `src/<module>/presentation/schemas/<verbo>-<entity>.schema.ts`
Basada en: `src/payments/presentation/schemas/create-payment.schema.ts`

Solo valida **forma y tipos** de la entrada externa. Las reglas de negocio (vacío, rangos, formato UUID…) siguen en la entidad.

```ts
import z from 'zod';

export const <verb><Entity>Schema = z.object(
  {
    <field>: z.string({ error: '<field> debe de ser texto' }),
    // amount: z.number({ error: 'amount debe de ser un número' }),
    // role: z.enum(['user', 'admin']).optional(),
  },
  { error: 'El cuerpo debe de ser un JSON' }
);

export type <Verb><Entity>Input = z.infer<typeof <verb><Entity>Schema>;
```
