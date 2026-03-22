/**
 * RabbitMQ-backed Event Bus
 * Provides reliable pub/sub for domain events across microservices via AMQP.
 *
 * @module @aura/events
 */

import { randomUUID } from 'crypto';

// ---------------------------------------------------------------------------
// Lightweight amqplib types so the package compiles without the full lib
// installed in every consumer.  The real amqplib is a peer dependency.
// ---------------------------------------------------------------------------

export interface AMQPChannel {
  assertExchange(name: string, type: string, options?: Record<string, unknown>): Promise<unknown>;
  assertQueue(name: string, options?: Record<string, unknown>): Promise<{ queue: string }>;
  bindQueue(queue: string, exchange: string, routingKey: string): Promise<unknown>;
  publish(exchange: string, routingKey: string, content: Buffer, options?: Record<string, unknown>): boolean;
  consume(queue: string, handler: (msg: AMQPMessage | null) => void, options?: Record<string, unknown>): Promise<unknown>;
  ack(msg: AMQPMessage): void;
  nack(msg: AMQPMessage, allUpTo?: boolean, requeue?: boolean): void;
  prefetch(count: number): Promise<void>;
  close(): Promise<void>;
}

export interface AMQPMessage {
  content: Buffer;
  fields: {
    exchange: string;
    routingKey: string;
    deliveryTag: number;
    redelivered: boolean;
  };
  properties: {
    correlationId?: string;
    messageId?: string;
    timestamp?: number;
    headers?: Record<string, unknown>;
    contentType?: string;
  };
}

export interface AMQPConnection {
  createChannel(): Promise<AMQPChannel>;
  close(): Promise<void>;
  on(event: string, handler: (...args: unknown[]) => void): void;
}

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type ExchangeType = 'topic' | 'fanout' | 'direct' | 'headers';

export interface ExchangeOptions {
  durable?: boolean;
  autoDelete?: boolean;
  arguments?: Record<string, unknown>;
}

export interface QueueOptions {
  durable?: boolean;
  exclusive?: boolean;
  autoDelete?: boolean;
  deadLetterExchange?: string;
  deadLetterRoutingKey?: string;
  messageTtl?: number;
  maxLength?: number;
  arguments?: Record<string, unknown>;
}

export interface RabbitMQBusOptions {
  url?: string;
  prefetch?: number;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

export interface PublishOptions {
  correlationId?: string;
  persistent?: boolean;
  headers?: Record<string, unknown>;
}

export type MessageHandler<T = unknown> = (
  payload: T,
  metadata: { correlationId?: string; messageId: string; timestamp: Date; routingKey: string }
) => Promise<void> | void;

// ---------------------------------------------------------------------------
// RabbitMQ Event Bus
// ---------------------------------------------------------------------------

/**
 * RabbitMQEventBus
 *
 * Wraps amqplib with a high-level API for publishing and subscribing to domain
 * events.  Supports automatic reconnection, JSON serialization, correlation IDs,
 * and Dead-Letter Queues (DLQ).
 *
 * Usage:
 *   const bus = new RabbitMQEventBus({ url: process.env.RABBITMQ_URL });
 *   await bus.connect();
 *   await bus.createExchange('aura.events', 'topic');
 *   await bus.createQueue('payroll.events', { deadLetterExchange: 'aura.dlx' });
 *   await bus.subscribe('aura.events', 'payroll.#', 'payroll.events', handler);
 *   await bus.publish('aura.events', 'payroll.run.completed', payload);
 */
export class RabbitMQEventBus {
  private connection: AMQPConnection | null = null;
  private channel: AMQPChannel | null = null;
  private readonly options: Required<RabbitMQBusOptions>;
  private reconnectAttempts = 0;
  private isConnecting = false;

  constructor(options: RabbitMQBusOptions = {}) {
    this.options = {
      url: options.url ?? process.env.RABBITMQ_URL ?? 'amqp://localhost:5672',
      prefetch: options.prefetch ?? 10,
      reconnectDelay: options.reconnectDelay ?? 5000,
      maxReconnectAttempts: options.maxReconnectAttempts ?? 10,
    };
  }

  // -------------------------------------------------------------------------
  // Connection management
  // -------------------------------------------------------------------------

