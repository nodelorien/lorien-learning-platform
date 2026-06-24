import { ExerciseRepository } from '../domain/exercise-repository';
import { Exercise } from '../domain/exercise';

export interface UpdateExerciseInput {
  id: string;
  title?: string;
  description?: string;
  type?: 'prompt' | 'trivia';
  content?: string;
  category?: string;
  topic?: string;
  enabled?: boolean;
}

export class UpdateExercise {
  constructor(private readonly exerciseRepository: ExerciseRepository) {}

  async execute(input: UpdateExerciseInput): Promise<Exercise> {
    const existing = await this.exerciseRepository.findById(input.id);
    if (!existing) {
      throw new Error('Ejercicio no encontrado');
    }
    const updated: Exercise = {
      ...existing,
      title: input.title ?? existing.title,
      description: input.description ?? existing.description,
      type: input.type ?? existing.type,
      content: input.content ?? existing.content,
      category: input.category ?? existing.category,
      topic: input.topic ?? existing.topic,
      enabled: input.enabled ?? existing.enabled,
    };
    return this.exerciseRepository.update
      ? this.exerciseRepository.update(updated)
      : updated;
  }
}
