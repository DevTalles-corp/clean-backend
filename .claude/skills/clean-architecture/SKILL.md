---
name: clean-architecture
description: Crea módulos/features y revisa código TypeScript con arquitectura limpia (domain, application, infrastructure, presentation) e inversión de dependencias, tanto en backend (Express, Nest, etc.) como en frontend (React, Vue, Angular, Svelte…), respetando la misma estructura de carpetas, nombres de archivo y propósito de cada capa. Úsala cuando el usuario pida "nuevo módulo", "agregar feature", "crear entidad", "caso de uso", "repositorio", "servicio de dominio", "controlador/ruta", "componente/hook/página conectada a un caso de uso", "consumir API con arquitectura limpia", "revisar capas", "revisar arquitectura limpia" o "violaciones de dependencias".
---

# Arquitectura limpia (TypeScript · backend y frontend)

Skill basada en el proyecto `clean-backend` (módulos `users`, `payments`, `shared`, `server`). Backend y frontend comparten **la misma estructura de carpetas por módulo y por capa**; solo cambian los adaptadores de `infrastructure` y `presentation`.

```
src/<module>/{domain,application,infrastructure,presentation}
src/shared/{domain,infrastructure,...}
tests/  ← espejo de src/
```

> Si el proyecto destino ya tiene `AGENTS.md`/`CLAUDE.md` o convenciones propias distintas, **esas mandan**. Esta skill es el punto de partida, no un reemplazo.

## Paso 0 — Detectar el contexto (siempre, antes de crear nada)

1. **Tipo de proyecto**: mira `package.json`.
   - Backend: `express`, `fastify`, `@nestjs/*`, `hono`, sin dependencias de UI.
   - Frontend: `react`, `vue`, `@angular/core`, `svelte`, `solid-js`, `vite`/`next`/`nuxt`.
   - Ambos (monorepo): aplica cada parte en su paquete.
2. **Punto de composición** (dónde se instancian las implementaciones): **no asumas que existe `app.composition.ts`**. Sigue [references/composicion.md](references/composicion.md) para encontrarlo o decidir dónde crearlo.
3. **Convenciones de TypeScript del destino**: lee su `tsconfig.json` (extensión `.ts` en imports, `erasableSyntaxOnly`, alias `@/`…) y adáptate.
4. **Módulos existentes**: lee un archivo del mismo tipo y replica su estilo.

## Referencias

| Archivo | Cuándo |
| --- | --- |
| [references/estructura.md](references/estructura.md) | Siempre: árbol común y propósito de cada carpeta y archivo. |
| [references/convenciones.md](references/convenciones.md) | Antes de nombrar archivos, clases, funciones o tipos. |
| [references/capas.md](references/capas.md) | Antes de escribir código: regla de dependencias, DIP, patrones por capa, restricciones TS. |
| [references/composicion.md](references/composicion.md) | Para cablear: detectar o crear el punto de composición. |
| [references/frontend.md](references/frontend.md) | Si el proyecto es frontend: adaptadores HTTP, UI, estado y errores. |
| [references/revision.md](references/revision.md) | Flujo de revisión: checklist y comandos de detección. |

### Plantillas

| Carpeta | Uso |
| --- | --- |
| `templates/domain/` | Entidad, contrato de repositorio, servicio. **Común** a backend y frontend. |
| `templates/application/` | Casos de uso. **Común** (en frontend ver variante de creación en `templates/frontend/`). |
| `templates/infrastructure/` | Repositorio en memoria. **Común** (pruebas, prototipos, mocks). |
| `templates/tests/` | Pruebas de entidad, casos de uso y repositorio en memoria. **Comunes**. |
| `templates/readmes.md` | README de cada carpeta (común + secciones backend/frontend). |
| `templates/backend/` | Schema zod, controller, routes, composición backend. |
| `templates/frontend/` | Repositorio HTTP, mapper, composición, hook/componente, mensajes de error, pruebas. |

