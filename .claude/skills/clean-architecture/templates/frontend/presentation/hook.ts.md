# Plantilla frontend: hook / composable + componente

Ruta hook (React): `src/<module>/presentation/hooks/use-<verbo>-<entity>.ts`
Equivalentes: Vue `presentation/composables/use-<verbo>-<entity>.ts`; Angular `presentation/facades/<entity>.facade.ts`.

El hook es la **única puerta** entre UI y casos de uso. Equivale al controller del backend: adapta, no decide reglas.

## Hook de lectura

```ts
import { useEffect, useState } from 'react';
import type { <Entity> } from '../../domain/entities/<entity>.entity.ts';
import { useUseCases } from '../../../app/use-cases.context.tsx';
import { toErrorMessage } from '../../../shared/presentation/errors/error-messages.ts';

export function useFindAll<Entities>() {
  const { <entitiesVar> } = useUseCases();
  const [data, setData] = useState<<Entity>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    <entitiesVar>.findAll
      .execute()
      .then((result) => active && setData(result))
      .catch((err: unknown) => active && setError(toErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [<entitiesVar>]);

  return { data, error, loading };
}
```

Si el proyecto usa TanStack Query/SWR, el `queryFn` llama al caso de uso (`() => <entitiesVar>.findAll.execute()`), nunca a `fetch`.

## Hook de escritura

```ts
import { useState } from 'react';
import type { Create<Entity>Data } from '../../domain/entities/<entity>.entity.ts';
import { useUseCases } from '../../../app/use-cases.context.tsx';
import { toErrorMessage } from '../../../shared/presentation/errors/error-messages.ts';

export function useCreate<Entity>() {
  const { <entitiesVar> } = useUseCases();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function create(input: Create<Entity>Data) {
    setPending(true);
    setError(null);
    try {
      return await <entitiesVar>.create.execute(input);
    } catch (err) {
      setError(toErrorMessage(err));
      return undefined;
    } finally {
      setPending(false);
    }
  }

  return { create, error, pending };
}
```

## Componente

Ruta: `src/<module>/presentation/components/<Entity>List.tsx`

```tsx
import type { <Entity> } from '../../domain/entities/<entity>.entity.ts';

// Componente de presentación: solo pinta datos recibidos; no conoce casos de uso ni la API.
export function <Entity>List(props: { <entitiesVar>: <Entity>[] }) {
  return (
    <ul>
      {props.<entitiesVar>.map((<entityVar>) => (
        <li key={<entityVar>.id}><entityVar>.<field></li>
      ))}
    </ul>
  );
}
```

## Página

Ruta: `src/<module>/presentation/pages/<Entities>Page.tsx`

```tsx
import { useFindAll<Entities> } from '../hooks/use-find-all-<entities>.ts';
import { <Entity>List } from '../components/<Entity>List.tsx';

export function <Entities>Page() {
  const { data, error, loading } = useFindAll<Entities>();

  if (loading) return <p>Cargando…</p>;
  if (error) return <p role="alert">{error}</p>;
  return <<Entity>List <entitiesVar>={data} />;
}
```

## Mensajes de error — `src/shared/presentation/errors/error-messages.ts`

Equivalente frontend del `error-handler.ts` del backend.

```ts
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../domain/errors/domain.errors.ts';

// Traduce errores del dominio a mensajes para el usuario.
export function toErrorMessage(error: unknown): string {
  if (error instanceof ValidationError) return error.message;
  if (error instanceof ConflictError) return error.message;
  if (error instanceof NotFoundError) return error.message;
  return 'Ocurrió un error inesperado. Inténtalo más tarde.';
}
```
