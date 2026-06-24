export interface TrainingExercise {
  id: string;
  trainingId: string;
  exerciseId: string;
  position: number;
  enabled: boolean;
}

export interface AddExerciseToTrainingInput {
  trainingId: string;
  exerciseId: string;
  position?: number;
}
