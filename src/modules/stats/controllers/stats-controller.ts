import { Router, Request, Response, NextFunction } from 'express';
import { RecordAttempt } from '../application/record-attempt';
import { GetRanking } from '../application/get-ranking';
import { StatsRepository } from '../domain/stats-repository';
import { triggerEvent, CHANNELS, EVENTS } from '../../../shared/infrastructure/pusher';
import { requireAuth } from '../../auth/application/auth-middleware';

function p(params: Record<string, string | string[]>, key: string): string {
  const v = params[key];
  return Array.isArray(v) ? v[0] : v;
}

export function createStatsController(
  statsRepository: StatsRepository,
): Router {
  const router = Router();
  const recordAttempt = new RecordAttempt(statsRepository);
  const getRanking = new GetRanking(statsRepository);

  router.post('/attempts', requireAuth, async (req: Request, res: Response) => {
    try {
      const stats = await recordAttempt.execute(req.body);
      triggerEvent(CHANNELS.RANKING, EVENTS.RANKING_UPDATED, { timestamp: Date.now() });
      triggerEvent(CHANNELS.TRAININGS, EVENTS.TRAINING_UPDATED, { timestamp: Date.now() });
      triggerEvent(CHANNELS.ACTIVITY, EVENTS.ACTIVITY, {
        type: 'exercise_completed',
        status: stats.status,
        timestamp: Date.now(),
      });
      res.status(201).json(stats);
    } catch {
      res.status(500).json({ error: 'Error al registrar intento' });
    }
  });

  router.get('/ranking', async (_req: Request, res: Response) => {
    try {
      const ranking = await getRanking.execute();
      res.json(ranking);
    } catch {
      res.status(500).json({ error: 'Error al obtener ranking' });
    }
  });

  router.get('/training/:trainingId', async (req: Request, res: Response) => {
    try {
      const stats = await statsRepository.getTrainingStats(p(req.params, 'trainingId'));
      res.json(stats);
    } catch {
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  });

  router.get('/training/:trainingId/user/:userId', requireAuth, async (req: Request, res: Response) => {
    try {
      const stats = await statsRepository.findByUserAndTraining(
        p(req.params, 'userId'),
        p(req.params, 'trainingId'),
      );
      res.json(stats);
    } catch {
      res.status(500).json({ error: 'Error al obtener estadísticas del usuario' });
    }
  });

  router.get('/training/:trainingId/ranking', async (req: Request, res: Response) => {
    try {
      const ranking = await statsRepository.getTrainingRanking(p(req.params, 'trainingId'));
      res.json(ranking);
    } catch {
      res.status(500).json({ error: 'Error al obtener ranking del training' });
    }
  });

  return router;
}