### Placeholders

| Placeholder | Ejemplo |
| --- | --- |
| `<module>` | `payments` (carpeta del módulo, plural, kebab-case) |
| `<entity>` | `payment` (singular, kebab-case, para archivos) |
| `<Entity>` / `<Entities>` | `Payment` / `Payments` (PascalCase) |
| `<entityVar>` / `<entitiesVar>` | `payment` / `payments` (camelCase) |
| `<Verb>` / `<verb>` | `Create` / `create` |
| `<field>` / `<Field>` | `reference` / `Reference` (campo único del negocio) |
| `<Entidad en español>` | `Pago` (mensajes y comentarios) |

## Flujo A — Agregar módulo o feature

Sigue este orden; cada paso depende del anterior.

1. **Paso 0** (contexto y punto de composición).
2. **Dominio** (`src/<module>/domain/`) — igual en backend y frontend.
   - Entidad → `templates/domain/entity.ts.md`
   - Contrato de repositorio → `templates/domain/repository.ts.md` (frontend: firmas según `references/frontend.md`).
   - Dependencias externas (hora, ids, almacenamiento, notificaciones…) → contrato en `src/shared/domain/services/` (`templates/domain/service.ts.md`). Reutiliza los existentes.
   - Validaciones compartidas → `src/shared/domain/validators/`. Errores → `src/shared/domain/errors/domain.errors.ts`.
3. **Aplicación** (`src/<module>/application/use-cases/`) — una acción por archivo → `templates/application/*`.
4. **Infraestructura**
   - Backend: repositorio de persistencia (`in-memory`, `prisma`, `postgres`…).
   - Frontend: repositorio HTTP + mapper DTO→entidad (`templates/frontend/infrastructure/*`).
5. **Presentación**
   - Backend: schema → controller → routes (`templates/backend/presentation/*`).
   - Frontend: hook/composable → componentes → páginas, mensajes de error (`templates/frontend/presentation/*`).
6. **Composición**: según lo detectado en el paso 0 (`references/composicion.md`).
7. **README.md** en cada carpeta nueva → `templates/readmes.md`.
8. **Pruebas** espejo en `tests/`. Toda entidad, caso de uso, repositorio e implementación de servicio lleva prueba.
9. **Verificar** con los scripts del proyecto (`npm test`, `npx tsc` o equivalentes en `package.json`).
10. **Auto-revisión** con `references/revision.md`.

### Reglas que nunca se rompen

- `domain` no importa de otras capas ni de librerías externas o de framework (express, zod, react, vue, angular, axios, `fetch`, `localStorage`…). Solo `shared/domain`.
- `application` solo importa de `domain` y `shared/domain`; recibe dependencias por constructor como interfaces (`import type`).
- Nada no determinista ni de E/S en `domain`/`application` (`new Date()`, `randomUUID()`, `fetch`, `localStorage`): va detrás de un contrato.
- `new` de implementaciones concretas solo en el punto de composición (y en pruebas).
- En frontend, los componentes **no** llaman a `fetch`/`axios` ni importan `infrastructure`: usan casos de uso.
- Sin parameter properties, `enum` ni `namespace` si el `tsconfig` tiene `erasableSyntaxOnly` (recomendado).
- `import type` para tipos; extensión en imports relativos según `tsconfig` del destino.
- Identificadores en inglés; comentarios, READMEs, mensajes de error y nombres de pruebas en español.

## Flujo B — Revisar capas

1. Paso 0 (tipo de proyecto y punto de composición).
2. Lee `references/revision.md` y ejecuta los comandos de detección (comunes + backend o frontend).
3. Revisa a mano lo que un grep no cubre.
4. Reporta cada hallazgo como `ruta:línea — regla violada — corrección propuesta`, ordenado por gravedad.
5. No corrijas nada salvo que el usuario lo pida.
