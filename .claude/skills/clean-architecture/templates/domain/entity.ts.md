# Plantilla: entidad

Ruta: `src/<module>/domain/entities/<entity>.entity.ts`
Basada en: `src/payments/domain/entities/payment.entity.ts`

Ajusta campos y validaciones al negocio. Elimina lo que no aplique (status, fechas, `<field>`).

```ts
// Entidad del dominio <Entity>: reúne los datos y las reglas que mantienen válido e inmutable cada <entidad en español>.
// Centraliza esas garantías; sin ella, cada consumidor tendría que repetirlas y podrían circular <entidades> inválidos.

// El constructor privado dirige la creación a create() en TypeScript.
// readonly protege en TypeScript; Object.freeze impide cambios en ejecución.

import { ValidationError } from '../../../shared/domain/errors/domain.errors.ts';
import { isUuid } from '../../../shared/domain/validators/uuid.ts';

const <entity>Statuses = ['active', 'inactive'] as const;
export type <Entity>Status = (typeof <entity>Statuses)[number];

// Datos que aporta quien solicita la creación (p. ej. el cliente HTTP).
export interface Create<Entity>Data {
  <field>: string;
}

// Datos para construir la entidad: el id y la fecha los aporta quien la crea (p. ej. el caso de uso).
export interface Create<Entity>Props extends Create<Entity>Data {
  id: string;
  createdAt: Date;
}

export class <Entity> {
  readonly id: string; // UUID
  readonly <field>: string;
  readonly status: <Entity>Status;
  readonly createdAt: Date;

  private constructor(<entityVar>: {
    id: string;
    <field>: string;
    status: <Entity>Status;
    createdAt: Date;
  }) {
    const { id, <field>, status, createdAt } = <entityVar>;

    this.id = id;
    this.<field> = <field>;
    this.status = status;
    this.createdAt = createdAt;

    Object.freeze(this);
  }

  static create(input: Create<Entity>Props): <Entity> {
    const { id, <field>, createdAt } = input;

    const cleanId = <Entity>.normalizeId(id);
    const clean<Field> = <Entity>.normalize<Field>(<field>);

    if (!isUuid(cleanId)) {
      throw new ValidationError('El id debe ser un UUID válido.');
    }
    if (!clean<Field>) {
      throw new ValidationError('El <campo> es obligatorio.');
    }
    if (!(createdAt instanceof Date) || Number.isNaN(createdAt.getTime())) {
      throw new ValidationError('La fecha de creación no es válida.');
    }

    // Estado inicial definido por el negocio, nunca por el cliente.
    return new <Entity>({
      id: cleanId,
      <field>: clean<Field>,
      status: 'active',
      createdAt: new Date(createdAt), // copia: no compartir la instancia recibida
    });
  }

  static normalizeId(id: string) {
    return id.trim().toLowerCase();
  }

  static normalize<Field>(<field>: string) {
    return <field>.trim();
  }
}
```

Notas:
- Valores con default (como `role = 'user'` en `User`) se resuelven en la desestructuración de `create` y se validan con `<lista>.includes(valor)`.
- Montos: `Number.isFinite(x) && x > 0`; máximo 2 decimales como en `Payment`.
- Reconstruir una entidad existente (desde API o BD) con un estado distinto al inicial: añade `static restore(...)` (ver `templates/frontend/infrastructure/mapper.ts.md`).
- Frontend que no genera ids: añade `static validate(input: Create<Entity>Data)` (ver `templates/frontend/create.use-case.ts.md`) y reutilízalo dentro de `create`.
