/**
 * CircuitBreaker
 *
 * Implements the circuit breaker pattern to protect downstream services from
 * cascading failures.
 *
 * States:
 *   CLOSED    — Normal operation; all calls pass through.
 *   OPEN      — Too many failures; calls are rejected immediately.
 *   HALF_OPEN — Testing recovery; limited calls are allowed through.
 *
 * @module @aura/service-mesh
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  /** Number of consecutive failures before opening the circuit. Default: 5 */
  failureThreshold?: number;
  /** Milliseconds to wait in OPEN state before moving to HALF_OPEN. Default: 30000 */
  resetTimeout?: number;
  /** Maximum calls allowed through in HALF_OPEN state. Default: 3 */
  halfOpenMaxAttempts?: number;
  /** Name for logging/monitoring. */
  name?: string;
}

export interface CircuitStats {
  state: CircuitState;
  failures: number;
  successes: number;
  rejections: number;
  lastFailureTime: number | null;
  halfOpenAttempts: number;
}

export type CircuitEventType = 'open' | 'close' | 'half-open' | 'success' | 'failure' | 'rejected';

export type CircuitEventListener = (event: { type: CircuitEventType; stats: CircuitStats }) => void;

// ---------------------------------------------------------------------------
// CircuitBreaker
// ---------------------------------------------------------------------------

/**
 * CircuitBreaker
 *
 * Usage:
 *   const cb = new CircuitBreaker({ name: 'payroll-service', failureThreshold: 3 });
 *
 *   const result = await cb.execute(() => fetch('/api/payroll'));
 */
export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private successes = 0;
  private rejections = 0;
  private lastFailureTime: number | null = null;
  private halfOpenAttempts = 0;

  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private readonly halfOpenMaxAttempts: number;
  private readonly name: string;
  private readonly listeners: CircuitEventListener[] = [];

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold    = options.failureThreshold    ?? 5;
    this.resetTimeout        = options.resetTimeout        ?? 30_000;
    this.halfOpenMaxAttempts = options.halfOpenMaxAttempts ?? 3;
    this.name                = options.name                ?? 'circuit-breaker';
  }

  // -------------------------------------------------------------------------
  // Core execute
  // -------------------------------------------------------------------------

  /**
   * Execute a function wrapped with circuit breaker protection.
   * Throws `CircuitOpenError` when the circuit is OPEN.
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.transitionIfNeeded();

    if (this.state === 'OPEN') {
      this.rejections += 1;
      this.emit('rejected');
      throw new CircuitOpenError(
        `Circuit "${this.name}" is OPEN — rejecting request (resets in ${this.msUntilReset()}ms)`
      );
    }

    if (this.state === 'HALF_OPEN') {
      if (this.halfOpenAttempts >= this.halfOpenMaxAttempts) {
        this.rejections += 1;
        this.emit('rejected');
        throw new CircuitOpenError(
          `Circuit "${this.name}" HALF_OPEN probe limit reached`
        );
      }
      this.halfOpenAttempts += 1;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  // -------------------------------------------------------------------------
  // State management
  // -------------------------------------------------------------------------

  private onSuccess(): void {
    this.successes += 1;
    this.failures = 0;

    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.halfOpenAttempts = 0;
      console.info(`[CircuitBreaker:${this.name}] HALF_OPEN → CLOSED (recovery confirmed)`);
      this.emit('close');
    }
    this.emit('success');
  }

  private onFailure(): void {
    this.failures += 1;
    this.lastFailureTime = Date.now();
    this.emit('failure');

    if (this.state === 'HALF_OPEN') {
      // Probe failed — re-open immediately
      this.state = 'OPEN';
      this.halfOpenAttempts = 0;
      console.warn(`[CircuitBreaker:${this.name}] HALF_OPEN → OPEN (probe failed)`);
      this.emit('open');
      return;
    }

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      console.warn(
        `[CircuitBreaker:${this.name}] CLOSED → OPEN (${this.failures} consecutive failures)`
      );
      this.emit('open');
    }
  }

  private transitionIfNeeded(): void {
    if (
      this.state === 'OPEN' &&
      this.lastFailureTime !== null &&
      Date.now() - this.lastFailureTime >= this.resetTimeout
    ) {
      this.state = 'HALF_OPEN';
      this.halfOpenAttempts = 0;
      console.info(`[CircuitBreaker:${this.name}] OPEN → HALF_OPEN (testing recovery)`);
      this.emit('half-open');
    }
  }

  // -------------------------------------------------------------------------
  // Monitoring
  // -------------------------------------------------------------------------

  getState(): CircuitState {
    this.transitionIfNeeded();
    return this.state;
  }

  getStats(): CircuitStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      rejections: this.rejections,
      lastFailureTime: this.lastFailureTime,
      halfOpenAttempts: this.halfOpenAttempts,
    };
  }

  /** Force-reset the circuit to CLOSED state (e.g. after maintenance). */
  reset(): void {
    this.state = 'CLOSED';
    this.failures = 0;
    this.halfOpenAttempts = 0;
    this.lastFailureTime = null;
    this.emit('close');
  }

  // -------------------------------------------------------------------------
  // Event system
  // -------------------------------------------------------------------------

  on(listener: CircuitEventListener): void {
    this.listeners.push(listener);
  }

  off(listener: CircuitEventListener): void {
    const idx = this.listeners.indexOf(listener);
    if (idx !== -1) this.listeners.splice(idx, 1);
  }

  private emit(type: CircuitEventType): void {
    const stats = this.getStats();
    for (const listener of this.listeners) {
      try { listener({ type, stats }); } catch { /* ignore listener errors */ }
    }
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  private msUntilReset(): number {
    if (this.lastFailureTime === null) return 0;
    return Math.max(0, this.resetTimeout - (Date.now() - this.lastFailureTime));
  }
}

// ---------------------------------------------------------------------------
// CircuitOpenError
// ---------------------------------------------------------------------------

export class CircuitOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitOpenError';
  }
}
