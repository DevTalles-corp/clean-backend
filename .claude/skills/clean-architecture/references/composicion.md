# Punto de composición (composition root)

Es el **único lugar** donde se hace `new` de implementaciones concretas (`infrastructure`) y se inyectan en casos de uso y adaptadores de presentación. Dominio y aplicación nunca saben quién los construye.

**No asumas que existe `src/app.composition.ts`.** Primero detecta qué usa el proyecto.

## 1. Detectar

Busca, en este orden, y usa el primero que encuentres:

```bash
# Archivos de composición explícitos
find src -name "*.composition.ts" -o -name "*.container.ts" -o -name "container.ts" -o -name "di.ts" | grep -v node_modules

# Dónde se instancian hoy repositorios/servicios concretos
grep -rnE "new [A-Z][A-Za-z]*(Repository|Generator|Clock|Client|Service)\(" src --include='*.ts' --include='*.tsx'

# Contenedores / DI de framework
grep -rnlE "@Module\(|@Injectable\(|providers:|createContainer|inversify|tsyringe|awilix|provide\(|InjectionToken|createContext\(" src
```

| Lo encontrado | Qué hacer |
| --- | --- |
| `src/app.composition.ts` (u otro `*.composition.ts`) | Agrega el módulo en sus bloques (`//! Repositorios`, `//! Servicios`, `//! Casos de uso`, `//! Controladores`/adaptadores, rutas). Ver `templates/backend/composition.md` o `templates/frontend/composition.md`. |
| Composición por módulo (`src/<module>/<module>.composition.ts`) | Crea el del nuevo módulo con la misma forma y regístralo donde se registran los demás. |
| Instanciación en `main.ts` / `server.ts` / `index.ts` | Sigue ese patrón ahí mismo; si crece, propón al usuario extraerlo a `app.composition.ts`. |
| DI de framework (NestJS `@Module`, Angular `providers`/`InjectionToken`, inversify, tsyringe, awilix) | Registra el contrato con un **token** y la implementación como proveedor. El caso de uso sigue recibiendo la interfaz por constructor. |
| React/Vue/Svelte con Context/`provide` | La composición crea los casos de uso y un provider/plugin los expone a la UI. Ver `templates/frontend/composition.md`. |
| Nada | **Pregunta al usuario** dónde prefiere cablear. Si no hay preferencia: backend → `src/app.composition.ts` + `main.ts` solo arranca; frontend → `src/app.composition.ts` + provider en `src/app/`. |

## 2. Reglas comunes (sea cual sea la forma)

- Las implementaciones compartidas (`idGenerator`, `clock`, `httpClient`…) se instancian **una vez** y se reutilizan.
- Orden: repositorios → servicios → casos de uso → adaptadores de presentación (controllers / hooks / providers) → rutas.
- La composición puede importar de cualquier capa; ninguna capa importa de la composición excepto la entrada de la app (`main.ts`, `App.tsx`, `main.ts` de Vue, `app.config.ts` de Angular).
- Configuración (URLs base, puertos, flags) se lee aquí (`process.env`, `import.meta.env`) y se pasa por constructor; nunca dentro de dominio o aplicación.
- Las pruebas no usan la composición real: construyen sus piezas con repositorios en memoria o fakes.

## 3. DI de framework: patrón con token

Cuando el framework inyecta por tipo de clase, una `interface` no existe en ejecución. Crea un token **en la capa de composición/presentación**, no en dominio:

```ts
// NestJS
export const PAYMENT_REPOSITORY = Symbol('PaymentRepository');

@Module({
  providers: [
    { provide: PAYMENT_REPOSITORY, useClass: InMemoryPaymentRepository },
    {
      provide: CreatePaymentUseCase,
      useFactory: (repo: PaymentRepository, ids: IdGenerator, clock: Clock) =>
        new CreatePaymentUseCase(repo, ids, clock),
      inject: [PAYMENT_REPOSITORY, ID_GENERATOR, CLOCK],
    },
  ],
})
export class PaymentsModule {}
```

```ts
// Angular
export const PAYMENT_REPOSITORY = new InjectionToken<PaymentRepository>('PaymentRepository');

export const paymentsProviders: Provider[] = [
  { provide: PAYMENT_REPOSITORY, useClass: HttpPaymentRepository },
  {
    provide: FindAllPaymentsUseCase,
    useFactory: (repo: PaymentRepository) => new FindAllPaymentsUseCase(repo),
    deps: [PAYMENT_REPOSITORY],
  },
];
```

Los casos de uso **no** llevan decoradores del framework (`@Injectable`): se crean con `useFactory` para que `application` siga libre de dependencias externas.
