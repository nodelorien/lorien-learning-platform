import { v4 as uuid } from 'uuid';
import { ExerciseRepository } from '../domain/exercise-repository';
import { CreateExerciseInput, Exercise } from '../domain/exercise';

export class CreateExercise {
  constructor(private readonly exerciseRepository: ExerciseRepository) {}

  async execute(input: CreateExerciseInput): Promise<Exercise> {
    const defaults: Record<string, number> = { trivia: 15, prompt: 150, tokens: 120 };
    const exercise: Exercise = {
      id: uuid(),
      title: input.title,
      description: input.description ?? '',
      type: input.type,
      content: input.content,
      category: input.category ?? '',
      topic: input.topic ?? '',
      enabled: true,
      timeLimitSeconds: input.timeLimitSeconds ?? defaults[input.type] ?? 60,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.exerciseRepository.save(exercise);
  }
}
