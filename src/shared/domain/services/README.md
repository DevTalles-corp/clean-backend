# Servicios del dominio

Aquí se definen los contratos (interfaces) de servicios que el negocio necesita pero que no le corresponde implementar, como generar identificadores únicos (`IdGenerator`) u obtener la fecha actual (`Clock`).

Existe para que el dominio y los casos de uso dependan de una abstracción y no de una herramienta concreta. La implementación vive en infraestructura y se inyecta por constructor.
