import Pusher from 'pusher';
import { env } from '../../config/env';

let client: Pusher;

export function getPusher(): Pusher {
  if (!client) {
    client = new Pusher({
      appId: env.pusher.appId,
      key: env.pusher.key,
      secret: env.pusher.secret,
      cluster: env.pusher.cluster,
      useTLS: true,
    });
  }
  return client;
}

export function triggerEvent(channel: string, event: string, data: Record<string, unknown>): void {
  getPusher().trigger(channel, event, data).catch((err) => {
    console.warn(`[Pusher] trigger failed (${channel}/${event}):`, err);
  });
}

export const CHANNELS = {
  RANKING: 'ranking',
  TRAININGS: 'trainings',
  ACTIVITY: 'activity',
} as const;

export const EVENTS = {
  RANKING_UPDATED: 'ranking-updated',
  TRAINING_UPDATED: 'training-updated',
  ACTIVITY: 'platform-activity',
} as const;
