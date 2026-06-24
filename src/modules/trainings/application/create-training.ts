import { v4 as uuid } from 'uuid';
import { TrainingRepository } from '../domain/training-repository';
import { CreateTrainingInput, Training } from '../domain/training';

export class CreateTraining {
  constructor(private readonly trainingRepository: TrainingRepository) {}

  async execute(input: CreateTrainingInput): Promise<Training> {
    const existing = await this.trainingRepository.findByTitle(input.title);
    if (existing) {
      throw new Error('Ya existe un training con ese título');
    }
    const training: Training = {
      id: uuid(),
      title: input.title,
      description: input.description ?? '',
      expirationDate: input.expirationDate,
      enabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.trainingRepository.save(training);
  }
}
