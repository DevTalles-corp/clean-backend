# Base de datos

Aquí se crea la conexión a SQLite que comparten los repositorios de todos los módulos.

Existe para que la configuración de la base de datos (ruta, modo WAL, etc.) viva en un solo lugar. Si mañana cambiamos de motor, solo se reemplaza esta pieza y las implementaciones de los repositorios.
