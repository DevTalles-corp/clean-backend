# Estructura de carpetas y propósito de cada archivo

Organización **por módulos (features)**; dentro de cada módulo, **por capas**. Cada carpeta tiene un `README.md` en español que explica qué contiene y por qué existe.

La estructura `src/<module>/{domain,application,infrastructure,presentation}`, `src/shared/` y `tests/` es **común a backend y frontend**. El árbol de abajo muestra un backend (Express); `src/server/` es exclusivo de backend. Para el frontend ver `frontend.md`.

`app.composition.ts` es **opcional**: es la forma por defecto del punto de composición, pero el proyecto puede usar otra (ver `composicion.md`).

```
<proyecto>/
  AGENTS.md                         # Instrucciones para agentes (fuente única)
  CLAUDE.md                         # Importa AGENTS.md + recordatorios para Claude
  package.json                      # ESM ("type": "module"), scripts start/dev/test/test:watch
  tsconfig.json                     # strict, noEmit, verbatimModuleSyntax, erasableSyntaxOnly, allowImportingTsExtensions
  vitest.config.ts                  # environment node, include tests/**/*.test.ts
  src/
    main.ts                         # Punto de arranque: lee PORT, llama createApp().listen(), maneja error de arranque
    app.composition.ts              # (Opcional) Punto de composición: instancia implementaciones e inyecta dependencias
    shared/
      domain/
        errors/domain.errors.ts     # Errores de negocio compartidos (ValidationError, ConflictError, NotFoundError)
        services/<servicio>.ts      # Contratos de servicios externos que el negocio necesita (Clock, IdGenerator)
        validators/<regla>.ts       # Funciones puras de validación compartidas (isUuid)
      infrastructure/
        <servicio>/<tecnologia>.<servicio>.ts   # Implementaciones de los contratos compartidos
                                                # clock/system.clock.ts, ids/crypto.id-generator.ts
    server/
      presentation/
        config/express.config.ts    # Crea la app Express: monta router, 404 y errorHandler
        http/error-handler.ts       # Traduce errores de dominio y de Express a códigos HTTP
        http/require-json.ts        # Middleware: exige Content-Type application/json (415)
        http/validate-body.ts       # Middleware: valida body con zod y lanza ValidationError
        routes/public.routes.ts     # Rutas públicas/genéricas (p. ej. GET /)
    <module>/                       # p. ej. users, payments (plural)
      domain/
        entities/<entity>.entity.ts             # Entidad: datos + reglas de validez, inmutable
        repositories/<entity>.repository.ts     # Contrato (interface) de persistencia
      application/
        use-cases/<verbo>-<entity>.use-case.ts  # Una acción del negocio por archivo
      infrastructure/
        repositories/<tecnologia>.<entity>-repository.ts  # Implementación del contrato
      presentation/
        schemas/<verbo>-<entity>.schema.ts      # Schema zod del body + tipo inferido de entrada
        controllers/<verbo>-<entity>.controller.ts  # Adapta entrada externa → caso de uso
        routes/<entity>.routes.ts               # Router Express del módulo (factory con controllers)
  tests/
    <espejo exacto de src/>/<archivo>.test.ts
```

## Propósito de cada carpeta