  /**
   * Establish AMQP connection and channel.
   * Dynamically requires amqplib to keep it as an optional dep.
   */
  async connect(): Promise<void> {
    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      // Dynamic import — consumers that don't use RabbitMQ won't pay for it
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const amqp = require('amqplib') as {
        connect(url: string): Promise<AMQPConnection>;
      };

      this.connection = await amqp.connect(this.options.url);

      this.connection!.on('error', (...args: unknown[]) => {
        const err = args[0] as Error;
        console.error('[RabbitMQEventBus] Connection error:', err?.message);
        this.scheduleReconnect();
      });

      this.connection!.on('close', () => {
        console.warn('[RabbitMQEventBus] Connection closed — reconnecting...');
        this.scheduleReconnect();
      });

      this.channel = await this.connection!.createChannel();
      await this.channel.prefetch(this.options.prefetch);

      this.reconnectAttempts = 0;
      console.info('[RabbitMQEventBus] Connected to RabbitMQ');
    } finally {
      this.isConnecting = false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch {
      // Ignore errors during disconnect
    }
    this.channel = null;
    this.connection = null;
    console.info('[RabbitMQEventBus] Disconnected');
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      console.error('[RabbitMQEventBus] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts += 1;
    const delay = this.options.reconnectDelay * this.reconnectAttempts;
    console.info(`[RabbitMQEventBus] Reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    setTimeout(() => {
      this.connect().catch((err) =>
        console.error('[RabbitMQEventBus] Reconnect failed:', err)
      );
    }, delay);
  }

  private ensureChannel(): AMQPChannel {
    if (!this.channel) {
      throw new Error('[RabbitMQEventBus] Not connected — call connect() first');
    }
    return this.channel;
  }

  // -------------------------------------------------------------------------
  // Exchange / Queue management
  // -------------------------------------------------------------------------

  /**
   * Declare an AMQP exchange.
   */
  async createExchange(
    name: string,
    type: ExchangeType,
    options: ExchangeOptions = {}
  ): Promise<void> {
    const ch = this.ensureChannel();
    await ch.assertExchange(name, type, {
      durable: options.durable ?? true,
      autoDelete: options.autoDelete ?? false,
      arguments: options.arguments,
    });
    console.debug(`[RabbitMQEventBus] Exchange declared: ${name} (${type})`);
  }

  /**
   * Declare a durable queue with optional DLQ support.
   */
  async createQueue(name: string, options: QueueOptions = {}): Promise<string> {
    const ch = this.ensureChannel();

    const queueArgs: Record<string, unknown> = { ...(options.arguments ?? {}) };
    if (options.deadLetterExchange) {
      queueArgs['x-dead-letter-exchange'] = options.deadLetterExchange;
    }
    if (options.deadLetterRoutingKey) {
      queueArgs['x-dead-letter-routing-key'] = options.deadLetterRoutingKey;
    }
    if (options.messageTtl) {
      queueArgs['x-message-ttl'] = options.messageTtl;
    }
    if (options.maxLength) {
      queueArgs['x-max-length'] = options.maxLength;
    }

    const result = await ch.assertQueue(name, {
      durable: options.durable ?? true,
      exclusive: options.exclusive ?? false,
      autoDelete: options.autoDelete ?? false,
      arguments: queueArgs,
    });

    console.debug(`[RabbitMQEventBus] Queue declared: ${result.queue}`);
    return result.queue;
  }

  // -------------------------------------------------------------------------
  // Publish / Subscribe
  // -------------------------------------------------------------------------

  /**
   * Publish a domain event to an exchange.
   * Automatically injects: messageId, correlationId, timestamp, contentType.
   */
  async publish<T = unknown>(
    exchange: string,
    routingKey: string,
    payload: T,
    options: PublishOptions = {}
  ): Promise<void> {
    const ch = this.ensureChannel();

    const messageId = randomUUID();
    const correlationId = options.correlationId ?? randomUUID();
    const content = Buffer.from(JSON.stringify(payload));

    ch.publish(exchange, routingKey, content, {
      persistent: options.persistent ?? true,
      contentType: 'application/json',
      messageId,
      correlationId,
      timestamp: Math.floor(Date.now() / 1000),
      headers: options.headers,
    });

    console.debug(
      `[RabbitMQEventBus] Published → ${exchange}/${routingKey} [${messageId}]`
    );
  }

  /**
   * Subscribe to events matching a routing key pattern on an exchange.
   * Messages are auto-ack'd after successful handler execution.
   * Nack (no requeue) on error — sends to DLQ if configured.
   */
  async subscribe<T = unknown>(
    exchange: string,
    routingKey: string,
    queue: string,
    handler: MessageHandler<T>
  ): Promise<void> {
    const ch = this.ensureChannel();

    // Bind queue to exchange
    await ch.bindQueue(queue, exchange, routingKey);

    await ch.consume(queue, async (msg) => {
      if (!msg) return; // Consumer cancelled

      try {
        const payload = JSON.parse(msg.content.toString()) as T;
        const metadata = {
          correlationId: msg.properties.correlationId,
          messageId: msg.properties.messageId ?? randomUUID(),
          timestamp: msg.properties.timestamp
            ? new Date(msg.properties.timestamp * 1000)
            : new Date(),
          routingKey: msg.fields.routingKey,
        };

        await handler(payload, metadata);
        ch.ack(msg);
      } catch (err) {
        console.error(
          `[RabbitMQEventBus] Handler error on ${queue} [${msg.fields.routingKey}]:`,
          err
        );
        // Nack without requeue → routes to DLQ if configured
        ch.nack(msg, false, false);
      }
    });

    console.info(
      `[RabbitMQEventBus] Subscribed: ${exchange}/${routingKey} → ${queue}`
    );
  }

  // -------------------------------------------------------------------------
  // Health check
  // -------------------------------------------------------------------------

  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let rabbitMQBusInstance: RabbitMQEventBus | null = null;

export function getRabbitMQEventBus(options?: RabbitMQBusOptions): RabbitMQEventBus {
  if (!rabbitMQBusInstance) {
    rabbitMQBusInstance = new RabbitMQEventBus(options);
  }
  return rabbitMQBusInstance;
}
