import { Router, Request, Response } from 'express';
import { CreateExercise } from '../application/create-exercise';
import { UpdateExercise } from '../application/update-exercise';
import { ExerciseRepository } from '../domain/exercise-repository';

function p(params: Record<string, string | string[]>, key: string): string {
  const v = params[key];
  return Array.isArray(v) ? v[0] : v;
}

export function createExerciseController(
  exerciseRepository: ExerciseRepository,
): Router {
  const router = Router();
  const createExercise = new CreateExercise(exerciseRepository);
  const updateExercise = new UpdateExercise(exerciseRepository);

  router.get('/', async (req: Request, res: Response) => {
    try {
      const { category, topic } = req.query;
      let exercises;
      if (category) {
        exercises = await exerciseRepository.findByCategory(category as string);
      } else if (topic) {
        exercises = await exerciseRepository.findByTopic(topic as string);
      } else {
        exercises = await exerciseRepository.findAll();
      }
      res.json(exercises);
    } catch {
      res.status(500).json({ error: 'Error al obtener ejercicios' });
    }
  });

  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const exercise = await exerciseRepository.findById(p(req.params, 'id'));
      if (!exercise) {
        res.status(404).json({ error: 'Ejercicio no encontrado' });
        return;
      }
      res.json(exercise);
    } catch {
      res.status(500).json({ error: 'Error al obtener ejercicio' });
    }
  });

  router.post('/', async (req: Request, res: Response) => {
    try {
      const exercise = await createExercise.execute(req.body);
      res.status(201).json(exercise);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear ejercicio';
      res.status(400).json({ error: message });
    }
  });

  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const exercise = await updateExercise.execute({ id: p(req.params, 'id'), ...req.body });
      res.json(exercise);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar ejercicio';
      res.status(400).json({ error: message });
    }
  });

  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      await exerciseRepository.delete(p(req.params, 'id'));
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: 'Error al eliminar ejercicio' });
    }
  });

  return router;
}
