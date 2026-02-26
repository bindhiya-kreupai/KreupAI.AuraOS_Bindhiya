'use client';

/**
 * @module SocketProvider
 * @description React context provider that manages a Socket.IO connection
 *   for the AuraOS web app.
 * @project AURA HCM Platform
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { SocketClientOptions } from '@/lib/websocket/socket-client';
import { SocketClient } from '@/lib/websocket/socket-client';

type SocketContextType = {
  socket: SocketClient | null;
  isConnected: boolean;
  connect: (options?: Partial<SocketClientOptions>) => void;
  disconnect: () => void;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connect: () => {},
  disconnect: () => {},
});

type SocketProviderProps = {
  children: React.ReactNode;
  url?: string;
  autoConnect?: boolean;
};

export function SocketProvider({ children, url, autoConnect = false }: SocketProviderProps) {
  const socketRef = useRef<SocketClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(
    (options?: Partial<SocketClientOptions>) => {
      if (socketRef.current?.connected) return;

      const socketUrl =
        options?.url || url || process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

      const client = new SocketClient({ url: socketUrl, ...options });

      client.on('connect', () => setIsConnected(true));
      client.on('disconnect', () => setIsConnected(false));

      client.connect();
      socketRef.current = client;
    },
    [url]
  );

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (autoConnect && url) {
      connect();
    }
    return () => {
      socketRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect, url]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected, connect, disconnect }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  return useContext(SocketContext);
}
