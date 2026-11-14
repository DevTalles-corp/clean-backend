// Contrato del dominio: entrega la fecha y hora actual sin depender del reloj del sistema.
// Invierte la dependencia hacia una abstracción; sin él, los casos de uso usarían new Date() directamente y no podríamos controlar el tiempo en las pruebas.

export interface Clock {
  now(): Date;
}
