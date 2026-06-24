import { ExerciseRepository } from '../domain/exercise-repository';
import { Exercise, ExerciseType } from '../domain/exercise';

export interface UpdateExerciseInput {
  id: string;
  title?: string;
  description?: string;
  type?: ExerciseType;
  content?: string;
  category?: string;
  topic?: string;
  enabled?: boolean;
  timeLimitSeconds?: number;
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
      timeLimitSeconds: input.timeLimitSeconds ?? existing.timeLimitSeconds,
    };
    return this.exerciseRepository.update
      ? this.exerciseRepository.update(updated)
      : updated;
  }
}
