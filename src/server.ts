import { app } from './app';
import { runMigrations } from './config/database';
import { env } from './config/env';

async function bootstrap(): Promise<void> {
  runMigrations();
  console.log('Database migrations applied');

  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
  });
}

bootstrap().catch(console.error);
