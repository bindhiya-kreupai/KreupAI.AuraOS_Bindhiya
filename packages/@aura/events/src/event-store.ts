/**
 * Event Store — Event Sourcing for Audit-Critical Aggregates
 *
 * Implements an append-only event store with optimistic concurrency control,
 * snapshot support, and aggregate rebuild capability.
 *
 * Production deployments should replace the in-memory Map with EventStoreDB
 * or a dedicated PostgreSQL event table.
 *
 * @module @aura/events
 */

import { randomUUID } from 'crypto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StoredEvent {
  /** Unique event ID */
  eventId: string;
  /** Stream (aggregate) identifier */
  streamId: string;
  /** Event type name */
  eventType: string;
  /** Monotonically increasing version within the stream */
  version: number;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Event payload */
  data: Record<string, unknown>;
  /** Additional metadata (user, IP, correlation, etc.) */
  metadata: EventMetadata;
  /** Tenant isolation key */
  tenantId: string;
}

export interface EventMetadata {
  correlationId?: string;
  causationId?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  [key: string]: unknown;
}

export interface AggregateSnapshot {
  snapshotId: string;
  streamId: string;
  version: number;
  timestamp: string;
  state: Record<string, unknown>;
  tenantId: string;
}

export interface AppendResult {
  streamId: string;
  fromVersion: number;
  toVersion: number;
  eventIds: string[];
}

export interface StreamSummary {
  streamId: string;
  eventCount: number;
  currentVersion: number;
  firstEventAt: string;
  lastEventAt: string;
  tenantId: string;
}

export interface StreamFilters {
  tenantId?: string;
  eventType?: string;
  fromTimestamp?: string;
  toTimestamp?: string;
  limit?: number;
  offset?: number;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class OptimisticConcurrencyError extends Error {
  constructor(
    public readonly streamId: string,
    public readonly expectedVersion: number,
    public readonly actualVersion: number
  ) {
    super(
      `Optimistic concurrency conflict on stream "${streamId}": ` +
      `expected version ${expectedVersion}, got ${actualVersion}`
    );
    this.name = 'OptimisticConcurrencyError';
  }
}

export class StreamNotFoundError extends Error {
  constructor(public readonly streamId: string) {
    super(`Stream "${streamId}" not found`);
    this.name = 'StreamNotFoundError';
  }
}

// ---------------------------------------------------------------------------
// Event Store
// ---------------------------------------------------------------------------

/**
 * In-memory event store implementation.
 *
 * All mutations are synchronous in this implementation to keep the API simple
 * for testing; the interface returns Promises so a persistent backend can be
 * swapped in without changing call sites.
 */
export class EventStore {
  /** streamId → ordered list of stored events */
  private streams: Map<string, StoredEvent[]> = new Map();

  /** streamId → latest snapshot */
  private snapshots: Map<string, AggregateSnapshot> = new Map();

  // -------------------------------------------------------------------------
  // Write path
  // -------------------------------------------------------------------------

  /**
   * Append one or more events to a stream with optimistic concurrency control.
   *
   * @param streamId       Target aggregate stream
   * @param events         Events to append (without version / eventId / timestamp)
   * @param expectedVersion The version the caller last saw; -1 means "stream must not exist"
   * @returns              Append result with assigned version range
   * @throws OptimisticConcurrencyError if the current version does not match
   */
  async append(
    streamId: string,
    events: Array<Omit<StoredEvent, 'eventId' | 'version' | 'timestamp' | 'streamId'>>,
    expectedVersion: number
  ): Promise<AppendResult> {
    const existing = this.streams.get(streamId) ?? [];
    const currentVersion = existing.length === 0 ? -1 : existing[existing.length - 1].version;

    if (currentVersion !== expectedVersion) {
      throw new OptimisticConcurrencyError(streamId, expectedVersion, currentVersion);
    }

    const eventIds: string[] = [];
    const now = new Date().toISOString();
    let version = currentVersion;

    const newEvents: StoredEvent[] = events.map((e) => {
      version += 1;
      const eventId = randomUUID();
      eventIds.push(eventId);
      return {
        ...e,
        eventId,
        streamId,
        version,
        timestamp: now,
      };
    });

    this.streams.set(streamId, [...existing, ...newEvents]);

    return {
      streamId,
      fromVersion: currentVersion + 1,
      toVersion: version,
      eventIds,
    };
  }

  // -------------------------------------------------------------------------
  // Read path
  // -------------------------------------------------------------------------

  /**
   * Read all events from a stream, optionally starting from a specific version.
   *
   * @param streamId    Target stream
   * @param fromVersion Start from this version (inclusive); defaults to 0
   * @throws StreamNotFoundError if the stream does not exist
   */
  async getStream(streamId: string, fromVersion = 0): Promise<StoredEvent[]> {
    const events = this.streams.get(streamId);
    if (!events) {
      throw new StreamNotFoundError(streamId);
    }
    return events.filter((e) => e.version >= fromVersion);
  }

