/**
 * @module event-consumer
 * @description RabbitMQ event consumer for AuraOS microservices.
 *              Provides reliable message consumption with auto-ack/nack,
 *              retry with exponential backoff, dead-letter queuing,
 *              and consumer group management.
 * @project AuraOS Enterprise HCM Platform
 * @section 27 — Microservices Infrastructure
 */

import type * as amqplib from 'amqplib';
import type { DomainEvent, DomainEventType } from './event-publisher';
import { EXCHANGES } from './event-publisher';

// ============================================================================
// TYPES
// ============================================================================

export type MessageHandler<T = Record<string, unknown>> = (
  event: DomainEvent<T>,
  message: amqplib.ConsumeMessage,
) => Promise<void>;

export interface ConsumerOptions {
  prefetch?: number;
  exclusive?: boolean;
  durable?: boolean;
  autoDelete?: boolean;
  deadLetterQueue?: string;
  messageTtlMs?: number;
  bindingKeys?: string[];
}

export interface RetryOptions {
  maxRetries: number;
  initialDelayMs?: number;
  backoffMultiplier?: number;
  maxDelayMs?: number;
  dlqSuffix?: string;
}

export interface ConsumerGroupOptions {
  groupName: string;
  queues: string[];
  prefetch?: number;
  exclusive?: boolean;
}

export interface ConsumerStats {
  queue: string;
  messagesProcessed: number;
  messagesAcked: number;
  messagesNacked: number;
  messagesRetried: number;
  messagesDlq: number;
  avgProcessingTimeMs: number;
  lastMessageAt?: string;
  active: boolean;
}

// ============================================================================
// CONSUMER CLASS
// ============================================================================

export class EventConsumer {
  private connection: amqplib.Connection | null = null;
  private channel: amqplib.Channel | null = null;
  private readonly amqpUrl: string;
  private readonly stats = new Map<string, ConsumerStats>();
  private consumerTags = new Map<string, string>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isConnecting = false;

  constructor(amqpUrl?: string) {
    this.amqpUrl = amqpUrl ?? process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672';
  }

