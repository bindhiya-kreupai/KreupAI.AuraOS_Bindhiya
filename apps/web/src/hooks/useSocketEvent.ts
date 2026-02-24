'use client';

import { useEffect, useRef } from 'react';
import { useSocket } from './useSocket';

export function useSocketEvent<T = unknown>(event: string, handler: (data: T) => void) {
  const { subscribe, isConnected } = useSocket();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribe(event, (data) => {
      handlerRef.current(data as T);
    });

    return unsubscribe;
  }, [event, subscribe, isConnected]);
}
