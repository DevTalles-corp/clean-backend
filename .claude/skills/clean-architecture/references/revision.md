# Revisión de capas

## 1. Comandos de detección

Ejecuta desde la raíz del proyecto. Cada resultado es un candidato; confírmalo leyendo el archivo.

Antes: identifica el **punto de composición** (`composicion.md`) y guárdalo en `COMP` para excluirlo:

```bash
COMP='app.composition.ts'   # o el que use el proyecto: main.ts, <module>.composition.ts, <module>.module.ts, app.config.ts…
```

### Comunes (backend y frontend)

```bash
# Dominio/aplicación importando capas externas o librerías
grep -rnE "from '.*/(infrastructure|presentation)/" src/*/domain src/*/application
grep -rnE "from '(express|zod|node:|react|vue|@angular|svelte|axios|[a-z@][^.'/]*)" src/*/domain src/*/application

# Infraestructura importando aplicación o presentación
grep -rnE "from '.*/(application|presentation)/" src/*/infrastructure

# Presentación importando infraestructura (solo el punto de composición puede)
grep -rnE "from '.*/infrastructure/" src/*/presentation

# Efectos no deterministas fuera de infraestructura
grep -rnE "new Date\(\)|randomUUID|Math\.random|Date\.now|fetch\(|localStorage|sessionStorage|window\.|document\." src/*/domain src/*/application

# new de clases concretas fuera del composition root
grep -rnE "new (InMemory|Http|Crypto|System|Fetch|LocalStorage|Prisma)[A-Za-z]*\(" src --include='*.ts' --include='*.tsx' | grep -v "$COMP"

# Sintaxis prohibida por erasableSyntaxOnly
grep -rnE "constructor\((private|public|protected|readonly) |^\s*(export )?enum |namespace " src tests

# Imports relativos sin extensión (solo si el tsconfig usa allowImportingTsExtensions)
grep -rnE "from '\.{1,2}/[^']*'" src tests | grep -vE "\.tsx?'"

# Error genérico en reglas de negocio
grep -rn "throw new Error(" src

# Interfaces con prefijo I
grep -rnE "interface I[A-Z]" src

# Pruebas importadas desde node:test
grep -rn "node:test" tests
```

### Solo frontend

```bash
# Presentación hablando con la API directamente
grep -rnE "fetch\(|axios|XMLHttpRequest" src/*/presentation src/shared/presentation

# Casos de uso con decoradores o hooks de framework
grep -rnE "@Injectable|use[A-Z][a-zA-Z]*\(" src/*/application

# Repositorios HTTP leyendo entorno (debe llegar por constructor)
grep -rnE "import\.meta\.env|process\.env" src/*/infrastructure src/shared/infrastructure

# Componentes importando casos de uso concretos en vez de usarlos vía hook/provider
grep -rnE "from '.*/application/use-cases/" src/*/presentation/components src/*/presentation/pages
```

Clases sin prueba (entidades, casos de uso, repositorios, servicios):

```bash
for f in $(find src -name "*.entity.ts" -o -name "*.use-case.ts" -o -name "*-repository.ts" -o -name "*.mapper.ts" -o -path "*/shared/infrastructure/*" -name "*.ts"); do
  t="tests/${f#src/}"; t="${t%.ts}.test.ts"; [ -f "$t" ] || echo "Falta prueba: $t";
done
```

Carpetas sin README:

```bash
# Excluye src/, src/<module>/ y src/shared/domain (convención actual: README desde la capa hacia abajo)
find src -mindepth 2 -type d ! -path "src/shared/domain" | while read d; do [ -f "$d/README.md" ] || echo "Falta README: $d"; done
```

Ignora coincidencias dentro de comentarios (p. ej. `clock.ts` menciona `new Date()` en su cabecera).

## 2. Checklist manual

### Dominio
- [ ] Entidad con constructor `private`, `static create`, campos `readonly`, `Object.freeze(this)`.
- [ ] `create` normaliza (trim/lowercase) y lanza `ValidationError` con mensaje en español.
- [ ] La entidad no genera ids ni fechas; los recibe en `Create<Entity>Props`.
- [ ] Fechas recibidas copiadas (`new Date(x)`).
- [ ] Valores fijos con `as const` + tipo unión (no `enum`).
- [ ] Contratos como `interface` sin prefijo `I`, devolviendo `Promise`.
- [ ] Comentario de cabecera "qué es / por qué existe".

### Aplicación
- [ ] Una clase por archivo, solo `async execute()` público.
- [ ] Dependencias con `import type`, `private readonly`, asignadas en el constructor.
- [ ] Valida (vía entidad) antes de consultar el repositorio.
- [ ] Lanza `ConflictError`/`NotFoundError`, nunca `Error` genérico.
- [ ] Búsquedas normalizan con `Entity.normalizeX()`.
- [ ] Sin referencias a HTTP (status, request, response).

### Infraestructura
- [ ] `implements <Contrato>` explícito.
- [ ] Nombre `<tecnologia>.<entity>-repository.ts` / `<tecnologia>.<servicio>.ts`.

### Presentación (backend)
- [ ] Schema zod con mensajes en español y tipo `…Input` exportado.
- [ ] Controller sin `request`/`response`; solo mapea y llama `execute`.
- [ ] Router: `requireJson` + `json({ limit: '64kb' })` + `validateBody` en POST; 201/200; 405 con `Allow` coherente con los métodos montados.
- [ ] `error-handler.ts`: cada rama responde y hace `return`; todo error de dominio nuevo está mapeado.

### Presentación (frontend)
- [ ] Componentes y páginas no usan `fetch`/axios ni importan `infrastructure`.
- [ ] Hooks/composables/facades obtienen casos de uso desde la composición (provider/inyección), no con `new`.
- [ ] Errores de dominio traducidos en `error-messages.ts`; nada de `status === 409` en componentes.
- [ ] Estado global (Redux/Zustand/Pinia/NgRx) llama a casos de uso, sin reglas de negocio.

### Infraestructura (frontend)
- [ ] `Http<Entity>Repository implements <Entity>Repository`, `baseUrl` por constructor.
- [ ] Respuestas convertidas con mapper (`<Entity>.restore`/`create`), fechas a `Date`.
- [ ] Status HTTP traducidos a errores de dominio (400/422, 404, 409).

### Composición
- [ ] Toda implementación concreta se instancia solo en el punto de composición del proyecto (sea `app.composition.ts`, composición por módulo, `main.ts` o DI del framework).
- [ ] Con DI de framework: contrato registrado por token; casos de uso creados con `useFactory`, sin decoradores.
- [ ] Servicios compartidos instanciados una vez y reutilizados.
- [ ] Backend: router del módulo montado (`router.use('/<module>', ...)` o equivalente). Frontend: casos de uso expuestos vía provider/plugin.

### Pruebas
- [ ] Ruta espejo de `src/`, importando desde `'vitest'`.
- [ ] `describe('<Clase>')`, `test('...')` en español describiendo comportamiento.
- [ ] `test.each` para variaciones de entrada.
- [ ] Casos de uso con repositorio en memoria o fakes `implements` (nunca tecnología real).
- [ ] `npm test` y `npx tsc` en verde.

## 3. Formato del reporte

```
[Grave]  src/<ruta>.ts:<línea> — <regla violada> — <corrección propuesta>
[Media]  ...
[Menor]  ...
```

Gravedad: regla de dependencias / DIP = **Grave**; errores mal traducidos, falta de pruebas, sintaxis prohibida = **Media**; nombres, comentarios, README = **Menor**.