| Carpeta | Qué contiene | Por qué existe |
| --- | --- | --- |
| `src/<module>/` | Todo lo de una feature | Cambios de una feature quedan juntos; módulos nuevos replican la misma estructura. |
| `domain/` | Entidades y contratos | Mantener las reglas de negocio independientes de Express, la BD o cualquier herramienta. |
| `domain/entities/` | Entidades y sus reglas | Centralizar las garantías de validez; sin ella cada consumidor repetiría validaciones. |
| `domain/repositories/` | Interfaces de persistencia | Definir qué operaciones necesita el negocio sin decir cómo se almacena. Solo abstracciones. |
| `application/` | Acciones de la aplicación | Organizar lo que la app puede hacer con la entidad. |
| `application/use-cases/` | Un caso de uso por archivo | Reunir los pasos de una acción concreta, sin HTTP ni almacenamiento concreto. |
| `infrastructure/` | Implementaciones concretas | Poder cambiar herramientas sin tocar dominio ni casos de uso. |
| `infrastructure/repositories/` | Implementaciones de contratos | Hoy en memoria; mañana BD, sin cambiar reglas de negocio. |
| `presentation/` | Entrada externa | Recibir peticiones (rutas, schemas, controladores) y preparar respuestas. |
| `presentation/schemas/` | Schemas zod | Validar la forma de la entrada externa antes del controlador. |
| `presentation/controllers/` | Controladores | Traducir la entrada validada a la llamada del caso de uso. |
| `presentation/routes/` | Routers Express | Declarar endpoints, middlewares y códigos de estado de éxito. |
| `shared/domain/errors/` | Errores de negocio | Distinguir fallos por significado sin depender de terceros; se traducen en presentación. |
| `shared/domain/services/` | Contratos de servicios | Que dominio y casos de uso dependan de abstracciones (reloj, ids…), no de herramientas. |
| `shared/domain/validators/` | Reglas pequeñas compartidas | No duplicar validaciones; todas las entidades validan igual. Funciones puras. |
| `shared/infrastructure/` | Implementaciones compartidas | Reemplazar herramientas sin tocar dominio. Una subcarpeta por servicio. |
| `server/presentation/` | Infraestructura HTTP transversal | Configuración Express, middlewares y traducción de errores comunes a todos los módulos. |
| `tests/` | Pruebas | Espejo de `src/` para encontrar la prueba de cada archivo al instante. |

## Propósito de cada tipo de archivo

| Archivo | Responsabilidad | No debe |
| --- | --- | --- |
| `*.entity.ts` | Constructor privado, `static create` que normaliza y valida, `Object.freeze`. Exporta `Create<Entity>Data` y `Create<Entity>Props`. | Generar ids/fechas, acceder a repositorios, conocer HTTP. |
| `*.repository.ts` (domain) | `interface` con métodos que reciben/devuelven entidades y retornan `Promise`. | Contener lógica o tecnología. |
| `*.use-case.ts` | Una clase, un `async execute()`. Orquesta entidad + contratos + errores de dominio. | Importar infraestructura/presentación, hacer `new` de implementaciones. |
| `<tec>.<entity>-repository.ts` | `class ... implements <Entity>Repository`. | Ser importado desde dominio o aplicación. |
| `<tec>.<servicio>.ts` | `class ... implements <Servicio>`. Único lugar con `new Date()`, `randomUUID()`, etc. | Contener reglas de negocio. |
| `*.schema.ts` | Schema zod + `type <Verb><Entity>Input = z.infer<...>`. Mensajes en español. | Duplicar reglas de negocio de la entidad (solo forma/tipos). |
| `*.controller.ts` | Recibe el caso de uso por constructor, `handle(input)` mapea la entrada a `execute`. | Manejar `request`/`response` ni códigos HTTP. |
| `*.routes.ts` | `create<Entities>Router(controllers…)`: monta middlewares, llama controllers, fija status de éxito, 405 con `Allow`. | Instanciar casos de uso o repositorios. |
| `http.<entity>-repository.ts` (frontend) | `implements <Entity>Repository` contra la API; traduce status HTTP → errores de dominio. | Leer variables de entorno, conocer componentes. |
| `<entity>.mapper.ts` (frontend) | Convierte DTO de la API ⇄ entidad (`restore`). | Contener reglas de negocio propias. |
| `use-<verbo>-<entity>.ts` (frontend) | Hook/composable: obtiene el caso de uso de la composición, gestiona loading/error/data. | Llamar a `fetch` o importar `infrastructure`. |
| Componentes / páginas (frontend) | Pintar datos y emitir eventos; páginas componen hooks y componentes. | Contener reglas de negocio o acceso a datos. |
| `error-messages.ts` (frontend) | Traducir errores de dominio a textos para el usuario. | Ser llamado desde dominio. |
| Punto de composición (`app.composition.ts`, `<module>.composition.ts`, módulo DI…) | Único lugar donde se hace `new` de implementaciones e inyecta todo. | Contener lógica de negocio. |
| `error-handler.ts` | Mapear `ValidationError→400`, `NotFoundError→404`, `ConflictError→409`, errores de parseo de Express, `500`. | Ser llamado desde dominio. |
| `README.md` | Qué contiene la carpeta y por qué existe, en español. | Describir detalles de implementación que cambian a menudo. |
