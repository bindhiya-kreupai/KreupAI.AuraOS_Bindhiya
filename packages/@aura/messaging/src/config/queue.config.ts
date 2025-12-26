/**
 * AuraOS Message Queue Configuration
 * RabbitMQ configuration for async processing
 *
 * @module @aura/messaging
 */

export interface QueueConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  vhost: string;
  heartbeat?: number;
  connectionTimeout?: number;
}

export interface ExchangeConfig {
  name: string;
  type: 'direct' | 'topic' | 'fanout' | 'headers';
  durable: boolean;
  autoDelete: boolean;
}

export interface QueueOptions {
  durable: boolean;
  exclusive: boolean;
  autoDelete: boolean;
  messageTtl?: number;
  maxLength?: number;
  deadLetterExchange?: string;
  deadLetterRoutingKey?: string;
  maxRetries?: number;
}

export interface QueueDefinition {
  name: string;
  exchange: string;
  routingKey: string;
  options: QueueOptions;
}

/**
 * Exchange Definitions
 */
export const EXCHANGES: Record<string, ExchangeConfig> = {
  NOTIFICATIONS: {
    name: 'aura.notifications',
    type: 'topic',
    durable: true,
    autoDelete: false,
  },
  DOCUMENTS: {
    name: 'aura.documents',
    type: 'direct',
    durable: true,
    autoDelete: false,
  },
  PAYROLL: {
    name: 'aura.payroll',
    type: 'direct',
    durable: true,
    autoDelete: false,
  },
  EVENTS: {
    name: 'aura.events',
    type: 'fanout',
    durable: true,
    autoDelete: false,
  },
  DLX: {
    name: 'aura.dlx',
    type: 'direct',
    durable: true,
    autoDelete: false,
  },
};

/**
 * Queue Definitions with DLQ support
 */
export const QUEUES: Record<string, QueueDefinition> = {
  // Notification Queues
  EMAIL_NOTIFICATIONS: {
    name: 'notifications.email',
    exchange: EXCHANGES.NOTIFICATIONS.name,
    routingKey: 'email.*',
    options: {
      durable: true,
      exclusive: false,
      autoDelete: false,
      messageTtl: 3600000, // 1 hour
      maxRetries: 3,
      deadLetterExchange: EXCHANGES.DLX.name,
      deadLetterRoutingKey: 'notifications.email.failed',
    },
  },
  SMS_NOTIFICATIONS: {
    name: 'notifications.sms',
    exchange: EXCHANGES.NOTIFICATIONS.name,
    routingKey: 'sms.*',
    options: {
      durable: true,
      exclusive: false,
      autoDelete: false,
      messageTtl: 1800000, // 30 minutes
      maxRetries: 3,
      deadLetterExchange: EXCHANGES.DLX.name,
      deadLetterRoutingKey: 'notifications.sms.failed',
    },
  },
  PUSH_NOTIFICATIONS: {
    name: 'notifications.push',
    exchange: EXCHANGES.NOTIFICATIONS.name,
    routingKey: 'push.*',
    options: {
      durable: true,
      exclusive: false,
      autoDelete: false,
      messageTtl: 600000, // 10 minutes
      maxRetries: 3,
      deadLetterExchange: EXCHANGES.DLX.name,
      deadLetterRoutingKey: 'notifications.push.failed',
    },
  },

  // Document Processing Queues
  DOCUMENT_GENERATION: {
    name: 'documents.generate',
    exchange: EXCHANGES.DOCUMENTS.name,
    routingKey: 'generate',
    options: {
      durable: true,
      exclusive: false,
      autoDelete: false,
      messageTtl: 7200000, // 2 hours
      maxRetries: 2,
      deadLetterExchange: EXCHANGES.DLX.name,
      deadLetterRoutingKey: 'documents.generate.failed',
    },
  },
  DOCUMENT_PROCESSING: {
    name: 'documents.process',
    exchange: EXCHANGES.DOCUMENTS.name,
    routingKey: 'process',
    options: {
      durable: true,
      exclusive: false,
      autoDelete: false,
      messageTtl: 3600000, // 1 hour
      maxRetries: 2,
      deadLetterExchange: EXCHANGES.DLX.name,
      deadLetterRoutingKey: 'documents.process.failed',
    },
  },

  // Payroll Processing Queues
  PAYROLL_CALCULATION: {
    name: 'payroll.calculate',
    exchange: EXCHANGES.PAYROLL.name,
    routingKey: 'calculate',
    options: {
      durable: true,
      exclusive: false,
      autoDelete: false,
      messageTtl: 7200000, // 2 hours
      maxRetries: 1,
      deadLetterExchange: EXCHANGES.DLX.name,
      deadLetterRoutingKey: 'payroll.calculate.failed',
    },
  },
  PAYROLL_EXPORT: {
    name: 'payroll.export',
    exchange: EXCHANGES.PAYROLL.name,
    routingKey: 'export',
    options: {
      durable: true,
      exclusive: false,
      autoDelete: false,
      messageTtl: 3600000, // 1 hour
      maxRetries: 2,
      deadLetterExchange: EXCHANGES.DLX.name,
      deadLetterRoutingKey: 'payroll.export.failed',
    },
  },

  // Event Processing
  AUDIT_EVENTS: {
    name: 'events.audit',
    exchange: EXCHANGES.EVENTS.name,
    routingKey: '',
    options: {
      durable: true,
      exclusive: false,
      autoDelete: false,
      messageTtl: 86400000, // 24 hours
      maxRetries: 5,
      deadLetterExchange: EXCHANGES.DLX.name,
      deadLetterRoutingKey: 'events.audit.failed',
    },
  },

  // Dead Letter Queues
  DLQ_NOTIFICATIONS: {
    name: 'dlq.notifications',
    exchange: EXCHANGES.DLX.name,
    routingKey: 'notifications.*.failed',
    options: {
      durable: true,
      exclusive: false,
      autoDelete: false,
    },
  },
  DLQ_DOCUMENTS: {
    name: 'dlq.documents',
    exchange: EXCHANGES.DLX.name,
    routingKey: 'documents.*.failed',
    options: {
      durable: true,
      exclusive: false,
      autoDelete: false,
    },
  },
  DLQ_PAYROLL: {
    name: 'dlq.payroll',
    exchange: EXCHANGES.DLX.name,
    routingKey: 'payroll.*.failed',
    options: {
      durable: true,
      exclusive: false,
      autoDelete: false,
    },
  },
};

/**
 * Get RabbitMQ connection config from environment
 */
export function getRabbitMQConfig(): QueueConfig {
  return {
    host: process.env.RABBITMQ_HOST || 'localhost',
    port: parseInt(process.env.RABBITMQ_PORT || '5672'),
    username: process.env.RABBITMQ_USER || 'auraos',
    password: process.env.RABBITMQ_PASSWORD || 'auraos_dev',
    vhost: process.env.RABBITMQ_VHOST || '/auraos',
    heartbeat: 60,
    connectionTimeout: 10000,
  };
}
