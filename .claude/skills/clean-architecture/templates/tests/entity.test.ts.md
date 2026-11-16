# Plantilla: prueba de entidad

Ruta: `tests/<module>/domain/entities/<entity>.entity.test.ts`
Basada en: `tests/payments/domain/entities/payment.entity.test.ts`

Cubre: creación normalizada, defaults/estado inicial, cada validación con `test.each`, copia de fechas, inmutabilidad.

```ts
import { describe, expect, test } from 'vitest';
import { <Entity> } from '../../../../src/<module>/domain/entities/<entity>.entity.ts';
import { ValidationError } from '../../../../src/shared/domain/errors/domain.errors.ts';

const id = '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e';
const createdAt = new Date('2026-01-15T10:00:00.000Z');

const validProps = {
  id,
  <field>: '<valor válido>',
  createdAt,
};

describe('<Entity> Entity', () => {
  test('crea un <entidad> con sus datos normalizados', () => {
    const <entityVar> = <Entity>.create({
      ...validProps,
      id: `  ${id.toUpperCase()}  `,
      <field>: '   <valor válido>   ',
    });

    expect(<entityVar>).toBeInstanceOf(<Entity>);
    expect(<entityVar>.id).toBe(id);
    expect(<entityVar>.<field>).toBe('<valor válido>');
  });

  test('no comparte la instancia de fecha recibida', () => {
    const date = new Date(createdAt);
    const <entityVar> = <Entity>.create({ ...validProps, createdAt: date });

    date.setFullYear(2000);

    expect(<entityVar>.createdAt).toEqual(createdAt);
  });

  test.each(['', '   ', 'abc', '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4'])(
    'rechaza el id inválido %j',
    (invalidId) => {
      expect(() => <Entity>.create({ ...validProps, id: invalidId })).toThrow(
        new ValidationError('El id debe ser un UUID válido.')
      );
    }
  );

  test.each(['', '   ', '\t\n'])('rechaza el <campo> vacío %j', (<field>) => {
    expect(() => <Entity>.create({ ...validProps, <field> })).toThrow(
      new ValidationError('El <campo> es obligatorio.')
    );
  });

  test('rechaza una fecha de creación inválida', () => {
    expect(() =>
      <Entity>.create({ ...validProps, createdAt: new Date('no-es-fecha') })
    ).toThrow(new ValidationError('La fecha de creación no es válida.'));
  });

  test('impide modificar sus datos en ejecución', () => {
    const <entityVar> = <Entity>.create(validProps);

    expect(Reflect.set(<entityVar>, '<field>', 'otro')).toBe(false);
    expect(<entityVar>.<field>).toBe('<valor válido>');
  });
});
```
