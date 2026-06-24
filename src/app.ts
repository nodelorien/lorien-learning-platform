import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { SqliteUserRepository } from './modules/auth/infrastructure/sqlite-user-repository';
import { SqliteTrainingRepository } from './modules/trainings/infrastructure/sqlite-training-repository';
import { SqliteExerciseRepository } from './modules/exercises/infrastructure/sqlite-exercise-repository';
import { SqliteStatsRepository } from './modules/stats/infrastructure/sqlite-stats-repository';
import { createAuthController } from './modules/auth/controllers/auth-controller';
import { createTrainingController } from './modules/trainings/controllers/training-controller';
import { createExerciseController } from './modules/exercises/controllers/exercise-controller';
import { createStatsController } from './modules/stats/controllers/stats-controller';
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
app.use('/api/trainings', requireAuth, createTrainingController(trainingRepository, exerciseRepository));
app.use('/api/exercises', requireAuth, createExerciseController(exerciseRepository));
app.use('/api/stats', requireAuth, createStatsController(statsRepository));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export { app };
