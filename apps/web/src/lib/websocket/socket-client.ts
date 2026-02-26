/**
 * @module SocketClient
 * @description Socket.IO-backed real-time client for AuraOS.
 *   Replaces the raw WebSocket implementation so that the client protocol
 *   matches the Socket.IO server-side stack used by the backend.
 *   The public API (connect / disconnect / on / off / send / connected) is
 *   intentionally kept identical to the previous WebSocket-based class so
 *   that SocketProvider.tsx requires no changes.
 * @project AURA HCM Platform
 */

import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

type SocketEventHandler = (data: unknown) => void;

export type SocketClientOptions = {
  url: string;
  token?: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
};

export class SocketClient {
  private socket: Socket | null = null;
  private options: Required<SocketClientOptions>;
  private _isConnected = false;

  constructor(options: SocketClientOptions) {
    this.options = {
      url: options.url,
      token: options.token ?? '',
      reconnect: options.reconnect ?? true,
      reconnectInterval: options.reconnectInterval ?? 3000,
      maxReconnectAttempts: options.maxReconnectAttempts ?? 10,
    };
  }

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(this.options.url, {
      // Send JWT as a handshake query parameter (same convention as before)
      ...(this.options.token ? { auth: { token: this.options.token } } : {}),
      reconnection: this.options.reconnect,
      reconnectionDelay: this.options.reconnectInterval,
      reconnectionAttempts: this.options.maxReconnectAttempts,
      // Use WebSocket transport first, fall back to polling
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      this._isConnected = true;
    });

    this.socket.on('disconnect', () => {
      this._isConnected = false;
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this._isConnected = false;
  }

  /**
   * Register a listener for a named event.
   * Returns an unsubscribe function for convenience.
   */
  on(event: string, handler: SocketEventHandler): () => void {
    this.socket?.on(event, handler as (...args: unknown[]) => void);
    return () => this.off(event, handler);
  }

  off(event: string, handler: SocketEventHandler): void {
    this.socket?.off(event, handler as (...args: unknown[]) => void);
  }

  /**
   * Emit an event with an optional payload.
   * Matches the previous WebSocket `send(event, payload)` signature.
   */
  send(event: string, payload: unknown): void {
    if (this.socket?.connected) {
      this.socket.emit(event, payload);
    }
  }

  get connected(): boolean {
    return this._isConnected;
  }
}
