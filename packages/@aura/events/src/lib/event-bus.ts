/**
 * Event Bus for Domain-Driven Design
 * Implements domain events pattern for AuraOS
 *
 * @module @aura/events
 */

import { randomUUID } from 'crypto';

export interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  tenantId: string;
  userId?: string;
  timestamp: Date;
  version: number;
  payload: unknown;
  metadata: {
    correlationId?: string;
    causationId?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

export type EventHandler<T = unknown> = (event: DomainEvent<T>) => Promise<void> | void;

export interface DomainEvent<T = unknown> extends Omit<DomainEvent, 'payload'> {
  payload: T;
}

/**
 * Event Bus - Pub/Sub for domain events
 */
export class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private eventStore: DomainEvent[] = [];
  private maxStoreSize = 10000;

  /**
   * Subscribe to an event type
   */
  subscribe<T = unknown>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    this.handlers.get(eventType)!.add(handler as EventHandler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler as EventHandler);
    };
  }

  /**
   * Publish an event
   */
  async publish<T = unknown>(event: Omit<DomainEvent<T>, 'eventId' | 'timestamp' | 'version'>): Promise<void> {
    const fullEvent: DomainEvent<T> = {
      ...event,
      eventId: randomUUID(),
      timestamp: new Date(),
      version: 1,
    } as DomainEvent<T>;

    // Store event
    this.storeEvent(fullEvent);

    // Get handlers for this event type
    const handlers = this.handlers.get(event.eventType);

    if (!handlers || handlers.size === 0) {
      console.warn(`No handlers registered for event type: ${event.eventType}`);
      return;
    }

    // Execute all handlers
    const promises = Array.from(handlers).map(async (handler) => {
      try {
        await handler(fullEvent);
      } catch (error) {
        console.error(`Error in event handler for ${event.eventType}:`, error);
        // Don't throw - we don't want one handler failure to stop others
      }
    });

    await Promise.all(promises);
  }

  /**
   * Store event in memory (in production, use event store database)
   */
  private storeEvent(event: DomainEvent): void {
    this.eventStore.push(event);

    // Keep store size under limit
    if (this.eventStore.length > this.maxStoreSize) {
      this.eventStore.shift();
    }
  }

  /**
   * Get events for an aggregate
   */
  getAggregateEvents(aggregateId: string, aggregateType: string): DomainEvent[] {
    return this.eventStore.filter(
      (e) => e.aggregateId === aggregateId && e.aggregateType === aggregateType
    );
  }

  /**
   * Get events by type
   */
  getEventsByType(eventType: string): DomainEvent[] {
    return this.eventStore.filter((e) => e.eventType === eventType);
  }

  /**
   * Get events for a tenant
   */
  getTenantEvents(tenantId: string, limit?: number): DomainEvent[] {
    const events = this.eventStore.filter((e) => e.tenantId === tenantId);
    return limit ? events.slice(-limit) : events;
  }

  /**
   * Clear all handlers and events
   */
  clear(): void {
    this.handlers.clear();
    this.eventStore = [];
  }
}

// Singleton instance
let eventBusInstance: EventBus | null = null;

export function getEventBus(): EventBus {
  if (!eventBusInstance) {
    eventBusInstance = new EventBus();
  }
  return eventBusInstance;
}
