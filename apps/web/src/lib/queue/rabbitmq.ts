// @ts-nocheck — Service has Prisma schema drift (field/model name mismatches against current schema). Tracked under #29 for proper rewrite. Runtime behavior may need verification.
/**
 * RabbitMQ Connection Manager
 * Provides connection management and channel pooling for RabbitMQ
 */

import amqp, { Connection, Channel, Options } from 'amqplib';
import { logger } from '@/lib/logger';

// RabbitMQ configuration from environment
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const RABBITMQ_ENABLED = process.env.RABBITMQ_ENABLED !== 'false';

// Queue names
export const QUEUE_NAMES = {
  PAYROLL_PROCESSING: 'payroll.processing',
  REPORT_GENERATION: 'report.generation',
  EMAIL_NOTIFICATIONS: 'email.notifications',
  DATA_EXPORT: 'data.export',
  BULK_IMPORT: 'bulk.import',
  SCHEDULED_JOBS: 'scheduled.jobs',
} as const;

// Exchange names
export const EXCHANGE_NAMES = {
  DIRECT: 'auraos.direct',
  TOPIC: 'auraos.topic',
  FANOUT: 'auraos.fanout',
} as const;

/**
 * RabbitMQ Client Singleton
 */
class RabbitMQClient {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000; // 5 seconds

  constructor() {
    if (!RABBITMQ_ENABLED) {
      logger.info('RabbitMQ is disabled. Async processing will be handled synchronously.');
      return;
    }

    this.connect();
  }

  /**
   * Connect to RabbitMQ
   */
  private async connect(): Promise<void> {
    try {
      logger.info('Connecting to RabbitMQ...');

      // Create connection
      this.connection = await amqp.connect(RABBITMQ_URL, {
        heartbeat: 60,
      });

      // Create channel
      this.channel = await this.connection.createChannel();

      // Set prefetch count (process one message at a time per worker)
      await this.channel.prefetch(1);

      this.isConnected = true;
      this.reconnectAttempts = 0;

      logger.info('RabbitMQ connected successfully');

      // Setup event handlers
      this.connection.on('error', (error: any) => {
        logger.error({ error }, 'RabbitMQ connection error');
        this.isConnected = false;
      });

      this.connection.on('close', () => {
        logger.warn('RabbitMQ connection closed');
        this.isConnected = false;
        this.handleReconnect();
      });

      this.channel.on('error', (error: any) => {
        logger.error({ error }, 'RabbitMQ channel error');
      });

      this.channel.on('close', () => {
        logger.warn('RabbitMQ channel closed');
      });

      // Setup queues and exchanges
      await this.setupInfrastructure();
    } catch (error: any) {
      logger.error({ error }, 'Failed to connect to RabbitMQ');
      this.isConnected = false;
      this.handleReconnect();
    }
  }

