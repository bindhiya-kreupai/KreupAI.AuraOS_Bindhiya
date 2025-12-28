/**
 * AuraOS Queue Manager
 * Manages RabbitMQ connections, publishers, and consumers
 *
 * @module @aura/messaging
 */

import * as amqp from 'amqplib';
import { EXCHANGES, QUEUES, getRabbitMQConfig, QueueDefinition } from '../config/queue.config';

export interface MessagePayload {
  id: string;
  type: string;
  tenantId: string;
  userId?: string;
  data: unknown;
  timestamp: Date;
  correlationId?: string;
  retryCount?: number;
}

export type MessageHandler = (message: MessagePayload) => Promise<void>;

export class QueueManager {
  private connection: any = null;
  private channel: any = null;
  private consumers: Map<string, MessageHandler> = new Map();
  private isConnected = false;

  /**
   * Initialize connection to RabbitMQ
   */
  async connect(): Promise<void> {
    try {
      const config = getRabbitMQConfig();
      const connectionUrl = `amqp://${config.username}:${config.password}@${config.host}:${config.port}${config.vhost}`;

      this.connection = await amqp.connect(connectionUrl, {
        heartbeat: config.heartbeat,
        timeout: config.connectionTimeout,
      });

      if (!this.connection) {
        throw new Error('Failed to establish RabbitMQ connection');
      }

      this.channel = await this.connection.createChannel();

      // Set prefetch count for fair dispatch
      await this.channel.prefetch(10);

      // Setup connection event handlers
      this.connection.on('error', (err: any) => {
        console.error('RabbitMQ connection error:', err);
        this.isConnected = false;
      });

      this.connection.on('close', () => {
        console.warn('RabbitMQ connection closed');
        this.isConnected = false;
        // Attempt reconnection after 5 seconds
        setTimeout(() => this.connect(), 5000);
      });

      this.isConnected = true;
      console.log('Successfully connected to RabbitMQ');

      // Setup exchanges and queues
      await this.setupInfrastructure();
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      // Retry connection after 5 seconds
      setTimeout(() => this.connect(), 5000);
      throw error;
    }
  }

  /**
   * Setup exchanges and queues
   */
  private async setupInfrastructure(): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    // Create exchanges
    for (const exchange of Object.values(EXCHANGES)) {
      await this.channel.assertExchange(
        exchange.name,
        exchange.type,
        {
          durable: exchange.durable,
          autoDelete: exchange.autoDelete,
        }
      );
      console.log(`Exchange created: ${exchange.name}`);
    }

    // Create queues and bind to exchanges
    for (const queue of Object.values(QUEUES)) {
      await this.createQueue(queue);
    }
  }

  /**
   * Create a queue and bind it to an exchange
   */
  private async createQueue(queueDef: QueueDefinition): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    const args: Record<string, unknown> = {};

    if (queueDef.options.messageTtl) {
      args['x-message-ttl'] = queueDef.options.messageTtl;
    }

    if (queueDef.options.maxLength) {
      args['x-max-length'] = queueDef.options.maxLength;
    }

    if (queueDef.options.deadLetterExchange) {
      args['x-dead-letter-exchange'] = queueDef.options.deadLetterExchange;
    }

    if (queueDef.options.deadLetterRoutingKey) {
      args['x-dead-letter-routing-key'] = queueDef.options.deadLetterRoutingKey;
    }

    await this.channel.assertQueue(queueDef.name, {
      durable: queueDef.options.durable,
      exclusive: queueDef.options.exclusive,
      autoDelete: queueDef.options.autoDelete,
      arguments: args,
    });

    await this.channel.bindQueue(
      queueDef.name,
      queueDef.exchange,
      queueDef.routingKey
    );

    console.log(`Queue created and bound: ${queueDef.name} -> ${queueDef.exchange}`);
  }

  /**
   * Publish a message to a queue
   */
  async publish(queueName: string, message: MessagePayload): Promise<boolean> {
    if (!this.channel || !this.isConnected) {
      throw new Error('Not connected to RabbitMQ');
    }

    const queueDef = Object.values(QUEUES).find(q => q.name === queueName);
    if (!queueDef) {
      throw new Error(`Queue not found: ${queueName}`);
    }

    const messageBuffer = Buffer.from(JSON.stringify(message));

    const published = this.channel.publish(
      queueDef.exchange,
      queueDef.routingKey,
      messageBuffer,
      {
        persistent: true,
        contentType: 'application/json',
        timestamp: Date.now(),
        messageId: message.id,
        correlationId: message.correlationId,
        headers: {
          tenantId: message.tenantId,
          userId: message.userId,
          retryCount: message.retryCount || 0,
        },
      }
    );

    return published;
  }

  /**
   * Subscribe to a queue and process messages
   */
  async subscribe(queueName: string, handler: MessageHandler): Promise<void> {
    if (!this.channel || !this.isConnected) {
      throw new Error('Not connected to RabbitMQ');
    }

    const queueDef = Object.values(QUEUES).find(q => q.name === queueName);
    if (!queueDef) {
      throw new Error(`Queue not found: ${queueName}`);
    }

    this.consumers.set(queueName, handler);

    await this.channel.consume(
      queueName,
      async (msg: amqp.ConsumeMessage | null) => {
        if (!msg || !this.channel) {
          return;
        }

        try {
          const message: MessagePayload = JSON.parse(msg.content.toString());
          const retryCount = (msg.properties.headers?.retryCount as number) || 0;
          message.retryCount = retryCount;

          // Process message
          await handler(message);

          // Acknowledge successful processing
          this.channel.ack(msg);
          console.log(`Message processed successfully: ${message.id}`);
        } catch (error) {
          console.error('Error processing message:', error);

          const retryCount = (msg.properties.headers?.retryCount as number) || 0;
          const maxRetries = queueDef.options.maxRetries || 3;

          if (retryCount < maxRetries) {
            // Reject and requeue for retry
            this.channel.nack(msg, false, true);
            console.log(`Message requeued for retry: ${retryCount + 1}/${maxRetries}`);
          } else {
            // Max retries reached, send to DLQ
            this.channel.nack(msg, false, false);
            console.error(`Message sent to DLQ after ${retryCount} retries`);
          }
        }
      },
      { noAck: false }
    );

    console.log(`Subscribed to queue: ${queueName}`);
  }

  /**
   * Close connection
   */
  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.isConnected = false;
      console.log('Disconnected from RabbitMQ');
    } catch (error) {
      console.error('Error disconnecting from RabbitMQ:', error);
    }
  }

  /**
   * Check if connected
   */
  isReady(): boolean {
    return this.isConnected && this.channel !== null;
  }
}

// Singleton instance
let queueManagerInstance: QueueManager | null = null;

export function getQueueManager(): QueueManager {
  if (!queueManagerInstance) {
    queueManagerInstance = new QueueManager();
  }
  return queueManagerInstance;
}
