import { RankingEntry, UserExerciseStats } from './user-exercise-stats';

export interface StatsRepository {
  save(stats: UserExerciseStats): Promise<UserExerciseStats>;
  findByUserAndExercise(userId: string, exerciseId: string): Promise<UserExerciseStats | null>;
  findByTraining(trainingId: string): Promise<UserExerciseStats[]>;
  findByUserAndTraining(userId: string, trainingId: string): Promise<UserExerciseStats[]>;
  getRanking(): Promise<RankingEntry[]>;
  getTrainingRanking(trainingId: string): Promise<RankingEntry[]>;
  getTrainingStats(trainingId: string): Promise<{
    totalUsers: number;
    totalCompleted: number;
    winners: RankingEntry[];
  }>;
}
