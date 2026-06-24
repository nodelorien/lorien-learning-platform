'use client';

import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react';
import PusherJS from 'pusher-js';
import api from '@/lib/api';

interface PusherChannel {
  bind(eventName: string, callback: (data: unknown) => void): void;
  unbind(eventName: string, callback: (data: unknown) => void): void;
}

interface PusherContextType {
  ready: boolean;
  channel: (name: string) => PusherChannel | null;
}

const PusherContext = createContext<PusherContextType>({ ready: false, channel: () => null });

export function PusherProvider({ children }: { children: ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clientRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api.get('/config/public').then(({ data }) => {
      if (cancelled || !data.pusherKey) return;

      const client = new PusherJS(data.pusherKey, { cluster: data.pusherCluster });
      client.connection.bind('error', (err: unknown) => {
        console.warn('[Pusher] Connection error:', err);
      });
      client.connection.bind('connected', () => {
        console.log('[Pusher] Connected');
      });
      clientRef.current = client;
      setReady(true);
    }).catch(() => {
      console.warn('[Pusher] Config fetch failed — will not connect');
    });

    return () => {
      cancelled = true;
      clientRef.current?.disconnect();
    };
  }, []);

  const channel = useCallback((name: string) => {
    return clientRef.current?.subscribe(name) ?? null;
  }, []);

  return (
    <PusherContext value={{ ready, channel }}>
      {children}
    </PusherContext>
  );
}

export function usePusher() {
  return useContext(PusherContext);
}

export function usePusherEvent(
  channelName: string,
  eventName: string,
  handler: (data: unknown) => void,
) {
  const { channel: getChannel, ready } = usePusher();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!ready) return;

    const ch = getChannel(channelName);
    if (!ch) return;

    const wrapped = (data: unknown) => handlerRef.current(data);
    ch.bind(eventName, wrapped);
    return () => {
      ch.unbind(eventName, wrapped);
    };
  }, [channelName, eventName, getChannel, ready]);
}
