# AGENTS.md

Backend en TypeScript con **arquitectura limpia**, organizado por módulos (features). Antes de crear cualquier archivo, revisa los archivos existentes del mismo tipo y replica su convención (nombre, ubicación, estructura, comentarios y estilo).

## Stack y comandos

- Node >= 24, ESM (`"type": "module"`), TypeScript ~5.9, Vitest.
- `npm test` — ejecuta las pruebas una vez.
- `npm run test:watch` — pruebas en modo watch.
- `npx tsc` — verificación de tipos (`noEmit` ya está en `tsconfig.json`).

Antes de dar una tarea por terminada, ejecuta `npm test` y `npx tsc`.

## Estructura de carpetas

```
src/
  shared/
    domain/errors/                 # Errores de negocio compartidos
  <modulo>/                        # p. ej. users
    domain/
      entities/                    # Entidades y sus reglas
      repositories/                # Contratos (interfaces) de repositorio
    application/
      use-cases/                   # Casos de uso: una acción por archivo
    infrastructure/
      repositories/                # Implementaciones concretas de los contratos
    presentation/                  # Entrada externa (HTTP, etc.) y traducción de errores
tests/
  <modulo>/...                     # Espejo exacto de la ruta en src/
```

- Cada carpeta tiene un `README.md` en español que explica qué contiene y por qué existe. Si creas una carpeta nueva, crea su `README.md` con el mismo tono.
- Un módulo nuevo replica la misma estructura de capas que `src/users/`.

## Regla de dependencias

```
presentation ──► application ──► domain ◄── infrastructure
```

- `domain` no importa de ninguna otra capa ni de librerías externas (nada de Express, ORMs, etc.). Solo puede importar de `shared/domain`.
- `application` importa únicamente de `domain` y `shared/domain`. Nunca de `infrastructure` ni de `presentation`.
- `infrastructure` implementa contratos de `domain`.
- `presentation` usa casos de uso y traduce los errores de dominio a respuestas externas.

## Inversión de dependencias (obligatorio)

Aplica siempre que crees **casos de uso** o **repositorios**:

1. **El contrato vive en el dominio.** Todo repositorio se define primero como `interface` en `src/<modulo>/domain/repositories/<entidad>.repository.ts`. Las firmas usan entidades del dominio y devuelven `Promise`.
2. **La implementación vive en infraestructura** y declara explícitamente `implements <Contrato>` (p. ej. `class InMemoryUserRepository implements UserRepository`).
3. **El caso de uso depende de la abstracción, no de la implementación.**
   - Importa el contrato con `import type`.
   - Lo recibe por constructor y lo guarda en un campo `private readonly`.
   - Nunca hace `new` de una clase de `infrastructure` ni la importa.
4. **El cableado (composición) ocurre fuera del dominio y de la aplicación**: en `presentation` o en un punto de arranque, donde se instancia la implementación concreta y se inyecta en el caso de uso.
5. **Las pruebas de casos de uso** inyectan una implementación del contrato (el repositorio en memoria o un fake que haga `implements` del contrato), nunca dependen de una tecnología real.

Si un caso de uso necesita otra dependencia externa (hash de contraseñas, generador de IDs, reloj, envío de emails…), aplica el mismo patrón: interfaz en `domain`, implementación en `infrastructure`, inyección por constructor.

## Convenciones de nombres

| Tipo                          | Archivo                                                                 | Clase / interfaz                   |
| ----------------------------- | ----------------------------------------------------------------------- | ---------------------------------- |
| Entidad                       | `user.entity.ts`                                                        | `User`                             |
| Contrato de repositorio       | `user.repository.ts`                                                    | `UserRepository` (sin prefijo `I`) |
| Implementación de repositorio | `in-memory.user-repository.ts` (`<tecnologia>.<entidad>-repository.ts`) | `InMemoryUserRepository`           |
| Caso de uso                   | `register-user.use-case.ts` (`<verbo>-<entidad>.use-case.ts`)           | `RegisterUserUseCase`              |
| Errores de dominio            | `domain.errors.ts`                                                      | `ValidationError`, `ConflictError` |
| Prueba                        | `<archivo-original>.test.ts`                                            | —                                  |

- Archivos en kebab-case con sufijo de tipo (`.entity`, `.repository`, `.use-case`, `.errors`).
- Clases en PascalCase.

## Restricciones de TypeScript (tsconfig)

- `verbatimModuleSyntax`: usa `import type` para todo lo que sea solo tipo (interfaces, tipos).
- `allowImportingTsExtensions`: las importaciones relativas **siempre** llevan la extensión `.ts`.
- `erasableSyntaxOnly`: **no** uses parameter properties (`constructor(private repo: X)`), `enum` ni `namespace`. Declara el campo y asígnalo en el constructor:

```ts
export class RegisterUserUseCase {
  private readonly repository: UserRepository;

  constructor(repository: UserRepository) {
    this.repository = repository;
  }
}
```

- `strict` activado.

## Patrones por capa

**Entidades**

- Constructor `private`; la creación pasa por `static create(...)`.
- `create` normaliza (trim, lowercase cuando aplique) y valida, lanzando `ValidationError`.
- Propiedades `readonly` y `Object.freeze(this)` en el constructor.

**Casos de uso**

- Una clase por acción con un único método público `async execute(...)`.
- Orquesta: crea/valida entidades, consulta el repositorio, lanza errores de dominio (`ConflictError`, etc.) y persiste.
- No conoce HTTP ni el almacenamiento concreto.

**Errores**

- Usa o amplía los errores de `src/shared/domain/errors/domain.errors.ts`. No lances `Error` genérico para reglas de negocio.
- Los mensajes de error se escriben en español.
- La traducción a códigos HTTP se hace en `presentation`.

## Comentarios

- Los archivos de dominio y aplicación empiezan con un comentario en español que explica **qué es** el archivo y **por qué existe** (qué problema evita). Sigue el estilo de `user.entity.ts` y `register-user.use-case.ts`.

## Pruebas

- Vitest; importa `describe`, `test`, `expect`, `beforeEach`, etc. **desde `'vitest'`** (no desde `node:test`).
- Ubicación: `tests/` espejo de `src/` (p. ej. `src/users/domain/entities/user.entity.ts` → `tests/users/domain/entities/user.entity.test.ts`).
- Importa desde `src` con rutas relativas y extensión `.ts`.
- Nombres de `describe` con el nombre de la clase; nombres de `test` en español, describiendo el comportamiento (`'lanza ConflictError si el email ya está registrado'`).
- Usa `test.each` para variaciones de entrada.
- Cada clase nueva (entidad, caso de uso, repositorio) va acompañada de su prueba.

## Estilo de código

- Comillas simples, punto y coma, indentación de 2 espacios.
- Idioma: código (identificadores) en inglés; comentarios, READMEs, mensajes de error y nombres de pruebas en español.
