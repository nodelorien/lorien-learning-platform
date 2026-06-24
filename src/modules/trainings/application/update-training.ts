import { TrainingRepository } from '../domain/training-repository';
import { Training } from '../domain/training';

export interface UpdateTrainingInput {
  id: string;
  title?: string;
  description?: string;
  expirationDate?: string;
  enabled?: boolean;
}

export class UpdateTraining {
  constructor(private readonly trainingRepository: TrainingRepository) {}

  async execute(input: UpdateTrainingInput): Promise<Training> {
    const existing = await this.trainingRepository.findById(input.id);
    if (!existing) {
      throw new Error('Training no encontrado');
    }
    const updated: Training = {
      ...existing,
      title: input.title ?? existing.title,
      description: input.description ?? existing.description,
      expirationDate: input.expirationDate ?? existing.expirationDate,
      enabled: input.enabled ?? existing.enabled,
    };
    return this.trainingRepository.update
      ? this.trainingRepository.update(updated)
      : updated;
  }
}
