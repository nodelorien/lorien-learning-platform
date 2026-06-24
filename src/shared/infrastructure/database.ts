import DatabaseBetterSqlite3 from 'better-sqlite3';
import path from 'path';

let db: DatabaseBetterSqlite3.Database;

export function getDb(): DatabaseBetterSqlite3.Database {
  if (!db) {
    const dbPath = path.resolve(__dirname, '../../../data/lorien.db');
    db = new DatabaseBetterSqlite3(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}
