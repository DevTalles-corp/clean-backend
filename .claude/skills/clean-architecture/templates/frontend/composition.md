# Plantilla frontend: composición

Primero aplica `references/composicion.md` (detectar). Esta plantilla es para cuando no hay nada o ya existe `src/app.composition.ts`.

## 1. `src/app.composition.ts` — instancia todo (sin framework)

```ts
import { Http<Entity>Repository } from './<module>/infrastructure/repositories/http.<entity>-repository.ts';
import { Create<Entity>UseCase } from './<module>/application/use-cases/create-<entity>.use-case.ts';
import { Find<Entity>ByIdUseCase } from './<module>/application/use-cases/find-<entity>-by-id.use-case.ts';
import { FindAll<Entities>UseCase } from './<module>/application/use-cases/find-all-<entities>.use-case.ts';

export function createApp(config: { apiUrl: string }) {
  //! Repositorios
  const <entityVar>Repository = new Http<Entity>Repository(config.apiUrl);

  //! Servicios
  // const clock = new SystemClock();

  //! Casos de uso
  return {
    <entitiesVar>: {
      create: new Create<Entity>UseCase(<entityVar>Repository),
      findById: new Find<Entity>ByIdUseCase(<entityVar>Repository),
      findAll: new FindAll<Entities>UseCase(<entityVar>Repository),
    },
  };
}

export type AppUseCases = ReturnType<typeof createApp>;
```

`config` se lee en la entrada de la app (`import.meta.env.VITE_API_URL`, `process.env.NEXT_PUBLIC_API_URL`), no aquí dentro.

## 2. Exponerlo a la UI

### React — `src/app/use-cases.context.tsx`

```tsx
import { createContext, useContext, type ReactNode } from 'react';
import type { AppUseCases } from '../app.composition.ts';

const UseCasesContext = createContext<AppUseCases | null>(null);

export function UseCasesProvider(props: { useCases: AppUseCases; children: ReactNode }) {
  return (
    <UseCasesContext.Provider value={props.useCases}>{props.children}</UseCasesContext.Provider>
  );
}

export function useUseCases(): AppUseCases {
  const useCases = useContext(UseCasesContext);
  if (!useCases) throw new Error('UseCasesProvider no está montado');
  return useCases;
}
```

Entrada (`src/main.tsx`):

```tsx
const useCases = createApp({ apiUrl: import.meta.env.VITE_API_URL });
createRoot(document.getElementById('root')!).render(
  <UseCasesProvider useCases={useCases}>
    <App />
  </UseCasesProvider>
);
```

### Vue — `app.provide`

```ts
export const useCasesKey: InjectionKey<AppUseCases> = Symbol('useCases');
app.provide(useCasesKey, createApp({ apiUrl: import.meta.env.VITE_API_URL }));
// en composables: const useCases = inject(useCasesKey)!;
```

### Angular

Usa `InjectionToken` + `useFactory` (ver `references/composicion.md` §3) en `app.config.ts` o en `<module>.providers.ts`.

## 3. Pruebas

En pruebas de hooks/componentes, monta el provider con casos de uso construidos sobre `InMemory<Entity>Repository` o fakes; nunca con `createApp` real.
