/**
 * Idempotency Guard
 *
 * Ensures that operations with the same idempotency key are executed at most
 * once, even when called concurrently. Deduplicates in-flight requests and
 * returns the cached result for subsequent calls within the TTL window.
 *
 * Production deployments should replace the in-memory Map with Redis to
 * support multiple service replicas.
 *
 * @module @aura/resilience
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IdempotencyRecord<T = unknown> {
  key: string;
  result: T;
  processedAt: string;
  expiresAt: string;
  status: 'completed' | 'failed';
  error?: string;
}

export interface IdempotencyOptions {
  /** Default TTL in seconds. Default: 86400 (24 hours) */
  defaultTtlSeconds?: number;
}

export class IdempotencyConflictError extends Error {
  constructor(key: string) {
    super(`Operation with key "${key}" is already in progress`);
    this.name = 'IdempotencyConflictError';
  }
}

// ---------------------------------------------------------------------------
// Internal storage
// ---------------------------------------------------------------------------

interface StorageEntry<T> {
  record: IdempotencyRecord<T>;
  expiresAt: number; // Unix timestamp ms
}

// ---------------------------------------------------------------------------
// IdempotencyManager
// ---------------------------------------------------------------------------

export class IdempotencyManager {
  private readonly _store: Map<string, StorageEntry<unknown>> = new Map();
  private readonly _inFlight: Map<string, Promise<unknown>> = new Map();
  private readonly _defaultTtlSeconds: number;

  constructor(options: IdempotencyOptions = {}) {
    this._defaultTtlSeconds = options.defaultTtlSeconds ?? 86_400;
  }

  // -------------------------------------------------------------------------
  // Check
  // -------------------------------------------------------------------------

  /**
   * Check if an operation with the given key has already been processed.
   *
   * @returns The stored result record, or null if not found / expired
   */
  checkIdempotency<T = unknown>(key: string): IdempotencyRecord<T> | null {
    this._evictExpired();
    const entry = this._store.get(key) as StorageEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this._store.delete(key);
      return null;
    }
    return entry.record;
  }

  // -------------------------------------------------------------------------
  // Mark processed
  // -------------------------------------------------------------------------

  /**
   * Store the result of a completed operation so subsequent calls can return
   * the cached response.
   *
   * @param key    Unique idempotency key
   * @param result The return value to cache
   * @param ttlSeconds TTL override; defaults to the manager's defaultTtlSeconds
   */
  markProcessed<T = unknown>(key: string, result: T, ttlSeconds?: number): IdempotencyRecord<T> {
    const ttl = (ttlSeconds ?? this._defaultTtlSeconds) * 1_000;
    const now = new Date();
    const expiresAt = new Date(Date.now() + ttl);

    const record: IdempotencyRecord<T> = {
      key,
      result,
      processedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'completed',
    };

    this._store.set(key, {
      record: record as IdempotencyRecord<unknown>,
      expiresAt: expiresAt.getTime(),
    });

    return record;
  }

  /**
   * Store a failed operation result (so callers can see the failure without
   * re-executing the operation).
   */
  markFailed(key: string, error: unknown, ttlSeconds?: number): void {
    const ttl = (ttlSeconds ?? this._defaultTtlSeconds) * 1_000;
    const now = new Date();
    const expiresAt = new Date(Date.now() + ttl);

    const record: IdempotencyRecord<null> = {
      key,
      result: null,
      processedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
    };

    this._store.set(key, {
      record: record as IdempotencyRecord<unknown>,
      expiresAt: expiresAt.getTime(),
    });
  }

  // -------------------------------------------------------------------------
  // Wrapper
  // -------------------------------------------------------------------------

  /**
   * Execute `fn` exactly once per idempotency key, deduplicating concurrent
   * calls and returning the cached result on repeated invocations.
   *
   * @example
   * const result = await idempotency.withIdempotency(
   *   `payroll-run-${runId}`,
   *   () => payrollService.finalize(runId)
   * );
   */
  async withIdempotency<T>(
    key: string,
    fn: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    // Return cached result if already processed
    const existing = this.checkIdempotency<T>(key);
    if (existing) {
      if (existing.status === 'failed') {
        throw new Error(existing.error ?? 'Previous execution failed');
      }
      return existing.result;
    }

    // Deduplicate concurrent in-flight calls with the same key
    const inFlight = this._inFlight.get(key) as Promise<T> | undefined;
    if (inFlight) {
      return inFlight;
    }

    const execution = (async (): Promise<T> => {
      try {
        const result = await fn();
        this.markProcessed(key, result, ttlSeconds);
        return result;
      } catch (error) {
        this.markFailed(key, error, ttlSeconds);
        throw error;
      } finally {
        this._inFlight.delete(key);
      }
    })();

    this._inFlight.set(key, execution as Promise<unknown>);
    return execution;
  }

  // -------------------------------------------------------------------------
  // Inspection
  // -------------------------------------------------------------------------

  /**
   * Return whether a key is currently being processed (in-flight).
   */
  isInFlight(key: string): boolean {
    return this._inFlight.has(key);
  }

  /**
   * Return the number of stored records (including expired, before eviction).
   */
  size(): number {
    return this._store.size;
  }

  /**
   * Manually delete a key (e.g. to allow a retry after a partial failure).
   */
  delete(key: string): boolean {
    return this._store.delete(key);
  }

  /**
   * Clear all records (useful in test teardown).
   */
  clear(): void {
    this._store.clear();
    this._inFlight.clear();
  }

  // -------------------------------------------------------------------------
  // Eviction
  // -------------------------------------------------------------------------

  private _evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this._store.entries()) {
      if (now > entry.expiresAt) {
        this._store.delete(key);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Singleton / factory
// ---------------------------------------------------------------------------

let managerInstance: IdempotencyManager | null = null;

export function getIdempotencyManager(options?: IdempotencyOptions): IdempotencyManager {
  if (!managerInstance) {
    managerInstance = new IdempotencyManager(options);
  }
  return managerInstance;
}

export function resetIdempotencyManager(): void {
  managerInstance = null;
}
