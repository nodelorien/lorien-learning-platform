import express from 'express';
import path from 'path';
import cors from 'cors';
import session from 'express-session';
import { SqliteUserRepository } from './modules/auth/infrastructure/sqlite-user-repository';
import { SqliteTrainingRepository } from './modules/trainings/infrastructure/sqlite-training-repository';
import { SqliteExerciseRepository } from './modules/exercises/infrastructure/sqlite-exercise-repository';
import { SqliteStatsRepository } from './modules/stats/infrastructure/sqlite-stats-repository';
import { createAuthController } from './modules/auth/controllers/auth-controller';
import { createTrainingController } from './modules/trainings/controllers/training-controller';
import { createExerciseController } from './modules/exercises/controllers/exercise-controller';
import { env } from './config/env';
import { createStatsController } from './modules/stats/controllers/stats-controller';
import { createUserController } from './modules/users/controllers/user-controller';
import { requireAuth, requireAdmin } from './modules/auth/application/auth-middleware';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: 'lorien-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
  }),
);

const userRepository = new SqliteUserRepository();
const trainingRepository = new SqliteTrainingRepository();
const exerciseRepository = new SqliteExerciseRepository();
const statsRepository = new SqliteStatsRepository();

app.use('/api/auth', createAuthController(userRepository));

const trainingController = createTrainingController(trainingRepository, exerciseRepository);
app.use('/api/trainings', trainingController);
app.use('/api/users', requireAuth, requireAdmin, createUserController(userRepository));
app.use('/api/exercises', requireAuth, createExerciseController(exerciseRepository));
app.use('/api/stats', requireAuth, createStatsController(statsRepository));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/config/public', (_req, res) => {
  res.json({
    pusherKey: env.pusher.key,
    pusherCluster: env.pusher.cluster,
  });
});

// Serve static frontend build in production (single process, no CORS)
if (env.nodeEnv === 'production') {
  const frontendPath = path.resolve(__dirname, '../../frontend/out');
  app.use(express.static(frontendPath));

  // SPA fallback — serve index.html for all non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

export { app };
