# Plantilla: servicio de dominio (contrato + implementación + prueba)

Úsala para cualquier dependencia externa: hash de contraseñas, envío de emails, generador de ids, reloj…
Basada en: `src/shared/domain/services/clock.ts`, `src/shared/infrastructure/clock/system.clock.ts`.

Antes de crear uno, comprueba si ya existe (`Clock`, `IdGenerator`).

## 1. Contrato — `src/shared/domain/services/<servicio>.ts`

```ts
// Contrato del dominio: <qué hace> sin depender de <tecnología concreta>.
// Invierte la dependencia hacia una abstracción; sin él, los casos de uso <consecuencia: acoplamiento / no testeable>.

export interface <Servicio> {
  <metodo>(<args>): <TipoRetorno>;
}
```

Si el servicio solo lo usa un módulo, puede vivir en `src/<module>/domain/services/` con la misma forma.

## 2. Implementación — `src/shared/infrastructure/<carpeta>/<tecnologia>.<servicio>.ts`

```ts
import { <apiExterna> } from '<libreria-o-node:modulo>';
import type { <Servicio> } from '../../domain/services/<servicio>.ts';

export class <Tecnologia><Servicio> implements <Servicio> {
  <metodo>(<args>): <TipoRetorno> {
    return <apiExterna>(<args>);
  }
}
```

Ejemplos reales: `ids/crypto.id-generator.ts` → `CryptoIdGenerator` (usa `randomUUID`), `clock/system.clock.ts` → `SystemClock` (usa `new Date()`).

## 3. README de la carpeta de infraestructura

```md
# <Nombre en español>

Aquí se implementa el contrato `<Servicio>` definido en el dominio.

Actualmente usamos <tecnología>. Gracias al contrato, en las pruebas podemos inyectar un fake y obtener resultados predecibles; si mañana necesitamos otra herramienta, solo se reemplaza esta implementación.
```

Actualiza también `src/shared/domain/services/README.md` mencionando el nuevo contrato.

## 4. Prueba — `tests/shared/infrastructure/<carpeta>/<tecnologia>.<servicio>.test.ts`

```ts
import { describe, expect, test } from 'vitest';
import { <Tecnologia><Servicio> } from '../../../../src/shared/infrastructure/<carpeta>/<tecnologia>.<servicio>.ts';

describe('<Tecnologia><Servicio>', () => {
  test('<comportamiento esperado en español>', () => {
    const result = new <Tecnologia><Servicio>().<metodo>(<args>);

    expect(result).<matcher>;
  });
});
```

## 5. Fake para pruebas de casos de uso

```ts
class Fixed<Servicio> implements <Servicio> {
  private readonly value: <TipoRetorno>;

  constructor(value: <TipoRetorno>) {
    this.value = value;
  }

  <metodo>(): <TipoRetorno> {
    return this.value;
  }
}
```

## 6. Inyección

Agregar al caso de uso como `private readonly <servicio>: <Servicio>` (con `import type`) y en `app.composition.ts` bajo `//! Servicios`.
