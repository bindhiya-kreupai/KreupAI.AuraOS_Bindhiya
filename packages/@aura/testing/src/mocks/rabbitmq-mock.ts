/**
 * In-Memory RabbitMQ Mock
 *
 * Implements the RabbitMQEventBus interface in-memory for unit tests.
 * Subscriptions are stored and messages are delivered synchronously.
 *
 * @module @aura/testing
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MockMessage<T = unknown> {
  exchange: string;
  routingKey: string;
  payload: T;
  correlationId: string;
  messageId: string;
  timestamp: Date;
}

export type MockMessageHandler<T = unknown> = (
  payload: T,
  metadata: { correlationId?: string; messageId: string; timestamp: Date; routingKey: string }
) => Promise<void> | void;

interface Subscription {
  exchange: string;
  routingKey: string;
  queue: string;
  handler: MockMessageHandler;
}

// ---------------------------------------------------------------------------
// InMemoryRabbitMQMock
// ---------------------------------------------------------------------------

export class InMemoryRabbitMQMock {
  private subscriptions: Subscription[] = [];
  private publishedMessages: MockMessage[] = [];
  private exchanges = new Set<string>();
  private queues = new Set<string>();
  private connected = false;

  // -------------------------------------------------------------------------
  // Connection
  // -------------------------------------------------------------------------

  async connect(): Promise<void> {
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  // -------------------------------------------------------------------------
  // Exchange / Queue management (no-ops in mock)
  // -------------------------------------------------------------------------

  async createExchange(name: string, _type: string, _options?: unknown): Promise<void> {
    this.exchanges.add(name);
  }

  async createQueue(name: string, _options?: unknown): Promise<string> {
    this.queues.add(name);
    return name;
  }

  // -------------------------------------------------------------------------
  // Publish
  // -------------------------------------------------------------------------

  async publish<T = unknown>(
    exchange: string,
    routingKey: string,
    payload: T,
    options: { correlationId?: string; persistent?: boolean } = {}
  ): Promise<void> {
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const correlationId = options.correlationId ?? messageId;

    const message: MockMessage<T> = {
      exchange,
      routingKey,
      payload,
      correlationId,
      messageId,
      timestamp: new Date(),
    };

    this.publishedMessages.push(message as MockMessage);

    // Deliver to matching subscriptions synchronously
    const matching = this.subscriptions.filter(
      (sub) => sub.exchange === exchange && this.routingKeyMatches(sub.routingKey, routingKey)
    );

    for (const sub of matching) {
      await sub.handler(payload, {
        correlationId,
        messageId,
        timestamp: message.timestamp,
        routingKey,
      });
    }
  }

  // -------------------------------------------------------------------------
  // Subscribe
  // -------------------------------------------------------------------------

  async subscribe<T = unknown>(
    exchange: string,
    routingKey: string,
    queue: string,
    handler: MockMessageHandler<T>
  ): Promise<void> {
    this.subscriptions.push({
      exchange,
      routingKey,
      queue,
      handler: handler as MockMessageHandler,
    });
  }

  // -------------------------------------------------------------------------
  // Test helpers
  // -------------------------------------------------------------------------

  /** Get all published messages (for test assertions) */
  getPublishedMessages(): MockMessage[] {
    return [...this.publishedMessages];
  }

  /** Get messages published to a specific exchange and routing key */
  getMessages(exchange: string, routingKey?: string): MockMessage[] {
    return this.publishedMessages.filter(
      (m) =>
        m.exchange === exchange &&
        (routingKey === undefined || m.routingKey === routingKey)
    );
  }

  /** Return the number of published messages */
  messageCount(): number {
    return this.publishedMessages.length;
  }

  /** Clear all published messages (call in beforeEach) */
  clearMessages(): void {
    this.publishedMessages = [];
  }

  /** Clear all subscriptions */
  clearSubscriptions(): void {
    this.subscriptions = [];
  }

  /** Reset all state */
  reset(): void {
    this.publishedMessages = [];
    this.subscriptions = [];
    this.exchanges.clear();
    this.queues.clear();
    this.connected = false;
  }

  // -------------------------------------------------------------------------
  // Internal
  // -------------------------------------------------------------------------

  /**
   * Topic exchange routing key pattern matching.
   * `#` matches zero or more words, `*` matches exactly one word.
   */
  private routingKeyMatches(pattern: string, key: string): boolean {
    // Direct match
    if (pattern === key) return true;

    const patternParts = pattern.split('.');
    const keyParts = key.split('.');

    const match = (pi: number, ki: number): boolean => {
      if (pi === patternParts.length && ki === keyParts.length) return true;
      if (pi === patternParts.length) return false;

      if (patternParts[pi] === '#') {
        // # can match 0 or more segments
        for (let j = ki; j <= keyParts.length; j++) {
          if (match(pi + 1, j)) return true;
        }
        return false;
      }

      if (ki === keyParts.length) return false;

      if (patternParts[pi] === '*' || patternParts[pi] === keyParts[ki]) {
        return match(pi + 1, ki + 1);
      }

      return false;
    };

    return match(0, 0);
  }
}
