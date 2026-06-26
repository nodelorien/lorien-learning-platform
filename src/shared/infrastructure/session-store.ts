import session, { SessionData } from 'express-session';
import DatabaseBetterSqlite3 from 'better-sqlite3';
import { getDb } from './database';

function epochMs(): number {
  return Date.now();
}

class MemorySessionStore extends session.Store {
  private store = new Map<string, { data: SessionData; expiresAt: number }>();

  get(sid: string, callback: (err?: unknown, session?: SessionData | null) => void): void {
    const entry = this.store.get(sid);
    if (!entry || entry.expiresAt <= epochMs()) {
      if (entry) this.store.delete(sid);
      callback(null, null);
      return;
    }
    callback(null, entry.data);
  }

  set(sid: string, sessionData: SessionData, callback?: (err?: unknown) => void): void {
    const maxAge = sessionData?.cookie?.maxAge ?? 86400000;
    this.store.set(sid, { data: sessionData, expiresAt: epochMs() + maxAge });
    callback?.();
  }

  destroy(sid: string, callback?: (err?: unknown) => void): void {
    this.store.delete(sid);
    callback?.();
  }

  touch(sid: string, sessionData: SessionData, callback?: (err?: unknown) => void): void {
    const maxAge = sessionData?.cookie?.maxAge ?? 86400000;
    const entry = this.store.get(sid);
    if (entry) {
      entry.expiresAt = epochMs() + maxAge;
      entry.data = sessionData;
    }
    callback?.();
  }

  length(callback: (err?: unknown, length?: number) => void): void {
    this.cleanup();
    callback(null, this.store.size);
  }

  clear(callback?: (err?: unknown) => void): void {
    this.store.clear();
    callback?.();
  }

  private cleanup(): void {
    const now = epochMs();
    for (const [sid, entry] of this.store) {
      if (entry.expiresAt <= now) this.store.delete(sid);
    }
  }
}

class SqliteSessionStore extends session.Store {
  private db: DatabaseBetterSqlite3.Database;
  private stmts: {
    cleanup: DatabaseBetterSqlite3.Statement<[]>;
    get: DatabaseBetterSqlite3.Statement<[string]>;
    upsert: DatabaseBetterSqlite3.Statement<[string, string, number]>;
    touch: DatabaseBetterSqlite3.Statement<[number, string]>;
    destroy: DatabaseBetterSqlite3.Statement<[string]>;
    length: DatabaseBetterSqlite3.Statement<[]>;
    clear: DatabaseBetterSqlite3.Statement<[]>;
  };

  constructor() {
    super();
    this.db = getDb();
    // Migrate from TEXT to INTEGER expired_at if needed
    const tableInfo = this.db.pragma('table_info(sessions)') as { name: string; type: string }[];
    const oldFormat = tableInfo.length > 0 && tableInfo.find((c) => c.name === 'expired_at')?.type !== 'INTEGER';
    if (oldFormat) {
      this.db.exec('DROP TABLE IF EXISTS sessions');
    }
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        expired_at INTEGER NOT NULL
      )
    `);
    this.stmts = {
      cleanup: this.db.prepare("DELETE FROM sessions WHERE expired_at <= (strftime('%s', 'now') * 1000)"),
      get: this.db.prepare("SELECT data FROM sessions WHERE sid = ? AND expired_at > (strftime('%s', 'now') * 1000)"),
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
      callback(null, row ? (JSON.parse(row.data) as SessionData) : null);
    } catch (err) {
      callback(err);
    }
  }

  set(sid: string, sessionData: SessionData, callback?: (err?: unknown) => void): void {
    try {
      const maxAge = sessionData?.cookie?.maxAge ?? 86400000;
      this.stmts.upsert.run(sid, JSON.stringify(sessionData), epochMs() + maxAge);
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
      this.stmts.touch.run(epochMs() + maxAge, sid);
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
  try {
    return new SqliteSessionStore();
  } catch (err) {
    console.error('Failed to create SqliteSessionStore, falling back to MemorySessionStore:', err);
    return new MemorySessionStore();
  }
}
