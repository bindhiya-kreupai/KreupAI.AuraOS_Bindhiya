'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { SocketClient, SocketClientOptions } from '@/lib/websocket/socket-client';

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

  const connect = (options?: Partial<SocketClientOptions>) => {
    if (socketRef.current?.connected) return;

    const socketUrl = options?.url || url || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    const client = new SocketClient({ url: socketUrl, ...options });

    client.on('connect', () => setIsConnected(true));
    client.on('disconnect', () => setIsConnected(false));

    client.connect();
    socketRef.current = client;
  };

  const disconnect = () => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setIsConnected(false);
  };

  useEffect(() => {
    if (autoConnect && url) {
      connect();
    }
    return () => {
      socketRef.current?.disconnect();
    };
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
