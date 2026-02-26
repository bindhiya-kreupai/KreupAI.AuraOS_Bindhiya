/**
 * Bulkhead Pattern
 *
 * Limits the number of concurrent operations to a resource (service call, DB
 * connection, external API) to prevent cascading failures caused by resource
 * exhaustion.
 *
 * @module @aura/resilience
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BulkheadOptions {
  /** Maximum number of concurrent executions. Default: 10 */
  maxConcurrent?: number;
  /** Maximum number of requests allowed to queue. Default: 50 */
  maxQueue?: number;
  /** Milliseconds a queued request will wait before being rejected. Default: 5000 */
  queueTimeout?: number;
}

export interface BulkheadStats {
  name: string;
  active: number;
  queued: number;
  rejected: number;
  completed: number;
  failed: number;
}

export class BulkheadRejectedError extends Error {
  constructor(name: string, reason: 'queue_full' | 'queue_timeout') {
    super(
      reason === 'queue_full'
        ? `Bulkhead "${name}" queue is full`
        : `Bulkhead "${name}" queue timeout exceeded`
    );
    this.name = 'BulkheadRejectedError';
  }
}

// ---------------------------------------------------------------------------
// Internal queue entry
// ---------------------------------------------------------------------------

interface QueueEntry<T> {
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
  fn: () => Promise<T>;
  timeoutHandle: ReturnType<typeof setTimeout>;
}

// ---------------------------------------------------------------------------
// Bulkhead implementation
// ---------------------------------------------------------------------------

export class Bulkhead {
  private readonly _name: string;
  private readonly _maxConcurrent: number;
  private readonly _maxQueue: number;
  private readonly _queueTimeout: number;

  private _active = 0;
  private _rejected = 0;
  private _completed = 0;
  private _failed = 0;

  private _queue: Array<QueueEntry<unknown>> = [];

  constructor(name: string, options: BulkheadOptions = {}) {
    this._name = name;
    this._maxConcurrent = options.maxConcurrent ?? 10;
    this._maxQueue = options.maxQueue ?? 50;
    this._queueTimeout = options.queueTimeout ?? 5_000;
  }

  // -------------------------------------------------------------------------
  // Execute
  // -------------------------------------------------------------------------

  /**
   * Run `fn` within the bulkhead. If the concurrency limit is reached, the
   * request is queued; if the queue is also full it is rejected immediately.
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this._active < this._maxConcurrent) {
      return this._run(fn);
    }

    if (this._queue.length >= this._maxQueue) {
      this._rejected++;
      throw new BulkheadRejectedError(this._name, 'queue_full');
    }

    // Queue the request
    return new Promise<T>((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        // Remove from queue
        const idx = this._queue.findIndex((e) => e.timeoutHandle === timeoutHandle);
        if (idx !== -1) this._queue.splice(idx, 1);

        this._rejected++;
        reject(new BulkheadRejectedError(this._name, 'queue_timeout'));
      }, this._queueTimeout);

      this._queue.push({
        resolve: resolve as (value: unknown) => void,
        reject,
        fn: fn as () => Promise<unknown>,
        timeoutHandle,
      });
    });
  }

  // -------------------------------------------------------------------------
  // Stats
  // -------------------------------------------------------------------------

  getStats(): BulkheadStats {
    return {
      name: this._name,
      active: this._active,
      queued: this._queue.length,
      rejected: this._rejected,
      completed: this._completed,
      failed: this._failed,
    };
  }

  // -------------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------------

  private async _run<T>(fn: () => Promise<T>): Promise<T> {
    this._active++;
    try {
      const result = await fn();
      this._completed++;
      return result;
    } catch (error) {
      this._failed++;
      throw error;
    } finally {
      this._active--;
      this._drainQueue();
    }
  }

  private _drainQueue(): void {
    if (this._queue.length === 0) return;
    if (this._active >= this._maxConcurrent) return;

    const entry = this._queue.shift();
    if (!entry) return;

    clearTimeout(entry.timeoutHandle);

    // Start the queued task without awaiting to avoid blocking
    this._run(entry.fn)
      .then(entry.resolve)
      .catch(entry.reject);
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create and return a named Bulkhead instance.
 *
 * @example
 * const hrServiceBulkhead = createBulkhead('hr-service', { maxConcurrent: 20 });
 * const result = await hrServiceBulkhead.execute(() => hrService.getEmployee(id));
 */
export function createBulkhead(name: string, options: BulkheadOptions = {}): Bulkhead {
  return new Bulkhead(name, options);
}

// ---------------------------------------------------------------------------
// Registry (optional singleton map for reuse by name)
// ---------------------------------------------------------------------------

const bulkheadRegistry = new Map<string, Bulkhead>();

export function getBulkhead(name: string, options?: BulkheadOptions): Bulkhead {
  if (!bulkheadRegistry.has(name)) {
    bulkheadRegistry.set(name, createBulkhead(name, options));
  }
  return bulkheadRegistry.get(name)!;
}

export function clearBulkheadRegistry(): void {
  bulkheadRegistry.clear();
}
