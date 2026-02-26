/**
 * @aura/resilience
 * AuraOS Resilience Patterns
 *
 * Exports:
 *   - retryWithBackoff    — Exponential backoff retry with jitter
 *   - NonRetryableError   — Mark errors as non-retryable
 *   - Bulkhead            — Concurrent-operation limiter
 *   - createBulkhead      — Bulkhead factory
 *   - getBulkhead         — Registry-backed bulkhead lookup
 *   - IdempotencyManager  — At-most-once execution guard
 *   - getIdempotencyManager — Singleton accessor
 */

// Retry
export {
  retryWithBackoff,
  NonRetryableError,
} from './retry';

export type {
  RetryOptions,
  RetryResult,
} from './retry';

// Bulkhead
export {
  Bulkhead,
  createBulkhead,
  getBulkhead,
  clearBulkheadRegistry,
  BulkheadRejectedError,
} from './bulkhead';

export type {
  BulkheadOptions,
  BulkheadStats,
} from './bulkhead';

// Idempotency
export {
  IdempotencyManager,
  getIdempotencyManager,
  resetIdempotencyManager,
  IdempotencyConflictError,
} from './idempotency';

export type {
  IdempotencyRecord,
  IdempotencyOptions,
} from './idempotency';
