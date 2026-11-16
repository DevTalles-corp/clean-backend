# Presentation

Esta carpeta recibe las peticiones externas relacionadas con pagos (rutas, esquemas de validación y controladores) para preparar las respuestas de la aplicación.

## Composición

`payments.composition.ts` arma el módulo completo (repositorio, casos de uso, controladores y router). Así el punto de arranque solo monta el módulo sin conocer sus piezas internas.
