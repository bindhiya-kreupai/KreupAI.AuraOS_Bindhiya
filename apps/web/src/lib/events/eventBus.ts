type EventHandler<T = unknown> = (payload: T) => void | Promise<void>;

interface EventRecord {
  id: string;
  event: string;
  payload: unknown;
  timestamp: string;
  delivered: boolean;
  error: string | null;
}

interface DeadLetterEntry {
  id: string;
  event: string;
  payload: unknown;
  handler: string;
  error: string;
  timestamp: string;
  attemptCount: number;
  lastAttemptAt: string;
}

interface Subscription {
  id: string;
  event: string;
  handler: EventHandler;
  once: boolean;
}

function generateId(): string {
  const timePart = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return 'evt_' + timePart + '_' + randomPart;
}

function generateSubId(counter: number): string {
  const timePart = Date.now().toString(36);
  return 'sub_' + counter + '_' + timePart;
}

class EventBus {
  private subscriptions: Map<string, Subscription[]> = new Map();
  private eventHistory: EventRecord[] = [];
  deadLetterQueue: DeadLetterEntry[] = [];
  private maxHistorySize: number;
  private maxDeadLetterSize: number;
  private subscriptionIdCounter: number = 0;

  constructor(options?: { maxHistorySize?: number; maxDeadLetterSize?: number }) {
    this.maxHistorySize = options?.maxHistorySize || 1000;
    this.maxDeadLetterSize = options?.maxDeadLetterSize || 500;
  }

  /**
   * Publish an event with a payload to all subscribers.
   * Failed handler invocations are captured in the dead letter queue.
   */
  async publish<T = unknown>(event: string, payload: T): Promise<void> {
    const eventRecord: EventRecord = {
      id: generateId(),
      event,
      payload,
      timestamp: new Date().toISOString(),
      delivered: false,
      error: null,
    };

    const subscribers = this.subscriptions.get(event) || [];
    const wildcardSubscribers = this.subscriptions.get('*') || [];
    const allSubscribers = [...subscribers, ...wildcardSubscribers];

    if (allSubscribers.length === 0) {
      eventRecord.delivered = false;
      eventRecord.error = 'No subscribers registered for this event';
      this.persistEvent(eventRecord);
      return;
    }

    let allDelivered = true;

    for (const subscription of allSubscribers) {
      try {
        await subscription.handler(payload);
      } catch (err) {
        allDelivered = false;
        const errorMessage = err instanceof Error ? err.message : String(err);

        this.addToDeadLetterQueue({
          id: generateId(),
          event,
          payload,
          handler: subscription.id,
          error: errorMessage,
          timestamp: new Date().toISOString(),
          attemptCount: 1,
          lastAttemptAt: new Date().toISOString(),
        });
      }

      // Remove one-time subscriptions after execution
      if (subscription.once) {
        this.removeSubscription(event, subscription.id);
      }
    }

    eventRecord.delivered = allDelivered;
    if (!allDelivered) {
      eventRecord.error = 'One or more handlers failed - see dead letter queue';
    }

    this.persistEvent(eventRecord);
  }

