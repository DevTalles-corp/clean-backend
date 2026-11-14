# Relojes

Aquí se implementa el contrato `Clock` definido en el dominio.

Actualmente usamos el reloj del sistema (`new Date()`). Gracias al contrato, en las pruebas podemos inyectar un reloj fijo y obtener resultados predecibles; si mañana necesitamos otra fuente de tiempo, solo se reemplaza esta implementación.
