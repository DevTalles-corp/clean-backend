# Plantilla frontend: mapper DTO ⇄ entidad

Ruta: `src/<module>/infrastructure/mappers/<entity>.mapper.ts`

Aísla la forma de la API (JSON, fechas como string, nombres distintos) del dominio. Si la API cambia, solo cambia este archivo.

```ts
import {
  <Entity>,
  type Create<Entity>Data,
} from '../../domain/entities/<entity>.entity.ts';

// Forma exacta que devuelve la API.
export interface <Entity>Dto {
  id: string;
  <field>: string;
  status: string;
  createdAt: string; // ISO
}

export class <Entity>Mapper {
  static toDomain(dto: <Entity>Dto): <Entity> {
    // Pasa por el dominio: los datos del servidor también cumplen las reglas.
    return <Entity>.restore({
      id: dto.id,
      <field>: dto.<field>,
      status: dto.status,
      createdAt: new Date(dto.createdAt),
    });
  }

  static toCreateDto(data: Create<Entity>Data) {
    return { <field>: data.<field> };
  }
}
```

## `restore` en la entidad

`create()` fija el estado inicial (p. ej. `status: 'pending'`), así que no sirve para reconstruir una entidad que ya existe con otro estado. Añade a la entidad:

```ts
// Reconstruye una entidad existente (desde API o BD) validando también su estado.
static restore(props: Create<Entity>Props & { status: string }): <Entity> {
  if (!(<entity>Statuses as readonly string[]).includes(props.status)) {
    throw new ValidationError(`El estado ${props.status} no es válido.`);
  }
  const base = <Entity>.create(props);
  return new <Entity>({ ...base, status: props.status as <Entity>Status });
}
```

Úsalo también en backend cuando un repositorio real (BD) reconstruya entidades.