  /**
   * Subscribe to an event with a handler function.
   * Returns a subscription ID that can be used to unsubscribe.
   */
  subscribe<T = unknown>(event: string, handler: EventHandler<T>): string {
    this.subscriptionIdCounter++;
    const subscriptionId = generateSubId(this.subscriptionIdCounter);

    const subscription: Subscription = {
      id: subscriptionId,
      event,
      handler: handler as EventHandler,
      once: false,
    };

    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, []);
    }

    this.subscriptions.get(event)!.push(subscription);

    return subscriptionId;
  }

  /**
   * Subscribe to an event, but only handle it once.
   * The subscription is automatically removed after the first invocation.
   */
  subscribeOnce<T = unknown>(event: string, handler: EventHandler<T>): string {
    this.subscriptionIdCounter++;
    const subscriptionId = generateSubId(this.subscriptionIdCounter);

    const subscription: Subscription = {
      id: subscriptionId,
      event,
      handler: handler as EventHandler,
      once: true,
    };

    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, []);
    }

    this.subscriptions.get(event)!.push(subscription);

    return subscriptionId;
  }

  /**
   * Unsubscribe a handler by subscription ID.
   * Returns true if the subscription was found and removed.
   */
  unsubscribe(subscriptionId: string): boolean {
    for (const [event, subscriptions] of this.subscriptions.entries()) {
      const index = subscriptions.findIndex((s) => s.id === subscriptionId);
      if (index !== -1) {
        subscriptions.splice(index, 1);
        if (subscriptions.length === 0) {
          this.subscriptions.delete(event);
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Unsubscribe all handlers for a given event.
   */
  unsubscribeAll(event?: string): void {
    if (event) {
      this.subscriptions.delete(event);
    } else {
      this.subscriptions.clear();
    }
  }

  /**
   * Persist an event record to the event history.
   * Automatically trims history if it exceeds maxHistorySize.
   */
  persistEvent(eventRecord: EventRecord): void {
    this.eventHistory.push(eventRecord);

    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Get the full event history, optionally filtered by event name.
   */
  getEventHistory(options?: {
    event?: string;
    limit?: number;
    offset?: number;
    deliveredOnly?: boolean;
  }): { records: EventRecord[]; total: number } {
    let records = [...this.eventHistory];

    if (options?.event) {
      records = records.filter((r) => r.event === options.event);
    }

    if (options?.deliveredOnly) {
      records = records.filter((r) => r.delivered);
    }

    const total = records.length;

    if (options?.offset) {
      records = records.slice(options.offset);
    }

    if (options?.limit) {
      records = records.slice(0, options.limit);
    }

    return { records, total };
  }

  /**
   * Get the dead letter queue entries.
   */
  getDeadLetterQueue(options?: {
    event?: string;
    limit?: number;
  }): DeadLetterEntry[] {
    let entries = [...this.deadLetterQueue];

    if (options?.event) {
      entries = entries.filter((e) => e.event === options.event);
    }

    if (options?.limit) {
      entries = entries.slice(0, options.limit);
    }

    return entries;
  }

  /**
   * Retry a dead letter queue entry by its ID.
   * Removes it from the DLQ if successful, updates attempt count otherwise.
   */
  async retryDeadLetter(entryId: string): Promise<boolean> {
    const entryIndex = this.deadLetterQueue.findIndex((e) => e.id === entryId);

    if (entryIndex === -1) {
      return false;
    }

    const entry = this.deadLetterQueue[entryIndex];

    try {
      await this.publish(entry.event, entry.payload);
      this.deadLetterQueue.splice(entryIndex, 1);
      return true;
    } catch {
      entry.attemptCount += 1;
      entry.lastAttemptAt = new Date().toISOString();
      return false;
    }
  }

  /**
   * Clear all entries from the dead letter queue.
   */
  clearDeadLetterQueue(): void {
    this.deadLetterQueue = [];
  }

  /**
   * Clear the event history.
   */
  clearEventHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Get the count of active subscriptions, optionally for a specific event.
   */
  getSubscriptionCount(event?: string): number {
    if (event) {
      return this.subscriptions.get(event)?.length || 0;
    }

    let count = 0;
    for (const subs of this.subscriptions.values()) {
      count += subs.length;
    }
    return count;
  }

  /**
   * Get all registered event names.
   */
  getRegisteredEvents(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  // -- Private helpers --

  private removeSubscription(event: string, subscriptionId: string): void {
    const subscriptions = this.subscriptions.get(event);
    if (!subscriptions) return;

    const index = subscriptions.findIndex((s) => s.id === subscriptionId);
    if (index !== -1) {
      subscriptions.splice(index, 1);
      if (subscriptions.length === 0) {
        this.subscriptions.delete(event);
      }
    }
  }

  private addToDeadLetterQueue(entry: DeadLetterEntry): void {
    this.deadLetterQueue.push(entry);

    if (this.deadLetterQueue.length > this.maxDeadLetterSize) {
      this.deadLetterQueue = this.deadLetterQueue.slice(-this.maxDeadLetterSize);
    }
  }
}

// Export a singleton instance for app-wide usage
export const eventBus = new EventBus();

// Export the class for custom instantiation
export { EventBus };

// Export types for external usage
export type { EventHandler, EventRecord, DeadLetterEntry, Subscription };
