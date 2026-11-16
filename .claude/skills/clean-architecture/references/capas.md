# Capas, dependencias y patrones

## Regla de dependencias

```
presentation ──► application ──► domain ◄── infrastructure
```

| Capa                 | Puede importar                                                                                                   | Nunca importa                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `domain`             | `shared/domain`                                                                                                  | application, infrastructure, presentation, librerías externas y de framework (express, zod, ORMs, `node:*`, react, vue, angular, axios, `fetch`, `localStorage`) |
| `application`        | `domain`, `shared/domain`                                                                                        | infrastructure, presentation, librerías externas                                             |
| `infrastructure`     | `domain`, `shared/domain`, librerías/`node:*`                                                                    | application, presentation                                                                    |
| `presentation`       | `application` (como `import type`), `domain`/`shared/domain` (tipos y errores), framework (express, zod, react, vue…) | infrastructure |
| punto de composición | todo (ver `composicion.md`)                                                                                      | —              |

## Inversión de dependencias (obligatorio)

1. **Contrato en el dominio**: `interface` en `domain/repositories/<entity>.repository.ts` (o `shared/domain/services/<servicio>.ts`). Firmas con entidades del dominio y `Promise`.
2. **Implementación en infraestructura** con `implements <Contrato>` explícito.
3. **Caso de uso depende de la abstracción**: `import type`, recibe por constructor, guarda en `private readonly`. Nunca `new` de infraestructura.
4. **Cableado fuera** de dominio/aplicación: en el punto de composición del proyecto (`app.composition.ts`, composición por módulo, `main.ts` o DI del framework). Ver `composicion.md`.
5. **Pruebas** inyectan el repositorio en memoria o un fake con `implements` del contrato.

Mismo patrón para cualquier dependencia externa: hash, ids, reloj, emails, colas, HTTP clients…

## Restricciones de TypeScript

- `verbatimModuleSyntax` → `import type` para interfaces/tipos; import mixto: `import { Payment, type CreatePaymentData } from ...`.
- `allowImportingTsExtensions` → rutas relativas terminan en `.ts` (`.tsx` en componentes). Si el `tsconfig` del destino no lo usa, sigue su estilo.
- `erasableSyntaxOnly` → **prohibido**: `constructor(private x: X)`, `enum`, `namespace`. Usa:
  ```ts
  private readonly repository: PaymentRepository;
  constructor(repository: PaymentRepository) {
    this.repository = repository;
  }
  ```
  y para valores fijos: `const statuses = ['a', 'b'] as const; type Status = (typeof statuses)[number];`
- `strict` activado.

## Patrones por capa

### Entidad

- Comentario de cabecera (qué es / por qué existe) + nota de constructor privado y `Object.freeze`.
- Constructor `private` que recibe un objeto completo, asigna campos `readonly` y llama `Object.freeze(this)`.
- `static create(input: Create<Entity>Props)`:
  - Normaliza: `trim()`, `toLowerCase()` en ids/emails, valores por defecto (`role = 'user'`).
  - Valida y lanza `ValidationError` con mensaje en español terminado en punto.
  - Fija estado inicial (`status: 'pending'`) — no viene del cliente.
  - Copia fechas (`new Date(createdAt)`) para no compartir la instancia recibida.
- `id` y fechas **no** se generan aquí: llegan en `Create<Entity>Props` (los aporta el caso de uso vía `IdGenerator`/`Clock`).
- `static normalize<Field>()` público para que casos de uso normalicen búsquedas igual que la entidad.

### Contrato de repositorio

- Solo firmas. Búsquedas devuelven `Promise<<Entity> | undefined>`; listados `Promise<<Entity>[]>`; `save` devuelve `Promise<void>`.

### Caso de uso

- Comentario de cabecera: "Caso de uso de aplicación: …" + por qué existe.
- Una clase, un único método público `async execute(...)`.
- Crear: `Entity.create({ ...input, id: this.idGenerator.generate(), createdAt: this.clock.now() })` → comprobar duplicado → `ConflictError` → `save` → devolver entidad.
- Buscar: normalizar con `Entity.normalizeX()` → repositorio → `NotFoundError('<Entidad> no encontrado')` si falta.
- Listar: delegar en `findAll()`.
- Validar **antes** de tocar el repositorio (la entidad lanza primero).

### Repositorio de infraestructura

- `implements` el contrato; almacenamiento `private readonly` (p. ej. `Map<string, Entity>`).
- Puede proteger invariantes de unicidad lanzando `ConflictError` en `save` (defensa en profundidad).

### Servicio compartido

- Contrato en `shared/domain/services`, implementación en `shared/infrastructure/<carpeta>/`. Único sitio con `new Date()`, `randomUUID()`, etc.

### Presentación (backend)

Para frontend ver `frontend.md`.


- **Schema**: `z.object({...}, { error: 'El cuerpo debe de ser un JSON' })`, mensajes por campo en español; exporta `type <Verb><Entity>Input = z.infer<...>`. Solo forma/tipos; las reglas de negocio siguen en la entidad.
- **Controller**: recibe el caso de uso (`import type`), `async handle(input)` mapea campo a campo al `execute`. Sin `request`/`response`.
- **Routes**: factory `create<Entities>Router(controllers…)`. POST con `requireJson`, `json({ limit: '64kb' })`, `validateBody(schema)`; status `201` en creación, `200` en lectura; `router.all('/')` → `405` con cabecera `Allow`. Express 5 propaga errores async al `errorHandler`; no uses try/catch.
- **Errores → HTTP** solo en `src/server/presentation/http/error-handler.ts`: `ValidationError 400`, `NotFoundError 404`, `ConflictError 409`, parseo JSON `400`, tamaño `413`, charset `415`, resto `500`. Cada rama termina en `return`.

### Punto de composición

- No siempre es `src/app.composition.ts`: detecta el del proyecto (`composicion.md`).
- Orden: repositorios → servicios → casos de uso → adaptadores (controllers / hooks / providers) → rutas. Servicios compartidos (`idGenerator`, `clock`) se instancian una vez y se reutilizan.
- Con DI de framework: token para el contrato + `useFactory` para el caso de uso (sin decoradores en `application`).

## Errores

- Usa los de `shared/domain/errors/domain.errors.ts`. Si hace falta uno nuevo (p. ej. `UnauthorizedError`), añádelo ahí y tradúcelo en presentación: backend → `error-handler.ts` (error → status HTTP); frontend → `error-messages.ts` (error → mensaje). En frontend, `infrastructure` hace el camino inverso (status HTTP → error de dominio).
- Nunca `throw new Error(...)` para reglas de negocio (solo aceptable en fakes de prueba).
- Mensajes en español.

## Comentarios de cabecera

Archivos de `domain` y `application` empiezan con 2 líneas en español:

```ts
// <Tipo>: <qué es>.
// <Por qué existe / qué problema evita>; sin él, <consecuencia>.
```
