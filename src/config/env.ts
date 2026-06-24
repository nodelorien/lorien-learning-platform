import dotenv from 'dotenv';
import path from 'path';

const nodeEnv = process.env.NODE_ENV || 'development';

// Load base .env first (user's secrets — never committed)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
// Then load environment-specific overrides (committed with placeholders)
const envFile = nodeEnv === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.resolve(__dirname, '../../', envFile), override: true });

export const env = {
  nodeEnv,
  port: parseInt(process.env.PORT || '4000', 10),
  sessionSecret: process.env.SESSION_SECRET || 'lorien-dev-secret-change-in-production',
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
  pusher: {
    appId: process.env.PUSHER_APP_ID || '',
    key: process.env.PUSHER_KEY || '',
    secret: process.env.PUSHER_SECRET || '',
    cluster: process.env.PUSHER_CLUSTER || 'mt1',
  },
};
