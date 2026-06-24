export interface Exercise {
  id: string;
  title: string;
  description: string;
  type: 'prompt' | 'trivia';
  content: string;
  category: string;
  topic: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExerciseInput {
  title: string;
  description?: string;
  type: 'prompt' | 'trivia';
  content: string;
  category?: string;
  topic?: string;
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
