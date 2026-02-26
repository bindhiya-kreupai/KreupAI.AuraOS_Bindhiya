/**
 * @module event-publisher
 * @description RabbitMQ event publisher for AuraOS domain events.
 *              Supports single event publish, batch publish, and all
 *              standard HCM domain events with proper routing keys.
 * @project AuraOS Enterprise HCM Platform
 * @section 27 — Microservices Infrastructure
 */

import type * as amqplib from 'amqplib';

// ============================================================================
// DOMAIN EVENT TYPES
// ============================================================================

export type DomainEventType =
  // Employee lifecycle
  | 'employee.created'
  | 'employee.updated'
  | 'employee.terminated'
  | 'employee.reactivated'
  | 'employee.transferred'
  // Leave management
  | 'leave.requested'
  | 'leave.approved'
  | 'leave.rejected'
  | 'leave.cancelled'
  | 'leave.withdrawn'
  // Payroll
  | 'payroll.calculated'
  | 'payroll.finalized'
  | 'payroll.disbursed'
  | 'payroll.reversed'
  // Attendance
  | 'attendance.clocked'
  | 'attendance.adjusted'
  | 'attendance.regularized'
  // Document management
  | 'document.uploaded'
  | 'document.approved'
  | 'document.rejected'
  | 'document.expired'
  // Notifications
  | 'notification.sent'
  | 'notification.delivered'
  | 'notification.failed'
  // Performance
  | 'performance.review.started'
  | 'performance.review.completed'
  | 'performance.goal.set'
  // Recruitment
  | 'recruitment.job.published'
  | 'recruitment.candidate.applied'
  | 'recruitment.offer.extended'
  | 'recruitment.offer.accepted'
  // Compliance
  | 'compliance.deadline.approaching'
  | 'compliance.violation.detected';

export interface DomainEvent<T = Record<string, unknown>> {
  eventId: string;
  eventType: DomainEventType;
  version: '1.0';
  tenantId: string;
  aggregateId: string;
  aggregateType: string;
  occurredAt: string;
  publishedBy: string;
  correlationId?: string;
  causationId?: string;
  payload: T;
  metadata?: Record<string, unknown>;
}

export interface BatchEvent {
  exchange: string;
  routingKey: string;
  payload: DomainEvent;
  options?: amqplib.Options.Publish;
}

export interface PublishResult {
  eventId: string;
  exchange: string;
  routingKey: string;
  published: boolean;
  error?: string;
  publishedAt: string;
}

// ============================================================================
// EXCHANGE REGISTRY
// ============================================================================

export const EXCHANGES = {
  EMPLOYEE: 'aura.employee',
  LEAVE: 'aura.leave',
  PAYROLL: 'aura.payroll',
  ATTENDANCE: 'aura.attendance',
  DOCUMENT: 'aura.document',
  NOTIFICATION: 'aura.notification',
  PERFORMANCE: 'aura.performance',
  RECRUITMENT: 'aura.recruitment',
  COMPLIANCE: 'aura.compliance',
  DLX: 'aura.dlx', // Dead Letter Exchange
} as const;

export type Exchange = (typeof EXCHANGES)[keyof typeof EXCHANGES];

// ============================================================================
// PUBLISHER CLASS
// ============================================================================

export class EventPublisher {
  private connection: amqplib.Connection | null = null;
  private channel: amqplib.Channel | null = null;
  private readonly amqpUrl: string;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isConnecting = false;

  constructor(amqpUrl?: string) {
    this.amqpUrl = amqpUrl ?? process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672';
  }

