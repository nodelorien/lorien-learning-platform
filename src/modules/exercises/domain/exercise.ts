export type ExerciseType = 'prompt' | 'trivia' | 'tokens';

export interface Exercise {
  id: string;
  title: string;
  description: string;
  type: ExerciseType;
  content: string;
  category: string;
  topic: string;
  enabled: boolean;
  timeLimitSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExerciseInput {
  title: string;
  description?: string;
  type: ExerciseType;
  content: string;
  category?: string;
  topic?: string;
  timeLimitSeconds?: number;
}

export interface TriviaOption {
  id: string;
  text: string;
  correct: boolean;
}

export interface PromptContent {
  prompt: string;
  expectedAnswer: string;
}

export interface TriviaContent {
  question: string;
  options: TriviaOption[];
}
