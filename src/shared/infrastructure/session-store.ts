import session, { SessionData } from 'express-session';
import DatabaseBetterSqlite3 from 'better-sqlite3';
import { getDb } from './database';

class SqliteSessionStore extends session.Store {
  private db: DatabaseBetterSqlite3.Database;
  private stmts!: {
    cleanup: DatabaseBetterSqlite3.Statement;
    get: DatabaseBetterSqlite3.Statement;
    upsert: DatabaseBetterSqlite3.Statement;
    touch: DatabaseBetterSqlite3.Statement;
    destroy: DatabaseBetterSqlite3.Statement;
    length: DatabaseBetterSqlite3.Statement;
    clear: DatabaseBetterSqlite3.Statement;
  };

  constructor() {
    super();
    this.db = getDb();
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        expired_at TEXT NOT NULL
      )
    `);
    this.stmts = {
      cleanup: this.db.prepare("DELETE FROM sessions WHERE expired_at <= datetime('now')"),
      get: this.db.prepare("SELECT data FROM sessions WHERE sid = ? AND expired_at > datetime('now')"),
      upsert: this.db.prepare(
        'INSERT INTO sessions (sid, data, expired_at) VALUES (?, ?, ?) ON CONFLICT(sid) DO UPDATE SET data = excluded.data, expired_at = excluded.expired_at',
      ),
      touch: this.db.prepare('UPDATE sessions SET expired_at = ? WHERE sid = ?'),
      destroy: this.db.prepare('DELETE FROM sessions WHERE sid = ?'),
      length: this.db.prepare('SELECT COUNT(*) AS count FROM sessions'),
      clear: this.db.prepare('DELETE FROM sessions'),
    };
  }

  get(sid: string, callback: (err?: unknown, session?: SessionData | null) => void): void {
    try {
      this.stmts.cleanup.run();
      const row = this.stmts.get.get(sid) as { data: string } | undefined;
      callback(null, row ? JSON.parse(row.data) as SessionData : null);
    } catch (err) {
      callback(err);
    }
  }

  set(sid: string, sessionData: SessionData, callback?: (err?: unknown) => void): void {
    try {
      const maxAge = sessionData?.cookie?.maxAge ?? 86400000;
      const expiredAt = new Date(Date.now() + maxAge).toISOString();
      this.stmts.upsert.run(sid, JSON.stringify(sessionData), expiredAt);
      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }

  destroy(sid: string, callback?: (err?: unknown) => void): void {
    try {
      this.stmts.destroy.run(sid);
      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }

  touch(sid: string, sessionData: SessionData, callback?: (err?: unknown) => void): void {
    try {
      const maxAge = sessionData?.cookie?.maxAge ?? 86400000;
      const expiredAt = new Date(Date.now() + maxAge).toISOString();
      this.stmts.touch.run(expiredAt, sid);
      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }

  length(callback: (err?: unknown, length?: number) => void): void {
    try {
      this.stmts.cleanup.run();
      const { count } = this.stmts.length.get() as { count: number };
      callback(null, count);
    } catch (err) {
      callback(err);
    }
  }

  clear(callback?: (err?: unknown) => void): void {
    try {
      this.stmts.clear.run();
      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }
}

export function createSqliteSessionStore(): session.Store {
  return new SqliteSessionStore();
}
