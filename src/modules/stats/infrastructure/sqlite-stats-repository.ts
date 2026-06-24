import { v4 as uuid } from 'uuid';
import { getDb } from '../../../shared/infrastructure/database';
import { RankingEntry, UserExerciseStats } from '../domain/user-exercise-stats';
import { StatsRepository } from '../domain/stats-repository';

interface StatsRow {
  id: string;
  user_id: string;
  exercise_id: string;
  training_id: string;
  status: string;
  time_spent: number;
  attempts: number;
  score: number;
  completed_at: string | null;
  created_at: string;
}

function rowToStats(row: StatsRow): UserExerciseStats {
  return {
    id: row.id,
    userId: row.user_id,
    exerciseId: row.exercise_id,
    trainingId: row.training_id,
    status: row.status as 'pending' | 'completed' | 'failed',
    timeSpent: row.time_spent,
    attempts: row.attempts,
    score: row.score,
    completedAt: row.completed_at ?? undefined,
    createdAt: row.created_at,
  };
}

export class SqliteStatsRepository implements StatsRepository {
  async save(stats: UserExerciseStats): Promise<UserExerciseStats> {
    const db = getDb();
    const id = stats.id || uuid();
    const now = new Date().toISOString();

    const existing = db
      .prepare('SELECT id FROM user_exercise_stats WHERE id = ?')
      .get(id) as { id: string } | undefined;

    if (existing) {
      db.prepare(
        `UPDATE user_exercise_stats SET status = ?, time_spent = ?, attempts = ?, score = ?, completed_at = ? WHERE id = ?`,
      ).run(
        stats.status,
        stats.timeSpent,
        stats.attempts,
        stats.score,
        stats.completedAt ?? null,
        id,
      );
    } else {
      db.prepare(
        `INSERT INTO user_exercise_stats (id, user_id, exercise_id, training_id, status, time_spent, attempts, score, completed_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        id,
        stats.userId,
        stats.exerciseId,
        stats.trainingId,
        stats.status,
        stats.timeSpent,
        stats.attempts,
        stats.score,
        stats.completedAt ?? null,
        now,
      );
    }

    return { ...stats, id, createdAt: existing ? stats.createdAt : now };
  }

  async findByUserAndExercise(userId: string, exerciseId: string): Promise<UserExerciseStats | null> {
    const db = getDb();
    const row = db
      .prepare('SELECT * FROM user_exercise_stats WHERE user_id = ? AND exercise_id = ?')
      .get(userId, exerciseId) as StatsRow | undefined;
    return row ? rowToStats(row) : null;
  }

  async findByTraining(trainingId: string): Promise<UserExerciseStats[]> {
    const db = getDb();
    const rows = db
      .prepare('SELECT * FROM user_exercise_stats WHERE training_id = ? ORDER BY created_at DESC')
      .all(trainingId) as StatsRow[];
    return rows.map(rowToStats);
  }

  async getRanking(): Promise<RankingEntry[]> {
    const db = getDb();
    const rows = db
      .prepare(
        `SELECT u.id AS userId, u.name AS userName, u.company,
                COUNT(CASE WHEN ues.status = 'completed' THEN 1 END) AS completedExercises,
                COALESCE(SUM(ues.time_spent), 0) AS totalTimeSpent,
                COALESCE(AVG(CASE WHEN ues.status = 'completed' THEN ues.score END), 0) AS averageScore
         FROM users u
         LEFT JOIN user_exercise_stats ues ON u.id = ues.user_id
         WHERE u.role = 'user'
         GROUP BY u.id
         ORDER BY completedExercises DESC, averageScore DESC, totalTimeSpent ASC`,
      )
      .all() as RankingEntry[];
    return rows;
  }

  async getTrainingRanking(trainingId: string): Promise<RankingEntry[]> {
    const db = getDb();
    const rows = db
      .prepare(
        `SELECT u.id AS userId, u.name AS userName, u.company,
                COUNT(CASE WHEN ues.status = 'completed' THEN 1 END) AS completedExercises,
                COALESCE(SUM(ues.time_spent), 0) AS totalTimeSpent,
                COALESCE(AVG(CASE WHEN ues.status = 'completed' THEN ues.score END), 0) AS averageScore
         FROM users u
         LEFT JOIN user_exercise_stats ues ON u.id = ues.user_id AND ues.training_id = ?
         WHERE u.role = 'user'
         GROUP BY u.id
         ORDER BY completedExercises DESC, averageScore DESC, totalTimeSpent ASC`,
      )
      .all(trainingId) as RankingEntry[];
    return rows;
  }

  async getTrainingStats(trainingId: string): Promise<{
    totalUsers: number;
    totalCompleted: number;
    winners: RankingEntry[];
  }> {
    const db = getDb();
    const totalUsers = (
      db.prepare('SELECT COUNT(DISTINCT user_id) AS count FROM user_exercise_stats WHERE training_id = ?').get(trainingId) as {
        count: number;
      }
    ).count;
    const totalCompleted = (
      db
        .prepare(
          "SELECT COUNT(*) AS count FROM user_exercise_stats WHERE training_id = ? AND status = 'completed'",
        )
        .get(trainingId) as { count: number }
    ).count;
    const winners = await this.getTrainingRanking(trainingId);
    return { totalUsers, totalCompleted, winners };
  }
}
