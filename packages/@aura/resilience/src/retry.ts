/**
 * Retry with Exponential Backoff & Jitter
 *
 * Provides reliable retry semantics for transient failures (network timeouts,
 * rate limits, temporarily unavailable services) while fast-failing on
 * non-retryable errors (auth failures, validation errors, not found).
 *
 * @module @aura/resilience
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RetryOptions {
  /** Maximum number of attempts (including the first). Default: 3 */
  maxRetries?: number;
  /** Base delay in milliseconds before exponential growth. Default: 1000 */
  baseDelay?: number;
  /** Maximum delay cap in milliseconds. Default: 30000 */
  maxDelay?: number;
  /** Add random jitter to prevent thundering-herd. Default: true */
  jitter?: boolean;
  /** Custom predicate deciding if an error is retryable. */
  isRetryable?: (error: unknown) => boolean;
  /** Called before each retry attempt (useful for logging). */
  onRetry?: (error: unknown, attempt: number, delay: number) => void;
}

export interface RetryResult<T> {
  value: T;
  attempts: number;
  totalDurationMs: number;
}

// ---------------------------------------------------------------------------
// Non-retryable error classes
// ---------------------------------------------------------------------------

/**
 * Wrap an error to mark it as non-retryable.
 * retryWithBackoff will rethrow immediately without further attempts.
 */
export class NonRetryableError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'NonRetryableError';
  }
}

// ---------------------------------------------------------------------------
// Default retryable-error classification
// ---------------------------------------------------------------------------

const RETRYABLE_MESSAGES: RegExp[] = [
  /connection\s*(reset|refused|timeout)/i,
  /ECONNRESET/,
  /ETIMEDOUT/,
  /ECONNREFUSED/,
  /socket hang up/i,
  /rate[\s-]?limit/i,
  /too many requests/i,
  /service\s*unavailable/i,
  /temporarily\s*unavailable/i,
  /503/,
  /429/,
  /upstream\s*timeout/i,
  /gateway\s*timeout/i,
];

const NON_RETRYABLE_MESSAGES: RegExp[] = [
  /unauthorized/i,
  /forbidden/i,
  /not\s*found/i,
  /bad\s*request/i,
  /validation/i,
  /invalid\s*(input|parameter|argument)/i,
  /authentication/i,
  /permission/i,
  /404/,
  /401/,
  /403/,
  /400/,
  /422/,
];

function defaultIsRetryable(error: unknown): boolean {
  if (error instanceof NonRetryableError) return false;

  const message = error instanceof Error
    ? `${error.message} ${(error as NodeJS.ErrnoException).code ?? ''}`
    : String(error);

  // Explicit non-retryable check first
  if (NON_RETRYABLE_MESSAGES.some((re) => re.test(message))) return false;

  // Then check for known retryable patterns
  if (RETRYABLE_MESSAGES.some((re) => re.test(message))) return true;

  // HTTP status code check (duck-typed)
  const status = (error as { status?: number; statusCode?: number }).status
    ?? (error as { status?: number; statusCode?: number }).statusCode;

  if (typeof status === 'number') {
    return status >= 500 || status === 429;
  }

  // Default: retry unknown errors
  return true;
}

// ---------------------------------------------------------------------------
// Backoff calculation
// ---------------------------------------------------------------------------

function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  // Exponential backoff: base * 2^attempt
  const exponential = Math.min(
    options.baseDelay * Math.pow(2, attempt),
    options.maxDelay
  );

  if (!options.jitter) return exponential;

  // Full jitter: uniform random in [0, exponential]
  return Math.floor(Math.random() * exponential);
}

// ---------------------------------------------------------------------------
// Core retry function
// ---------------------------------------------------------------------------

/**
 * Execute `fn` with automatic retry on transient failures.
 *
 * @example
 * const result = await retryWithBackoff(
 *   () => fetch('https://api.example.com/data'),
 *   { maxRetries: 5, baseDelay: 500 }
 * );
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const opts: Required<RetryOptions> = {
    maxRetries: options.maxRetries ?? 3,
    baseDelay: options.baseDelay ?? 1000,
    maxDelay: options.maxDelay ?? 30_000,
    jitter: options.jitter ?? true,
    isRetryable: options.isRetryable ?? defaultIsRetryable,
    onRetry: options.onRetry ?? (() => undefined),
  };

  const startTime = Date.now();
  let lastError: unknown;

  for (let attempt = 0; attempt < opts.maxRetries; attempt++) {
    try {
      const value = await fn();
      return {
        value,
        attempts: attempt + 1,
        totalDurationMs: Date.now() - startTime,
      };
    } catch (error) {
      lastError = error;

      // Do not retry if this is the last attempt
      if (attempt >= opts.maxRetries - 1) break;

      // Do not retry non-retryable errors
      if (!opts.isRetryable(error)) {
        throw error;
      }

      const delay = calculateDelay(attempt, opts);
      opts.onRetry(error, attempt + 1, delay);

      await sleep(delay);
    }
  }

  throw lastError;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
