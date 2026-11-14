// Contrato del dominio: genera identificadores únicos sin elegir una tecnología concreta.
// Invierte la dependencia hacia una abstracción; sin él, los casos de uso quedarían acoplados a una librería o API de generación de IDs.

export interface IdGenerator {
  generate(): string;
}
