import Database from 'better-sqlite3';

// Crea la conexión SQLite compartida por todos los módulos.
// Centraliza la configuración (WAL) para que ningún módulo abra su propia conexión ni repita ajustes.
export function createSqliteDatabase(path: string): Database.Database {
  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  return db;
}
