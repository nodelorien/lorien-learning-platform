export interface UserExerciseStats {
  id: string;
  userId: string;
  exerciseId: string;
  trainingId: string;
  status: 'pending' | 'completed' | 'failed';
  timeSpent: number;
  attempts: number;
  score: number;
  completedAt?: string;
  createdAt: string;
}

export interface RankingEntry {
  userId: string;
  userName: string;
  company: string;
  completedExercises: number;
  totalTimeSpent: number;
  averageScore: number;
}
