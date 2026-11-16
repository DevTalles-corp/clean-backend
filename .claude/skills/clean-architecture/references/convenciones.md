# Convenciones de nombres

Archivos en **kebab-case** con sufijo de tipo. Clases en **PascalCase**. Módulos (carpetas) en **plural**; entidades en **singular**.

## Tabla completa

| Tipo | Ubicación / archivo | Clase / función / tipo | Ejemplo real |
| --- | --- | --- | --- |
| Carpeta de módulo | `src/<module>/` (plural) | — | `src/payments/` |
| Entidad | `domain/entities/<entity>.entity.ts` | `<Entity>` | `payment.entity.ts` → `Payment` |
| Datos de entrada de la entidad | dentro de `<entity>.entity.ts` | `Create<Entity>Data` (lo que aporta el cliente) | `CreatePaymentData` |
| Props de construcción | dentro de `<entity>.entity.ts` | `Create<Entity>Props extends Create<Entity>Data` (+ `id`, fechas) | `CreatePaymentProps` |
| Valores permitidos | dentro de `<entity>.entity.ts` | `const <entity>Statuses = [...] as const;` + `type <Entity>Status` | `paymentStatuses`, `PaymentStatus` |
| Normalizador estático | método de la entidad | `static normalize<Field>()` | `User.normalizeEmail`, `Payment.normalizeId` |
| Contrato de repositorio | `domain/repositories/<entity>.repository.ts` | `<Entity>Repository` (sin prefijo `I`) | `PaymentRepository` |
| Implementación de repositorio | `infrastructure/repositories/<tecnologia>.<entity>-repository.ts` | `<Tecnologia><Entity>Repository` | `in-memory.payment-repository.ts` → `InMemoryPaymentRepository` |
| Caso de uso | `application/use-cases/<verbo>-<entity>.use-case.ts` | `<Verb><Entity>UseCase` | `create-payment.use-case.ts` → `CreatePaymentUseCase` |
| Caso de uso por campo | `find-<entity>-by-<campo>.use-case.ts` | `Find<Entity>By<Campo>UseCase` | `FindUserByEmailUseCase` |
| Caso de uso de listado | `find-all-<entities>.use-case.ts` (plural) | `FindAll<Entities>UseCase` | `FindAllPaymentsUseCase` |
| Contrato de servicio | `src/shared/domain/services/<servicio>.ts` (sin sufijo) | `<Servicio>` | `clock.ts` → `Clock`, `id-generator.ts` → `IdGenerator` |
| Implementación de servicio | `src/shared/infrastructure/<carpeta>/<tecnologia>.<servicio>.ts` | `<Tecnologia><Servicio>` | `clock/system.clock.ts` → `SystemClock`; `ids/crypto.id-generator.ts` → `CryptoIdGenerator` |
| Validador compartido | `src/shared/domain/validators/<regla>.ts` | `is<Regla>()` | `uuid.ts` → `isUuid` |
| Errores de dominio | `src/shared/domain/errors/domain.errors.ts` | `<Significado>Error extends Error` | `ValidationError`, `ConflictError`, `NotFoundError` |
| Schema zod | `presentation/schemas/<verbo>-<entity>.schema.ts` | `const <verb><Entity>Schema`, `type <Verb><Entity>Input` | `createPaymentSchema`, `CreatePaymentInput` |
| Controlador | `presentation/controllers/<verbo>-<entity>.controller.ts` | `<Verb><Entity>Controller` con `handle()` | `CreatePaymentController` |
| Router | `presentation/routes/<entity>.routes.ts` | `function create<Entities>Router(...)` | `payment.routes.ts` → `createPaymentsRouter` |
| Middleware HTTP | `src/server/presentation/http/<accion>.ts` | `const <accion>: RequestHandler` o factory | `requireJson`, `validateBody(schema)` |
| Config servidor | `src/server/presentation/config/express.config.ts` | `createExpressApp(router)` | — |
| Punto de composición | `src/app.composition.ts` (por defecto) o el que ya use el proyecto | `createApp()` | — |
| Composición por módulo | `src/<module>/<module>.composition.ts` / `<module>.providers.ts` (Angular) / `<module>.module.ts` (Nest) | `create<Entities>Module()` / `<entities>Providers` / `<Entities>Module` | — |
| **Frontend** · repositorio HTTP | `infrastructure/repositories/http.<entity>-repository.ts` | `Http<Entity>Repository` | `HttpPaymentRepository` |
| **Frontend** · mapper | `infrastructure/mappers/<entity>.mapper.ts` | `<Entity>Mapper` (`toDomain`, `toCreateDto`), `<Entity>Dto` | `PaymentMapper` |
| **Frontend** · cliente HTTP | `shared/infrastructure/http/fetch.http-client.ts` | `FetchHttpClient implements HttpClient` | — |
| **Frontend** · hook (React) | `presentation/hooks/use-<verbo>-<entity>.ts` | `use<Verb><Entity>()` | `useCreatePayment` |
| **Frontend** · composable (Vue) | `presentation/composables/use-<verbo>-<entity>.ts` | `use<Verb><Entity>()` | — |
| **Frontend** · facade (Angular) | `presentation/facades/<entity>.facade.ts` | `<Entity>Facade` | — |
| **Frontend** · componente | `presentation/components/<Entity><Rol>.tsx` (o `.vue`, `.component.ts`, `.svelte` según framework) | `<Entity><Rol>` | `PaymentList`, `PaymentForm` |
| **Frontend** · página | `presentation/pages/<Entities>Page.tsx` | `<Entities>Page` | `PaymentsPage` |
| **Frontend** · mensajes de error | `shared/presentation/errors/error-messages.ts` | `toErrorMessage()` | — |
| **Frontend** · provider de casos de uso | `src/app/use-cases.context.tsx` | `UseCasesProvider`, `useUseCases()` | — |
| Prueba | `tests/<misma ruta>/<archivo-original>.test.ts` | `describe('<Clase>')` | `tests/payments/domain/entities/payment.entity.test.ts` |
| Fake de prueba | dentro del test | `<Descriptivo><Servicio> implements <Servicio>` | `SequentialIdGenerator`, `FixedClock` |

Nota: los componentes siguen la convención de nombre del framework (PascalCase en React/Vue/Svelte, `<entity>-<rol>.component.ts` en Angular). El resto de archivos mantiene kebab-case con sufijo de tipo.

## Variables en el punto de composición

camelCase con sufijo del tipo: `paymentRepository`, `idGenerator`, `clock`, `createPaymentUseCase`, `createPaymentController`. En frontend se pueden agrupar por módulo: `{ payments: { create, findById, findAll } }`.

## Idioma

- Identificadores (archivos, clases, métodos, variables, campos): **inglés**.
- Comentarios, `README.md`, mensajes de error, nombres de `test(...)`: **español**.
- `describe` usa el nombre de la clase en inglés.

## Estilo

Comillas simples, punto y coma, 2 espacios. Importaciones relativas siempre con extensión `.ts`.
