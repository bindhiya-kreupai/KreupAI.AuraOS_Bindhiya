type SocketEventHandler = (data: unknown) => void;

export type SocketClientOptions = {
  url: string;
  token?: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
};

export class SocketClient {
  private ws: WebSocket | null = null;
  private handlers: Map<string, Set<SocketEventHandler>> = new Map();
  private options: Required<SocketClientOptions>;
  private reconnectAttempts = 0;
  private isConnected = false;

  constructor(options: SocketClientOptions) {
    this.options = {
      url: options.url,
      token: options.token || '',
      reconnect: options.reconnect ?? true,
      reconnectInterval: options.reconnectInterval ?? 3000,
      maxReconnectAttempts: options.maxReconnectAttempts ?? 10,
    };
  }

  connect(): void {
    const url = this.options.token
      ? `${this.options.url}?token=${this.options.token}`
      : this.options.url;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connect', {});
    };

    this.ws.onmessage = (event) => {
      try {
        const { type, payload } = JSON.parse(event.data);
        this.emit(type, payload);
      } catch {
        // Ignore malformed messages
      }
    };

    this.ws.onclose = () => {
      this.isConnected = false;
      this.emit('disconnect', {});
      if (this.options.reconnect && this.reconnectAttempts < this.options.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), this.options.reconnectInterval * this.reconnectAttempts);
      }
    };

    this.ws.onerror = (error) => {
      this.emit('error', error);
    };
  }

  disconnect(): void {
    this.options.reconnect = false;
    this.ws?.close();
    this.ws = null;
    this.isConnected = false;
  }

  on(event: string, handler: SocketEventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  off(event: string, handler: SocketEventHandler): void {
    this.handlers.get(event)?.delete(handler);
  }

  send(event: string, payload: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: event, payload }));
    }
  }

  get connected(): boolean {
    return this.isConnected;
  }

  private emit(event: string, data: unknown): void {
    this.handlers.get(event)?.forEach((handler) => handler(data));
  }
}
