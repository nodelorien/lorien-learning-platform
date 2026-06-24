import express from 'express';
import cors from 'cors';
import session from 'express-session';
import path from 'path';
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

// eslint-disable-next-line @typescript-eslint/no-require-imports
const SQLiteStore = require('connect-sqlite3')(session);

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(
  session({
    store: new SQLiteStore({ db: 'sessions.db', dir: path.resolve(__dirname, '../../data') }),
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: env.nodeEnv === 'production', httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
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

export { app };
