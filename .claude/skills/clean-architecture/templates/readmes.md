# Plantillas de README.md por carpeta

Cada carpeta lleva un `README.md` en español: **qué contiene** y **por qué existe**. Tono cercano, 1–3 párrafos cortos. Menciona nombres concretos (`<Entity>`, `<Entity>Repository`) y las reglas clave del negocio.

## `src/<module>/domain/README.md`

```md
# Dominio

Esta carpeta reúne la entidad de <entidades en español> y los contratos que se necesitan para trabajar con ellos.

Existe para mantener las reglas de los <entidades> independientes de Express, la base de datos o cualquier otra herramienta.
```

## `src/<module>/domain/entities/README.md`

```md
# Entidades

Aquí se define el <entidad> (`<Entity>`) y las reglas que debe cumplir para ser válido: <lista breve de reglas>.
```

## `src/<module>/domain/repositories/README.md`

```md
# Repositorios

Aquí se definen las operaciones del negocio que se necesitan para consultar y guardar <entidades>, sin decir cómo se almacenan.

Son puramente reglas, interfaces y abstracciones.
```

## `src/<module>/application/README.md`

```md
# Application:

Esta carpeta nos sirve para organizar las acciones que puede realizar la aplicación con los <entidades>.
```

## `src/<module>/application/use-cases/README.md`

```md
# Use Cases

Cada archivo representa una acción concreta sobre los <entidades>: <lista de acciones>. Existe únicamente para reunir los pasos de esa acción.
```

## `src/<module>/infrastructure/README.md`

```md
# Infrastructure

Aquí tenemos las implementaciones concretas de las dependencias del módulo de <entidades>, como el almacenamiento en memoria o en base de datos.

Esto existe para poder cambiar las herramientas sin tener que modificar las reglas del dominio ni los casos de uso.
```

## `src/<module>/infrastructure/repositories/README.md`

```md
# Repositorios de Infrastructure

Aquí se implementa el contrato `<Entity>Repository` definido en el dominio.

Actualmente guardamos los <entidades> en memoria; más adelante podrán vivir en una base de datos sin que cambien las reglas de negocio ni los casos de uso.
```

## `src/<module>/presentation/README.md`

```md
# Presentation

Esta carpeta recibe las peticiones externas relacionadas con <entidades> (rutas, esquemas de validación y controladores) para preparar las respuestas de la aplicación.
```

## `src/<module>/presentation/schemas/README.md`

```md
# Schemas

Aquí se definen los esquemas que validan la forma de los datos que llegan desde fuera (tipos y campos obligatorios) antes de llegar al controlador.

Existe para rechazar cuerpos mal formados en la entrada; las reglas de negocio siguen viviendo en la entidad.
```

## `src/<module>/presentation/controllers/README.md`

```md
# Controladores

Cada controlador recibe los datos ya validados y llama a su caso de uso.

Existe para traducir la entrada externa a la acción de la aplicación sin que el caso de uso conozca HTTP.
```

## `src/<module>/presentation/routes/README.md`

```md
# Rutas

Aquí se declaran los endpoints del módulo de <entidades>, sus middlewares y los códigos de respuesta de éxito.

Existe para conectar HTTP con los controladores; los errores se traducen en el manejador global.
```

---

# README específicos de frontend

## `src/<module>/infrastructure/repositories/README.md` (frontend)

```md
# Repositorios de Infrastructure

Aquí se implementa el contrato `<Entity>Repository` definido en el dominio.

`Http<Entity>Repository` habla con la API y traduce sus respuestas a entidades y errores del dominio; `InMemory<Entity>Repository` sirve para pruebas y prototipos. Si la API cambia, solo cambia esta carpeta.
```

## `src/<module>/infrastructure/mappers/README.md`

```md
# Mappers

Aquí se convierten los datos que llegan de la API (DTO) en entidades del dominio y viceversa.

Existe para que la forma de la API no se filtre al dominio ni a la interfaz.
```

## `src/<module>/presentation/README.md` (frontend)

```md
# Presentation

Esta carpeta contiene la interfaz del módulo de <entidades>: hooks, componentes y páginas.

Existe para mostrar datos y recoger acciones del usuario delegando todo en los casos de uso, sin hablar directamente con la API.
```

## `src/<module>/presentation/hooks/README.md`

```md
# Hooks

Cada hook conecta la interfaz con un caso de uso y gestiona su estado de carga, error y datos.

Existe para que los componentes no conozcan los casos de uso ni la API.
```

## `src/<module>/presentation/components/README.md`

```md
# Componentes

Componentes visuales del módulo de <entidades>. Reciben datos y emiten eventos.

Existen para separar cómo se ve la información de cómo se obtiene.
```

## `src/<module>/presentation/pages/README.md`

```md
# Páginas

Cada página compone hooks y componentes para formar una pantalla completa.

Existe para que las rutas del framework solo deleguen aquí y el módulo siga siendo autocontenido.
```

## `src/shared/presentation/errors/README.md`

```md
# Mensajes de error

Aquí se traducen los errores del dominio a mensajes comprensibles para el usuario.

Es el equivalente en frontend del manejador de errores HTTP del backend.
```