  async connect(): Promise<void> {
    if (this.isConnecting || this.connection) return;
    this.isConnecting = true;

    try {
      const amqp = await import('amqplib');
      this.connection = await amqp.connect(this.amqpUrl);
      this.channel = await this.connection.createChannel();

      this.connection.on('error', () => this.scheduleReconnect());
      this.connection.on('close', () => this.scheduleReconnect());

      console.info('[EventConsumer] Connected to RabbitMQ');
    } catch (err) {
      console.error('[EventConsumer] Connection failed:', err);
      this.scheduleReconnect();
    } finally {
      this.isConnecting = false;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.connection = null;
    this.channel = null;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch(console.error);
    }, 5000);
  }

  /**
   * subscribe — consume events from a queue with auto-ack on success, nack on error.
   */
  async subscribe<T = Record<string, unknown>>(
    queue: string,
    handler: MessageHandler<T>,
    options: ConsumerOptions = {},
  ): Promise<string> {
    await this.connect();
    if (!this.channel) throw new Error('AMQP channel not available');

    const {
      prefetch = 10,
      durable = true,
      autoDelete = false,
      bindingKeys,
      messageTtlMs,
      deadLetterQueue,
    } = options;

    await this.channel.prefetch(prefetch);

    // Declare queue with optional DLX and TTL
    const queueArgs: Record<string, unknown> = {};
    if (deadLetterQueue) queueArgs['x-dead-letter-exchange'] = EXCHANGES.DLX;
    if (messageTtlMs) queueArgs['x-message-ttl'] = messageTtlMs;

    await this.channel.assertQueue(queue, { durable, autoDelete, arguments: queueArgs });

    // Bind to routing keys if provided
    if (bindingKeys) {
      for (const key of bindingKeys) {
        const exchange = key.split('.')[0];
        const exchangeName = `aura.${exchange}`;
        await this.channel.bindQueue(queue, exchangeName, key);
      }
    }

    // Initialize stats
    this.stats.set(queue, {
      queue,
      messagesProcessed: 0,
      messagesAcked: 0,
      messagesNacked: 0,
      messagesRetried: 0,
      messagesDlq: 0,
      avgProcessingTimeMs: 0,
      active: true,
    });

    const { consumerTag } = await this.channel.consume(queue, async (msg) => {
      if (!msg) return; // Consumer cancelled

      const stats = this.stats.get(queue)!;
      const start = Date.now();
      stats.messagesProcessed++;
      stats.lastMessageAt = new Date().toISOString();

      try {
        const event = JSON.parse(msg.content.toString()) as DomainEvent<T>;
        await handler(event, msg);

        this.channel?.ack(msg);
        stats.messagesAcked++;
      } catch (err) {
        console.error(`[EventConsumer] Handler error on queue '${queue}':`, err);
        // Requeue once, then send to DLQ
        const redelivered = msg.fields.redelivered;
        this.channel?.nack(msg, false, !redelivered);
        stats.messagesNacked++;
      }

      // Update rolling average
      const elapsed = Date.now() - start;
      stats.avgProcessingTimeMs =
        (stats.avgProcessingTimeMs * (stats.messagesProcessed - 1) + elapsed) /
        stats.messagesProcessed;
    });

    this.consumerTags.set(queue, consumerTag);
    return consumerTag;
  }

  /**
   * subscribeWithRetry — consume with exponential backoff retries and DLQ on exhaustion.
   */
  async subscribeWithRetry<T = Record<string, unknown>>(
    queue: string,
    handler: MessageHandler<T>,
    retryOptions: RetryOptions,
    consumerOptions: ConsumerOptions = {},
  ): Promise<string> {
    await this.connect();
    if (!this.channel) throw new Error('AMQP channel not available');

    const {
      maxRetries,
      initialDelayMs = 1000,
      backoffMultiplier = 2,
      maxDelayMs = 30_000,
      dlqSuffix = '.dlq',
    } = retryOptions;

    const dlqName = `${queue}${dlqSuffix}`;
    const retryQueuePrefix = `${queue}.retry`;

    // Declare DLQ
    await this.channel.assertQueue(dlqName, { durable: true });

    // Declare retry queues with TTL (one per retry level)
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const delay = Math.min(initialDelayMs * Math.pow(backoffMultiplier, attempt - 1), maxDelayMs);
      const retryQueue = `${retryQueuePrefix}.${attempt}`;
      await this.channel.assertQueue(retryQueue, {
        durable: true,
        arguments: {
          'x-message-ttl': delay,
          'x-dead-letter-exchange': '',
          'x-dead-letter-routing-key': queue,
        },
      });
    }

    // Main queue with DLX pointing to first retry queue
    await this.channel.assertQueue(queue, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': `${retryQueuePrefix}.1`,
      },
    });

    const stats = this.stats.get(queue) ?? {
      queue, messagesProcessed: 0, messagesAcked: 0, messagesNacked: 0,
      messagesRetried: 0, messagesDlq: 0, avgProcessingTimeMs: 0, active: true,
    };
    this.stats.set(queue, stats);

    const { consumerTag } = await this.channel.consume(queue, async (msg) => {
      if (!msg) return;

      const start = Date.now();
      stats.messagesProcessed++;
      stats.lastMessageAt = new Date().toISOString();

      // Track retry attempt count
      const xDeath = (msg.properties.headers?.['x-death'] as Array<{ count: number }>) ?? [];
      const attemptCount = xDeath.reduce((s, d) => s + d.count, 0);

      try {
        const event = JSON.parse(msg.content.toString()) as DomainEvent<T>;
        await handler(event, msg);

        this.channel?.ack(msg);
        stats.messagesAcked++;
      } catch (err) {
        console.error(`[EventConsumer] Retry handler error (attempt ${attemptCount + 1}/${maxRetries}):`, err);

        if (attemptCount >= maxRetries) {
          // Exhausted retries — send to DLQ
          console.error(`[EventConsumer] Moving message to DLQ '${dlqName}' after ${maxRetries} attempts`);
          this.channel?.nack(msg, false, false); // nack without requeue → DLX → DLQ
          stats.messagesDlq++;
        } else {
          this.channel?.nack(msg, false, false); // → retry queue via DLX
          stats.messagesRetried++;
        }
      }

      const elapsed = Date.now() - start;
      stats.avgProcessingTimeMs =
        (stats.avgProcessingTimeMs * (stats.messagesProcessed - 1) + elapsed) /
        stats.messagesProcessed;
    });

    this.consumerTags.set(queue, consumerTag);
    return consumerTag;
  }

  /**
   * createConsumerGroup — register multiple consumers under a logical group.
   */
  async createConsumerGroup(
    options: ConsumerGroupOptions,
    handlers: Record<string, MessageHandler>,
  ): Promise<{
    groupName: string;
    consumers: Array<{ queue: string; consumerTag: string }>;
  }> {
    const consumers: Array<{ queue: string; consumerTag: string }> = [];

    for (const queue of options.queues) {
      const handler = handlers[queue];
      if (!handler) {
        console.warn(`[EventConsumer] No handler for queue '${queue}' in group '${options.groupName}' — skipping`);
        continue;
      }

      const consumerTag = await this.subscribe(queue, handler, {
        prefetch: options.prefetch,
        exclusive: options.exclusive,
      });

      consumers.push({ queue, consumerTag });
    }

    console.info(
      `[EventConsumer] Consumer group '${options.groupName}' started with ${consumers.length} consumers`,
    );

    return { groupName: options.groupName, consumers };
  }

  /**
   * getStats — returns per-queue consumer statistics.
   */
  getStats(queue?: string): ConsumerStats | ConsumerStats[] {
    if (queue) {
      return this.stats.get(queue) ?? {
        queue, messagesProcessed: 0, messagesAcked: 0, messagesNacked: 0,
        messagesRetried: 0, messagesDlq: 0, avgProcessingTimeMs: 0, active: false,
      };
    }
    return Array.from(this.stats.values());
  }

  /**
   * unsubscribe — cancel a specific consumer by queue name.
   */
  async unsubscribe(queue: string): Promise<void> {
    const tag = this.consumerTags.get(queue);
    if (tag && this.channel) {
      await this.channel.cancel(tag);
      this.consumerTags.delete(queue);
      const s = this.stats.get(queue);
      if (s) s.active = false;
    }
  }

  /**
   * close — gracefully close all consumers and the connection.
   */
  async close(): Promise<void> {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    for (const [queue] of this.consumerTags) {
      await this.unsubscribe(queue).catch(() => {});
    }
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch {
      // ignore
    }
    this.channel = null;
    this.connection = null;
  }
}

// ============================================================================
// SINGLETON FACTORY
// ============================================================================

let defaultConsumer: EventConsumer | null = null;

export function getConsumer(): EventConsumer {
  if (!defaultConsumer) {
    defaultConsumer = new EventConsumer();
  }
  return defaultConsumer;
}

export async function subscribe<T = Record<string, unknown>>(
  queue: string,
  handler: MessageHandler<T>,
  options?: ConsumerOptions,
): Promise<string> {
  return getConsumer().subscribe(queue, handler, options);
}

export async function subscribeWithRetry<T = Record<string, unknown>>(
  queue: string,
  handler: MessageHandler<T>,
  retries: RetryOptions,
): Promise<string> {
  return getConsumer().subscribeWithRetry(queue, handler, retries);
}

export async function createConsumerGroup(
  group: ConsumerGroupOptions,
  handlers: Record<string, MessageHandler>,
): Promise<{ groupName: string; consumers: Array<{ queue: string; consumerTag: string }> }> {
  return getConsumer().createConsumerGroup(group, handlers);
}

// Re-export types for consumers
export type { DomainEventType, DomainEvent };
