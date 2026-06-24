import bcrypt from 'bcryptjs';
import { getDb } from '../shared/infrastructure/database';
import { seedIASinEnredos } from './seed-ia-sin-enredos';

export function runMigrations(): void {
  const db = getDb();

  // Migration: recreate exercises table without type CHECK constraint to support 'tokens' type
  const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE name='exercises'").get() as { sql: string } | undefined;
  if (tableInfo && tableInfo.sql.includes("CHECK(type IN ('prompt', 'trivia'))")) {
    db.exec(`
      CREATE TABLE exercises_new (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT DEFAULT '',
        topic TEXT DEFAULT '',
        enabled INTEGER NOT NULL DEFAULT 1,
        time_limit_seconds INTEGER NOT NULL DEFAULT 15,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      INSERT INTO exercises_new SELECT * FROM exercises;
      DROP TABLE exercises;
      ALTER TABLE exercises_new RENAME TO exercises;
    `);
  }

  // Migration: add time_limit_seconds column if missing (for tables without CHECK)
  const columns = db.prepare("PRAGMA table_info('exercises')").all() as { name: string }[];
  const hasTimeLimit = columns.some((c) => c.name === 'time_limit_seconds');
  if (!hasTimeLimit) {
    db.exec('ALTER TABLE exercises ADD COLUMN time_limit_seconds INTEGER NOT NULL DEFAULT 15');
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT DEFAULT '',
      training_id TEXT,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin', 'user')),
      password TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS trainings (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      expiration_date TEXT,
      enabled INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT DEFAULT '',
      topic TEXT DEFAULT '',
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS training_exercises (
      id TEXT PRIMARY KEY,
      training_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      enabled INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_exercise_stats (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      training_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed')),
      time_spent INTEGER DEFAULT 0,
      attempts INTEGER NOT NULL DEFAULT 0,
      score REAL DEFAULT 0,
      completed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
      FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_training_exercises_training ON training_exercises(training_id);
    CREATE INDEX IF NOT EXISTS idx_training_exercises_exercise ON training_exercises(exercise_id);
    CREATE INDEX IF NOT EXISTS idx_user_stats_user ON user_exercise_stats(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_stats_training ON user_exercise_stats(training_id);
  `);

  const existing = db.prepare('SELECT id FROM users WHERE id = ?').get('admin');
  if (!existing) {
    const hash = bcrypt.hashSync('Julian.123', 10);
    db.prepare(
      'INSERT INTO users (id, name, company, role, password) VALUES (?, ?, ?, ?, ?)',
    ).run('admin', 'admin', '', 'admin', hash);
  }

  seedIASinEnredos();
}
