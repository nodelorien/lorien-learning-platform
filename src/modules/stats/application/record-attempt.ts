import { v4 as uuid } from 'uuid';
import { StatsRepository } from '../domain/stats-repository';
import { UserExerciseStats } from '../domain/user-exercise-stats';

export interface RecordAttemptInput {
  userId: string;
  exerciseId: string;
  trainingId: string;
  status: 'pending' | 'completed' | 'failed';
  timeSpent: number;
  score: number;
}

export class RecordAttempt {
  constructor(private readonly statsRepository: StatsRepository) {}

  async execute(input: RecordAttemptInput): Promise<UserExerciseStats> {
    const existing = await this.statsRepository.findByUserAndExercise(
      input.userId,
      input.exerciseId,
    );

    const stats: UserExerciseStats = {
      id: existing?.id ?? uuid(),
      userId: input.userId,
      exerciseId: input.exerciseId,
      trainingId: input.trainingId,
      status: input.status,
      timeSpent: (existing?.timeSpent ?? 0) + input.timeSpent,
      attempts: (existing?.attempts ?? 0) + 1,
      score: Math.max(existing?.score ?? 0, input.score),
      completedAt:
        input.status === 'completed' ? new Date().toISOString() : existing?.completedAt,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    return this.statsRepository.save(stats);
  }
}