  /**
   * Check whether a stream exists (does not throw).
   */
  async streamExists(streamId: string): Promise<boolean> {
    return this.streams.has(streamId);
  }

  // -------------------------------------------------------------------------
  // Snapshot management
  // -------------------------------------------------------------------------

  /**
   * Retrieve the latest snapshot for a stream, if one exists.
   */
  async getSnapshot(streamId: string): Promise<AggregateSnapshot | null> {
    return this.snapshots.get(streamId) ?? null;
  }

  /**
   * Save (or overwrite) a snapshot for a stream.
   */
  async createSnapshot(streamId: string, snapshot: Omit<AggregateSnapshot, 'snapshotId' | 'timestamp'>): Promise<AggregateSnapshot> {
    const stored: AggregateSnapshot = {
      ...snapshot,
      snapshotId: randomUUID(),
      timestamp: new Date().toISOString(),
    };
    this.snapshots.set(streamId, stored);
    return stored;
  }

  // -------------------------------------------------------------------------
  // Stream catalog
  // -------------------------------------------------------------------------

  /**
   * List all known streams with optional filters and pagination.
   */
  async getAllStreams(filters: StreamFilters = {}): Promise<{ streams: StreamSummary[]; total: number }> {
    const summaries: StreamSummary[] = [];

    for (const [streamId, events] of this.streams.entries()) {
      if (events.length === 0) continue;

      const first = events[0];
      const last = events[events.length - 1];

      if (filters.tenantId && first.tenantId !== filters.tenantId) continue;
      if (filters.eventType && !events.some((e) => e.eventType === filters.eventType)) continue;
      if (filters.fromTimestamp && last.timestamp < filters.fromTimestamp) continue;
      if (filters.toTimestamp && first.timestamp > filters.toTimestamp) continue;

      summaries.push({
        streamId,
        eventCount: events.length,
        currentVersion: last.version,
        firstEventAt: first.timestamp,
        lastEventAt: last.timestamp,
        tenantId: first.tenantId,
      });
    }

    const total = summaries.length;
    const offset = filters.offset ?? 0;
    const limit = filters.limit ?? 100;

    return {
      streams: summaries.slice(offset, offset + limit),
      total,
    };
  }

  // -------------------------------------------------------------------------
  // Aggregate rebuild
  // -------------------------------------------------------------------------

  /**
   * Rebuild an aggregate's state by replaying all events from a stream.
   *
   * Uses a snapshot as the starting point if one is available, replaying only
   * the events that occurred after the snapshot was taken.
   *
   * @returns The rebuilt state object (shape depends on the aggregate type)
   */
  async rebuild(streamId: string): Promise<{
    state: Record<string, unknown>;
    version: number;
    snapshotUsed: boolean;
  }> {
    const snapshot = await this.getSnapshot(streamId);
    const fromVersion = snapshot ? snapshot.version + 1 : 0;
    const events = await this.getStream(streamId, fromVersion);

    let state: Record<string, unknown> = snapshot ? { ...snapshot.state } : {};

    for (const event of events) {
      state = applyEvent(state, event);
    }

    const allEvents = this.streams.get(streamId) ?? [];
    const currentVersion = allEvents.length > 0 ? allEvents[allEvents.length - 1].version : -1;

    return {
      state,
      version: currentVersion,
      snapshotUsed: snapshot !== null,
    };
  }

  // -------------------------------------------------------------------------
  // Diagnostics
  // -------------------------------------------------------------------------

  /**
   * Return the total number of events across all streams.
   */
  getTotalEventCount(): number {
    let total = 0;
    for (const events of this.streams.values()) {
      total += events.length;
    }
    return total;
  }

  /**
   * Purge all data (useful in test teardown).
   */
  clear(): void {
    this.streams.clear();
    this.snapshots.clear();
  }
}

// ---------------------------------------------------------------------------
// Default event application logic (generic fold)
// ---------------------------------------------------------------------------

/**
 * Generic event application: merges `data` into the current state and tracks
 * a `_meta` field with the last-applied event information.
 *
 * Domain-specific aggregates should override this by passing a custom reducer
 * to a future `rebuildWith(streamId, reducer)` variant.
 */
function applyEvent(
  state: Record<string, unknown>,
  event: StoredEvent
): Record<string, unknown> {
  return {
    ...state,
    ...event.data,
    _meta: {
      lastEventId: event.eventId,
      lastEventType: event.eventType,
      lastEventAt: event.timestamp,
      version: event.version,
    },
  };
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let storeInstance: EventStore | null = null;

export function getEventStore(): EventStore {
  if (!storeInstance) {
    storeInstance = new EventStore();
  }
  return storeInstance;
}

export function resetEventStore(): void {
  storeInstance = null;
}
