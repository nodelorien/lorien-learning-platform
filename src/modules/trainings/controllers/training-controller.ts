import { Router, Request, Response } from 'express';
import { CreateTraining } from '../application/create-training';
import { UpdateTraining } from '../application/update-training';
import { TrainingRepository } from '../domain/training-repository';
import { ExerciseRepository } from '../../exercises/domain/exercise-repository';

function p(params: Record<string, string | string[]>, key: string): string {
  const v = params[key];
  return Array.isArray(v) ? v[0] : v;
}

export function createTrainingController(
  trainingRepository: TrainingRepository,
  exerciseRepository: ExerciseRepository,
): Router {
  const router = Router();
  const createTraining = new CreateTraining(trainingRepository);
  const updateTraining = new UpdateTraining(trainingRepository);

  router.get('/', async (_req: Request, res: Response) => {
    try {
      const trainings = await trainingRepository.findAll();
      res.json(trainings);
    } catch {
      res.status(500).json({ error: 'Error al obtener trainings' });
    }
  });

  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const id = p(req.params, 'id');
      const training = await trainingRepository.findById(id);
      if (!training) {
        res.status(404).json({ error: 'Training no encontrado' });
        return;
      }
      const exercises = await trainingRepository.getExercises(id);
      res.json({ ...training, exercises });
    } catch {
      res.status(500).json({ error: 'Error al obtener training' });
    }
  });

  router.post('/', async (req: Request, res: Response) => {
    try {
      const training = await createTraining.execute(req.body);
      res.status(201).json(training);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear training';
      res.status(400).json({ error: message });
    }
  });

  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const training = await updateTraining.execute({ id: p(req.params, 'id'), ...req.body });
      res.json(training);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar training';
      res.status(400).json({ error: message });
    }
  });

  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      await trainingRepository.delete(p(req.params, 'id'));
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: 'Error al eliminar training' });
    }
  });

  router.post('/:id/exercises', async (req: Request, res: Response) => {
    try {
      const { exerciseId, position } = req.body;
      const exercise = await exerciseRepository.findById(exerciseId);
      if (!exercise) {
        res.status(404).json({ error: 'Ejercicio no encontrado' });
        return;
      }
      const existing = await trainingRepository.getExercises(p(req.params, 'id'));
      const nextPosition = position ?? existing.length;
      const te = await trainingRepository.addExercise(p(req.params, 'id'), exerciseId, nextPosition);
      res.status(201).json(te);
    } catch {
      res.status(500).json({ error: 'Error al agregar ejercicio' });
    }
  });

  router.delete('/:id/exercises/:exerciseId', async (req: Request, res: Response) => {
    try {
      await trainingRepository.removeExercise(p(req.params, 'id'), p(req.params, 'exerciseId'));
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: 'Error al remover ejercicio' });
    }
  });

  router.put('/:id/exercises/reorder', async (req: Request, res: Response) => {
    try {
      const { exerciseIds } = req.body;
      await trainingRepository.reorderExercises(p(req.params, 'id'), exerciseIds);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: 'Error al reordenar ejercicios' });
    }
  });

  return router;
}
