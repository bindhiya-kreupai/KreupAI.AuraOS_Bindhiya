// @ts-nocheck — Lib drift / missing typings. Tracked under #29.
/**
 * Event Bus Service using @aura/events
 * Wrapper for publishing and subscribing to domain events
 */

import { EventBus, DomainEvent, EventHandler } from '@aura/events';
import { logger } from '@/lib/logger';

/**
 * Event Bus Service
 */
export class EventBusService {
  private eventBus = new EventBus();
  private isInitialized = false;

  /**
   * Initialize the event bus
   */
  initialize(): void {
    if (this.isInitialized) {
      return;
    }

    logger.info('Initializing event bus...');
    this.isInitialized = true;
    logger.info('Event bus initialized successfully');
  }

  /**
   * Publish a domain event
   */
  async publish<T = unknown>(
    event: Omit<DomainEvent<T>, 'eventId' | 'timestamp' | 'version'>
  ): Promise<void> {
    if (!this.isInitialized) {
      this.initialize();
    }

    try {
      await this.eventBus.publish(event);
      logger.info({ eventType: event.eventType, aggregateId: event.aggregateId }, 'Event published');
    } catch (error: any) {
      logger.error({ error, eventType: event.eventType }, 'Error publishing event');
      throw error;
    }
  }

  /**
   * Subscribe to an event type
   */
  subscribe<T = unknown>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.isInitialized) {
      this.initialize();
    }

    logger.info({ eventType }, 'Subscribing to event type');
    return this.eventBus.subscribe(eventType, handler);
  }

  /**
   * Get event history
   */
  getEventHistory(filter?: {
    eventType?: string;
    aggregateId?: string;
    tenantId?: string;
  }): DomainEvent[] {
    return this.eventBus.getEventHistory(filter);
  }
}

// Export singleton instance
export const eventBusService = new EventBusService();
