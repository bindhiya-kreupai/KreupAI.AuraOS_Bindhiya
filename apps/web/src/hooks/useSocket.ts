'use client';

import { useEffect, useCallback } from 'react';
import { useSocketContext } from '@/providers/SocketProvider';

export function useSocket() {
  const { socket, isConnected, connect, disconnect } = useSocketContext();

  const subscribe = useCallback(
    (event: string, handler: (data: unknown) => void) => {
      if (!socket) return () => {};
      return socket.on(event, handler);
    },
    [socket]
  );

  const send = useCallback(
    (event: string, payload: unknown) => {
      socket?.send(event, payload);
    },
    [socket]
  );

  return { socket, isConnected, connect, disconnect, subscribe, send };
}
