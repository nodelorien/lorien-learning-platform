import { v4 as uuid } from 'uuid';
import { getDb } from '../../../shared/infrastructure/database';
import { Exercise, ExerciseType } from '../domain/exercise';
import { ExerciseRepository } from '../domain/exercise-repository';

interface ExerciseRow {
  id: string;
  title: string;
  description: string;
  type: string;
  content: string;
  category: string;
  topic: string;
  enabled: number;
  time_limit_seconds: number;
  created_at: string;
  updated_at: string;
}

function rowToExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type as Exercise['type'],
    content: row.content,
    category: row.category,
    topic: row.topic,
    enabled: row.enabled === 1,
    timeLimitSeconds: row.time_limit_seconds,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SqliteExerciseRepository implements ExerciseRepository {
  async save(exercise: Exercise): Promise<Exercise> {
    const db = getDb();
    const id = exercise.id || uuid();
    const now = new Date().toISOString();
    db.prepare(
      'INSERT INTO exercises (id, title, description, type, content, category, topic, enabled, time_limit_seconds, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ).run(
      id,
      exercise.title,
      exercise.description,
      exercise.type,
      exercise.content,
      exercise.category,
      exercise.topic,
      exercise.enabled ? 1 : 0,
      exercise.timeLimitSeconds,
      now,
      now,
    );
    return { ...exercise, id, createdAt: now, updatedAt: now };
  }

  async findById(id: string): Promise<Exercise | null> {
    const db = getDb();
    const row = db.prepare('SELECT * FROM exercises WHERE id = ?').get(id) as ExerciseRow | undefined;
    return row ? rowToExercise(row) : null;
  }

  async findByCategory(category: string): Promise<Exercise[]> {
    const db = getDb();
    const rows = db
      .prepare('SELECT * FROM exercises WHERE category = ? ORDER BY created_at DESC')
      .all(category) as ExerciseRow[];
    return rows.map(rowToExercise);
  }

  async findByTopic(topic: string): Promise<Exercise[]> {
    const db = getDb();
    const rows = db
      .prepare('SELECT * FROM exercises WHERE topic = ? ORDER BY created_at DESC')
      .all(topic) as ExerciseRow[];
    return rows.map(rowToExercise);
  }

  async findAll(): Promise<Exercise[]> {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM exercises ORDER BY created_at DESC').all() as ExerciseRow[];
    return rows.map(rowToExercise);
  }

  async delete(id: string): Promise<void> {
    const db = getDb();
    db.prepare('DELETE FROM exercises WHERE id = ?').run(id);
  }

  async update(exercise: Exercise): Promise<Exercise> {
    const db = getDb();
    const now = new Date().toISOString();
    db.prepare(
      'UPDATE exercises SET title = ?, description = ?, type = ?, content = ?, category = ?, topic = ?, enabled = ?, time_limit_seconds = ?, updated_at = ? WHERE id = ?',
    ).run(
      exercise.title,
      exercise.description,
      exercise.type,
      exercise.content,
      exercise.category,
      exercise.topic,
      exercise.enabled ? 1 : 0,
      exercise.timeLimitSeconds,
      now,
      exercise.id,
    );
    return { ...exercise, updatedAt: now };
  }
}
