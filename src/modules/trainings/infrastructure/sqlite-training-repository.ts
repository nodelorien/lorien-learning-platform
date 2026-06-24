import { v4 as uuid } from 'uuid';
import { getDb } from '../../../shared/infrastructure/database';
import { Training } from '../domain/training';
import { TrainingRepository } from '../domain/training-repository';
import { TrainingExercise } from '../domain/training-exercise';

interface TrainingRow {
  id: string;
  title: string;
  description: string;
  expiration_date: string | null;
  enabled: number;
  created_at: string;
  updated_at: string;
}

function rowToTraining(row: TrainingRow): Training {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    expirationDate: row.expiration_date ?? undefined,
    enabled: row.enabled === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SqliteTrainingRepository implements TrainingRepository {
  async save(training: Training): Promise<Training> {
    const db = getDb();
    const id = training.id || uuid();
    const now = new Date().toISOString();
    db.prepare(
      'INSERT INTO trainings (id, title, description, expiration_date, enabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ).run(
      id,
      training.title,
      training.description,
      training.expirationDate ?? null,
      training.enabled ? 1 : 0,
      now,
      now,
    );
    return { ...training, id, createdAt: now, updatedAt: now };
  }

  async findById(id: string): Promise<Training | null> {
    const db = getDb();
    const row = db.prepare('SELECT * FROM trainings WHERE id = ?').get(id) as TrainingRow | undefined;
    return row ? rowToTraining(row) : null;
  }

  async findByTitle(title: string): Promise<Training | null> {
    const db = getDb();
    const row = db.prepare('SELECT * FROM trainings WHERE title = ?').get(title) as TrainingRow | undefined;
    return row ? rowToTraining(row) : null;
  }

  async findAll(): Promise<Training[]> {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM trainings ORDER BY created_at DESC').all() as TrainingRow[];
    return rows.map(rowToTraining);
  }

  async delete(id: string): Promise<void> {
    const db = getDb();
    db.prepare('DELETE FROM trainings WHERE id = ?').run(id);
  }

  async update(training: Training): Promise<Training> {
    const db = getDb();
    const now = new Date().toISOString();
    db.prepare(
      'UPDATE trainings SET title = ?, description = ?, expiration_date = ?, enabled = ?, updated_at = ? WHERE id = ?',
    ).run(
      training.title,
      training.description,
      training.expirationDate ?? null,
      training.enabled ? 1 : 0,
      now,
      training.id,
    );
    return { ...training, updatedAt: now };
  }

  async addExercise(trainingId: string, exerciseId: string, position: number): Promise<TrainingExercise> {
    const db = getDb();
    const id = uuid();
    db.prepare(
      'INSERT INTO training_exercises (id, training_id, exercise_id, position) VALUES (?, ?, ?, ?)',
    ).run(id, trainingId, exerciseId, position);
    return { id, trainingId, exerciseId, position, enabled: true };
  }

  async removeExercise(trainingId: string, exerciseId: string): Promise<void> {
    const db = getDb();
    db.prepare('DELETE FROM training_exercises WHERE training_id = ? AND exercise_id = ?').run(trainingId, exerciseId);
  }

  async getExercises(trainingId: string): Promise<TrainingExercise[]> {
    const db = getDb();
    const rows = db
      .prepare('SELECT * FROM training_exercises WHERE training_id = ? ORDER BY position ASC')
      .all(trainingId) as Array<{
      id: string;
      training_id: string;
      exercise_id: string;
      position: number;
      enabled: number;
    }>;
    return rows.map((r) => ({
      id: r.id,
      trainingId: r.training_id,
      exerciseId: r.exercise_id,
      position: r.position,
      enabled: r.enabled === 1,
    }));
  }

  async reorderExercises(trainingId: string, exerciseIds: string[]): Promise<void> {
    const db = getDb();
    const tx = db.transaction(() => {
      exerciseIds.forEach((exerciseId, index) => {
        db.prepare('UPDATE training_exercises SET position = ? WHERE training_id = ? AND exercise_id = ?').run(
          index,
          trainingId,
          exerciseId,
        );
      });
    });
    tx();
  }
}
