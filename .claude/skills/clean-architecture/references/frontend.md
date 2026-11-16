# Arquitectura limpia en frontend

Misma estructura y mismas reglas que el backend. Lo que cambia es **qué hay detrás de los contratos** (HTTP en vez de base de datos) y **qué es presentación** (UI en vez de rutas HTTP).

## Estructura

```
src/
  app/                                  # Entrada de la app: App.tsx / main.ts, router, providers globales
  app.composition.ts                    # Punto de composición (si el proyecto no tiene otro; ver composicion.md)
  shared/
    domain/
      errors/domain.errors.ts           # Mismos errores: ValidationError, ConflictError, NotFoundError (+ UnauthorizedError, NetworkError si aplica)
      services/<servicio>.ts            # Contratos: Clock, IdGenerator, Storage, Notifier…
      validators/<regla>.ts             # Funciones puras compartidas (isUuid, isEmail…)
    infrastructure/
      http/fetch.http-client.ts         # (opcional) cliente HTTP común + traducción de status → errores de dominio
      <servicio>/<tecnologia>.<servicio>.ts   # local-storage.storage.ts, system.clock.ts…
    presentation/
      components/                       # Componentes UI genéricos sin negocio (Button, Modal…)
      errors/error-messages.ts          # Traduce errores de dominio a mensajes para el usuario
  <module>/
    domain/
      entities/<entity>.entity.ts       # Igual que en backend
      repositories/<entity>.repository.ts
    application/
      use-cases/<verbo>-<entity>.use-case.ts
    infrastructure/
      repositories/http.<entity>-repository.ts       # Implementación contra la API
      repositories/in-memory.<entity>-repository.ts  # Pruebas, Storybook, modo demo
      mappers/<entity>.mapper.ts                     # DTO de la API ⇄ entidad
    presentation/
      hooks/use-<verbo>-<entity>.ts     # React (Vue: composables/; Angular: facades/ o services/)
      components/<Entity><Algo>.tsx     # Componentes del módulo (o .vue / .component.ts / .svelte)
      pages/<Entities>Page.tsx          # Pantallas/rutas (Next: app/ o pages/ delegan aquí)
      schemas/<verbo>-<entity>.schema.ts  # (opcional) validación de formularios
tests/ (o src/**/*.test.ts si el framework lo exige; ver nota)
```

Nota: si el tooling del frontend (Vite, Next, Angular CLI) espera pruebas junto al código, respeta lo que ya use el proyecto; si no hay nada, usa `tests/` espejo como en backend.

## Capas en frontend

| Capa | Contiene | Puede importar | Nunca importa |
| --- | --- | --- | --- |
| `domain` | Entidades, contratos, errores | `shared/domain` | React/Vue/Angular, `fetch`, axios, `localStorage`, zod |
| `application` | Casos de uso | `domain`, `shared/domain` | framework, infraestructura, presentación |
| `infrastructure` | Repos HTTP/storage, mappers, http client | `domain`, `shared/domain`, `fetch`/axios/APIs del navegador | `application`, `presentation` |
| `presentation` | Hooks, componentes, páginas, mensajes | `application` (casos de uso), `domain` (tipos/errores), framework | `infrastructure` |
| composición | Instancia todo y lo expone (provider/plugin/DI) | todo | — |

## Contrato de repositorio en frontend

En frontend el servidor suele generar `id` y fechas, así que el contrato recibe los **datos de entrada** y devuelve la **entidad**:

```ts
export interface <Entity>Repository {
  findById(id: string): Promise<<Entity> | undefined>;
  findAll(): Promise<<Entity>[]>;
  create(data: Create<Entity>Data): Promise<<Entity>>;
}
```

Si el frontend genera ids (offline-first), usa el mismo contrato que backend (`save(entity)`) con `IdGenerator`/`Clock`.

## Infraestructura HTTP

- `http.<entity>-repository.ts` → `class Http<Entity>Repository implements <Entity>Repository`.
- Recibe por constructor `baseUrl` (y opcionalmente un `HttpClient`/`fetch`) — nunca lee `import.meta.env` dentro.
- Convierte la respuesta con el **mapper** (`<Entity>Mapper.toDomain(dto)`), que usa `<Entity>.create(...)` para que los datos del servidor también pasen las reglas del dominio. Fechas: `new Date(dto.createdAt)`.
- **Traduce HTTP → errores de dominio** (inverso al `error-handler` del backend):

| Status | Resultado |
| --- | --- |
| 400 / 422 | `ValidationError(body.error)` |
| 404 en `findById` | `undefined` (el caso de uso lanza `NotFoundError`) |
| 404 en otras operaciones | `NotFoundError(body.error)` |
| 409 | `ConflictError(body.error)` |
| 401 / 403 | `UnauthorizedError` (añádelo a `domain.errors.ts` si hace falta) |
| fallo de red / 5xx | error genérico de infraestructura que presentación muestra como "inténtalo más tarde" |

Si varios repos repiten esa traducción, extráela a `src/shared/infrastructure/http/fetch.http-client.ts` detrás de un contrato `HttpClient` en `shared/domain/services/http-client.ts`.

## Casos de uso en frontend

- Mismas plantillas (`templates/application/`): una clase, `async execute()`, dependencias por constructor.
- Buscar por id y listar: idénticos al backend.
- Crear: ver `templates/frontend/create.use-case.ts.md` (valida localmente y delega al repositorio; el servidor sigue siendo la fuente de verdad).
- Lógica de UI (abrir modales, toasts, navegación) **no** va aquí: va en presentación.

## Presentación

- **Hooks/composables/facades**: única puerta entre UI y casos de uso. Obtienen el caso de uso desde la composición (contexto/inyección), gestionan `loading`/`error`/`data`.
- **Componentes**: reciben datos y callbacks; no conocen repositorios ni `fetch`.
- **Páginas**: componen componentes y hooks; las rutas del framework (Next `app/`, Nuxt `pages/`, React Router) solo delegan a `<module>/presentation/pages`.
- **Errores**: `src/shared/presentation/errors/error-messages.ts` traduce `ValidationError`/`ConflictError`/`NotFoundError`/`UnauthorizedError` a textos en español (equivalente frontend del `error-handler.ts`).
- **Estado global** (Redux, Zustand, Pinia, NgRx): vive en presentación y llama a casos de uso; nunca contiene reglas de negocio ni hace `fetch` directo.

## Pruebas

- Entidades y casos de uso: mismas plantillas que backend, con repositorio en memoria.
- Repositorio HTTP: `vi.stubGlobal('fetch', ...)` o un fake de `HttpClient`; verifica URL, método, mapeo y traducción de status.
- Hooks/componentes: Testing Library del framework con un caso de uso fake inyectado vía provider.
