# Plantilla backend: cableado en el punto de composición

Primero aplica `references/composicion.md` para detectar dónde cablea el proyecto. Esta plantilla aplica cuando existe `src/app.composition.ts` o cuando decides crearlo. Si el proyecto cablea en otro lugar (por módulo, `main.ts`, NestJS…), replica estos mismos bloques en ese lugar.

Agrega cada pieza **en su bloque**, sin reordenar los existentes:

```ts
// imports al final de la lista existente
import { InMemory<Entity>Repository } from './<module>/infrastructure/repositories/in-memory.<entity>-repository.ts';
import { Create<Entity>UseCase } from './<module>/application/use-cases/create-<entity>.use-case.ts';
import { Find<Entity>ByIdUseCase } from './<module>/application/use-cases/find-<entity>-by-id.use-case.ts';
import { FindAll<Entities>UseCase } from './<module>/application/use-cases/find-all-<entities>.use-case.ts';
import { Create<Entity>Controller } from './<module>/presentation/controllers/create-<entity>.controller.ts';
import { Find<Entity>ByIdController } from './<module>/presentation/controllers/find-<entity>-by-id.controller.ts';
import { FindAll<Entities>Controller } from './<module>/presentation/controllers/find-all-<entities>.controller.ts';
import { create<Entities>Router } from './<module>/presentation/routes/<entity>.routes.ts';

export function createApp() {
  //! Repositorios
  // ...existentes
  const <entityVar>Repository = new InMemory<Entity>Repository();

  //! Servicios
  // Reutiliza idGenerator y clock existentes; no crees instancias duplicadas.

  //! Casos de uso
  const create<Entity>UseCase = new Create<Entity>UseCase(
    <entityVar>Repository,
    idGenerator,
    clock
  );
  const find<Entity>ByIdUseCase = new Find<Entity>ByIdUseCase(<entityVar>Repository);
  const findAll<Entities>UseCase = new FindAll<Entities>UseCase(<entityVar>Repository);

  //! Controladores
  const create<Entity>Controller = new Create<Entity>Controller(create<Entity>UseCase);
  const find<Entity>ByIdController = new Find<Entity>ByIdController(find<Entity>ByIdUseCase);
  const findAll<Entities>Controller = new FindAll<Entities>Controller(findAll<Entities>UseCase);

  // Rutas de la app
  const router = Router();
  // ...existentes
  router.use(
    '/<module>',
    create<Entities>Router(
      create<Entity>Controller,
      find<Entity>ByIdController,
      findAll<Entities>Controller
    )
  );

  return createExpressApp(router);
}
```

Si el módulo introduce un error de dominio nuevo, mapéalo en `src/server/presentation/http/error-handler.ts` (cada rama con `response.status(...).json(...)` + `return`).

## Proyecto nuevo (sin composition root)

Si el proyecto no tiene `app.composition.ts`, créalo con esta forma y deja `src/main.ts` solo con el arranque:

```ts
import { createApp } from './app.composition.ts';

const port = Number(process.env.PORT ?? 3000);

const server = createApp().listen(port, () => {
  console.log(`API disponible en http://localhost:${port}`);
});

server.on('error', (error) => {
  console.error('No se pudo iniciar el API:', error.message);
  process.exitCode = 1;
});
```