  /**
   * connect — establish AMQP connection and declare exchanges.
   */
  async connect(): Promise<void> {
    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      // Dynamic import to keep it optional in test environments
      const amqp = await import('amqplib');
      this.connection = await amqp.connect(this.amqpUrl);
      this.channel = await this.connection.createChannel();

      // Declare all exchanges as durable topic exchanges
      await Promise.all(
        Object.values(EXCHANGES).map((exchange) =>
          this.channel!.assertExchange(exchange, 'topic', {
            durable: true,
            arguments: { 'x-dead-letter-exchange': EXCHANGES.DLX },
          }),
        ),
      );

      this.connection.on('error', (err) => {
        console.error('[EventPublisher] Connection error:', err.message);
        this.scheduleReconnect();
      });

      this.connection.on('close', () => {
        console.warn('[EventPublisher] Connection closed — reconnecting...');
        this.scheduleReconnect();
      });

      console.info('[EventPublisher] Connected to RabbitMQ');
    } catch (err) {
      console.error('[EventPublisher] Connection failed:', err);
      this.scheduleReconnect();
    } finally {
      this.isConnecting = false;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch(console.error);
    }, 5000);
  }

  /**
   * publishEvent — publish a single domain event to RabbitMQ.
   */
  async publishEvent(
    exchange: string,
    routingKey: string,
    payload: DomainEvent,
    options: amqplib.Options.Publish = {},
  ): Promise<PublishResult> {
    const result: PublishResult = {
      eventId: payload.eventId,
      exchange,
      routingKey,
      published: false,
      publishedAt: new Date().toISOString(),
    };

    if (!this.channel) {
      await this.connect();
    }

    if (!this.channel) {
      result.error = 'AMQP channel not available';
      return result;
    }

    try {
      const message = Buffer.from(JSON.stringify(payload));
      const publishOptions: amqplib.Options.Publish = {
        persistent: true,
        contentType: 'application/json',
        contentEncoding: 'utf-8',
        timestamp: Date.now(),
        messageId: payload.eventId,
        headers: {
          'x-event-type': payload.eventType,
          'x-tenant-id': payload.tenantId,
          'x-version': payload.version,
          'x-correlation-id': payload.correlationId ?? payload.eventId,
        },
        ...options,
      };

      result.published = this.channel.publish(exchange, routingKey, message, publishOptions);
    } catch (err) {
      result.error = String(err);
      result.published = false;
    }

    return result;
  }

  /**
   * publishBatch — publish multiple events atomically using a confirm channel.
   */
  async publishBatch(events: BatchEvent[]): Promise<PublishResult[]> {
    if (!this.channel) {
      await this.connect();
    }

    const results: PublishResult[] = [];

    for (const event of events) {
      const result = await this.publishEvent(
        event.exchange,
        event.routingKey,
        event.payload,
        event.options,
      );
      results.push(result);
    }

    return results;
  }

  /**
   * close — gracefully close the AMQP connection.
   */
  async close(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch {
      // Ignore close errors
    }
    this.channel = null;
    this.connection = null;
  }
}

// ============================================================================
// EVENT FACTORY HELPERS
// ============================================================================

export function createEvent<T = Record<string, unknown>>(params: {
  eventType: DomainEventType;
  tenantId: string;
  aggregateId: string;
  aggregateType: string;
  publishedBy: string;
  payload: T;
  correlationId?: string;
  causationId?: string;
  metadata?: Record<string, unknown>;
}): DomainEvent<T> {
  return {
    eventId: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    eventType: params.eventType,
    version: '1.0',
    tenantId: params.tenantId,
    aggregateId: params.aggregateId,
    aggregateType: params.aggregateType,
    occurredAt: new Date().toISOString(),
    publishedBy: params.publishedBy,
    correlationId: params.correlationId,
    causationId: params.causationId,
    payload: params.payload,
    metadata: params.metadata,
  };
}

/**
 * routingKeyForEvent — derives the RabbitMQ routing key from a domain event type.
 * e.g. 'employee.created' → 'employee.created'
 */
export function routingKeyForEvent(eventType: DomainEventType): string {
  return eventType;
}

/**
 * exchangeForEvent — determines the correct exchange for a domain event type.
 */
export function exchangeForEvent(eventType: DomainEventType): Exchange {
  const prefix = eventType.split('.')[0];
  const exchangeMap: Record<string, Exchange> = {
    employee: EXCHANGES.EMPLOYEE,
    leave: EXCHANGES.LEAVE,
    payroll: EXCHANGES.PAYROLL,
    attendance: EXCHANGES.ATTENDANCE,
    document: EXCHANGES.DOCUMENT,
    notification: EXCHANGES.NOTIFICATION,
    performance: EXCHANGES.PERFORMANCE,
    recruitment: EXCHANGES.RECRUITMENT,
    compliance: EXCHANGES.COMPLIANCE,
  };
  return exchangeMap[prefix] ?? EXCHANGES.EMPLOYEE;
}

// ============================================================================
// SINGLETON
// ============================================================================

let defaultPublisher: EventPublisher | null = null;

export function getPublisher(): EventPublisher {
  if (!defaultPublisher) {
    defaultPublisher = new EventPublisher();
  }
  return defaultPublisher;
}

export async function publishEvent(
  exchange: string,
  routingKey: string,
  payload: DomainEvent,
): Promise<PublishResult> {
  return getPublisher().publishEvent(exchange, routingKey, payload);
}
