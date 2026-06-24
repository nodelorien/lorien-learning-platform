import { Repository } from '../../../shared/domain/repository';
import { Exercise } from './exercise';

export interface ExerciseRepository extends Repository<Exercise> {
  findByCategory(category: string): Promise<Exercise[]>;
  findByTopic(topic: string): Promise<Exercise[]>;
  update(exercise: Exercise): Promise<Exercise>;
}
