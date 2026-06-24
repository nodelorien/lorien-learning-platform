import { Repository } from '../../../shared/domain/repository';
import { Training } from './training';
import { TrainingExercise } from './training-exercise';

export interface TrainingRepository extends Repository<Training> {
  findByTitle(title: string): Promise<Training | null>;
  update(training: Training): Promise<Training>;
  getExercises(trainingId: string): Promise<TrainingExercise[]>;
  addExercise(trainingId: string, exerciseId: string, position: number): Promise<TrainingExercise>;
  removeExercise(trainingId: string, exerciseId: string): Promise<void>;
  reorderExercises(trainingId: string, exerciseIds: string[]): Promise<void>;
}
