import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  deepseekApiKey: process.env.DEEPSEEK_API_KEY ?? '',
  pusher: {
    appId: process.env.PUSHER_APP_ID ?? '',
    key: process.env.PUSHER_KEY ?? '',
    secret: process.env.PUSHER_SECRET ?? '',
    cluster: process.env.PUSHER_CLUSTER ?? 'mt1',
  },
};
