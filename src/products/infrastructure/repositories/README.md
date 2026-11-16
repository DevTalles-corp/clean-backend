# Repositorios de Infrastructure

Aquí se implementa el contrato `ProductRepository` definido en el dominio.

Hay dos implementaciones: una en memoria (útil para pruebas) y otra en SQLite, que comparte la misma base de datos que los usuarios. Cambiar de una a otra solo afecta al punto de composición; las reglas de negocio y los casos de uso no cambian.
