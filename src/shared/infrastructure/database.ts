import DatabaseBetterSqlite3 from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.resolve(__dirname, '../../../data');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

let db: DatabaseBetterSqlite3.Database;

export function getDb(): DatabaseBetterSqlite3.Database {
  if (!db) {
    ensureDataDir();
    const dbPath = path.join(DATA_DIR, 'lorien.db');
    db = new DatabaseBetterSqlite3(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}
