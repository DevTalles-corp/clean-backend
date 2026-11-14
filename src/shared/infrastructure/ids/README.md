# Generadores de IDs

Aquí se implementa el contrato `IdGenerator` definido en el dominio.

Actualmente usamos `randomUUID` del módulo nativo `node:crypto`, así generamos UUIDs sin depender de librerías de terceros. Si mañana cambiamos la estrategia (por ejemplo, UUID v7 o IDs de la base de datos), solo se reemplaza esta implementación.