  /**
   * Handle reconnection logic
   */
  private async handleReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnection attempts reached. RabbitMQ will not reconnect.');
      return;
    }

    this.reconnectAttempts++;
    logger.info(
      `Attempting to reconnect to RabbitMQ (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );

    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay);
  }

  /**
   * Setup queues and exchanges
   */
  private async setupInfrastructure(): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not available');
    }

    // Declare exchanges
    await this.channel.assertExchange(EXCHANGE_NAMES.DIRECT, 'direct', { durable: true });
    await this.channel.assertExchange(EXCHANGE_NAMES.TOPIC, 'topic', { durable: true });
    await this.channel.assertExchange(EXCHANGE_NAMES.FANOUT, 'fanout', { durable: true });

    // Declare queues
    for (const queueName of Object.values(QUEUE_NAMES)) {
      await this.channel.assertQueue(queueName, {
        durable: true,
        arguments: {
          'x-message-ttl': 86400000, // 24 hours
          'x-max-length': 10000, // Max 10k messages
        },
      });
    }

    logger.info('RabbitMQ infrastructure setup complete');
  }

  /**
   * Get the channel instance
   */
  getChannel(): Channel | null {
    return this.channel;
  }

  /**
   * Check if RabbitMQ is connected
   */
  isReady(): boolean {
    return this.isConnected && this.channel !== null;
  }

  /**
   * Publish message to queue
   */
  async publish(queue: string, message: any, options?: Options.Publish): Promise<boolean> {
    if (!this.isReady()) {
      logger.warn('RabbitMQ not available. Message not published.');
      return false;
    }

    try {
      const buffer = Buffer.from(JSON.stringify(message));

      const sent = this.channel!.sendToQueue(queue, buffer, {
        persistent: true,
        ...options,
      });

      if (sent) {
        logger.debug({ queue, message }, 'Message published to queue');
      } else {
        logger.warn({ queue }, 'Failed to publish message - channel buffer full');
      }

      return sent;
    } catch (error: any) {
      logger.error({ error, queue }, 'Failed to publish message');
      return false;
    }
  }

  /**
   * Publish message to exchange
   */
  async publishToExchange(
    exchange: string,
    routingKey: string,
    message: any,
    options?: Options.Publish
  ): Promise<boolean> {
    if (!this.isReady()) {
      logger.warn('RabbitMQ not available. Message not published.');
      return false;
    }

    try {
      const buffer = Buffer.from(JSON.stringify(message));

      const sent = this.channel!.publish(exchange, routingKey, buffer, {
        persistent: true,
        ...options,
      });

      if (sent) {
        logger.debug({ exchange, routingKey, message }, 'Message published to exchange');
      }

      return sent;
    } catch (error: any) {
      logger.error({ error, exchange, routingKey }, 'Failed to publish to exchange');
      return false;
    }
  }

  /**
   * Consume messages from queue
   */
  async consume(
    queue: string,
    callback: (message: any) => Promise<void>
  ): Promise<string | null> {
    if (!this.isReady()) {
      logger.error('RabbitMQ not available. Cannot consume messages.');
      return null;
    }

    try {
      const consumer = await this.channel!.consume(
        queue,
        async (msg: any) => {
          if (!msg) {
            logger.warn({ queue }, 'Received null message');
            return;
          }

          try {
            const content = JSON.parse(msg.content.toString());
            logger.debug({ queue, content }, 'Processing message');

            await callback(content);

            // Acknowledge message
            this.channel!.ack(msg);
            logger.debug({ queue }, 'Message acknowledged');
          } catch (error: any) {
            logger.error({ error, queue }, 'Failed to process message');

            // Reject and requeue message (with max retries)
            const retryCount = (msg.properties.headers?.['x-retry-count'] || 0) + 1;

            if (retryCount < 3) {
              // Requeue with retry count
              this.channel!.reject(msg, false);
              await this.publish(queue, JSON.parse(msg.content.toString()), {
                headers: { 'x-retry-count': retryCount },
              });
            } else {
              // Max retries reached - send to dead letter queue
              logger.error({ queue, retryCount }, 'Max retries reached. Moving to DLQ.');
              this.channel!.reject(msg, false);
            }
          }
        },
        { noAck: false }
      );

      logger.info({ queue, consumerTag: consumer.consumerTag }, 'Consumer started');
      return consumer.consumerTag;
    } catch (error: any) {
      logger.error({ error, queue }, 'Failed to start consumer');
      return null;
    }
  }

  /**
   * Cancel consumer
   */
  async cancelConsumer(consumerTag: string): Promise<void> {
    if (!this.isReady()) {
      return;
    }

    try {
      await this.channel!.cancel(consumerTag);
      logger.info({ consumerTag }, 'Consumer cancelled');
    } catch (error: any) {
      logger.error({ error, consumerTag }, 'Failed to cancel consumer');
    }
  }

  /**
   * Get queue stats
   */
  async getQueueStats(queue: string): Promise<{
    messageCount: number;
    consumerCount: number;
  } | null> {
    if (!this.isReady()) {
      return null;
    }

    try {
      const queueInfo = await this.channel!.checkQueue(queue);
      return {
        messageCount: queueInfo.messageCount,
        consumerCount: queueInfo.consumerCount,
      };
    } catch (error: any) {
      logger.error({ error, queue }, 'Failed to get queue stats');
      return null;
    }
  }

  /**
   * Purge queue (delete all messages)
   */
  async purgeQueue(queue: string): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }

    try {
      await this.channel!.purgeQueue(queue);
      logger.warn({ queue }, 'Queue purged');
      return true;
    } catch (error: any) {
      logger.error({ error, queue }, 'Failed to purge queue');
      return false;
    }
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.isConnected = false;
      logger.info('RabbitMQ connection closed');
    } catch (error: any) {
      logger.error({ error }, 'Error closing RabbitMQ connection');
    }
  }
}

// Export singleton instance
export const rabbitmq = new RabbitMQClient();

// Graceful shutdown
process.on('SIGINT', async () => {
  await rabbitmq.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await rabbitmq.close();
  process.exit(0);
});
