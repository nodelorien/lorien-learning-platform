import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { getDb } from '../../../shared/infrastructure/database';
import { User } from '../domain/user';
import { UserRepository } from '../domain/user-repository';

interface UserRow {
  id: string;
  name: string;
  company: string;
  training_id: string | null;
  role: string;
  password: string;
  created_at: string;
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    trainingId: row.training_id ?? undefined,
    role: row.role as 'admin' | 'user',
    password: row.password,
    createdAt: row.created_at,
  };
}

export class SqliteUserRepository implements UserRepository {
  async save(user: User): Promise<User> {
    const db = getDb();
    const hash = bcrypt.hashSync(user.password, 10);
    const id = user.id || uuid();
    db.prepare(
      'INSERT INTO users (id, name, company, training_id, role, password) VALUES (?, ?, ?, ?, ?, ?)',
    ).run(id, user.name, user.company, user.trainingId ?? null, user.role, hash);
    return { ...user, id, password: hash };
  }

  async findById(id: string): Promise<User | null> {
    const db = getDb();
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
    return row ? rowToUser(row) : null;
  }

  async findByName(name: string): Promise<User | null> {
    const db = getDb();
    const row = db.prepare('SELECT * FROM users WHERE name = ?').get(name) as UserRow | undefined;
    return row ? rowToUser(row) : null;
  }

  async findAll(): Promise<User[]> {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all() as UserRow[];
    return rows.map(rowToUser);
  }

  async delete(id: string): Promise<void> {
    const db = getDb();
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
  }
}
