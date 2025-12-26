/**
 * Circuit Breaker Pattern Implementation
 *
 * Prevents cascading failures by failing fast when external services
 * are unavailable or experiencing issues.
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Circuit is open, requests fail fast
 * - HALF_OPEN: Testing if service has recovered
 */

import { logger } from '@/lib/logger';

/**
 * Circuit breaker states
 */
export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  /** Name for identification */
  name: string;
  /** Number of failures before opening circuit */
  failureThreshold: number;
  /** Number of successes in half-open to close circuit */
  successThreshold: number;
  /** Time in ms before attempting recovery */
  resetTimeout: number;
  /** Request timeout in ms */
  timeout: number;
  /** Whether to use sliding window */
  useSlidingWindow: boolean;
  /** Sliding window size in ms */
  windowSize: number;
  /** Minimum requests before evaluating */
  minRequests: number;
  /** Failure rate threshold (0-100) */
  failureRateThreshold: number;
}

/**
 * Circuit breaker statistics
 */
export interface CircuitStats {
  state: CircuitState;
  failures: number;
  successes: number;
  consecutiveSuccesses: number;
  totalRequests: number;
  failedRequests: number;
  lastFailureTime?: Date;
  lastSuccessTime?: Date;
  lastStateChange: Date;
  failureRate: number;
}

/**
 * Request result for tracking
 */
interface RequestResult {
  timestamp: number;
  success: boolean;
  duration: number;
  error?: string;
}

/**
 * Circuit breaker error
 */
export class CircuitBreakerError extends Error {
  public readonly code = 'CIRCUIT_OPEN';
  public readonly circuitName: string;
  public readonly state: CircuitState;

  constructor(circuitName: string, state: CircuitState) {
    super(`Circuit breaker "${circuitName}" is ${state}`);
    this.name = 'CircuitBreakerError';
    this.circuitName = circuitName;
    this.state = state;
  }
}

/**
 * Default configuration
 */
const defaultConfig: Omit<CircuitBreakerConfig, 'name'> = {
  failureThreshold: 5,
  successThreshold: 3,
  resetTimeout: 30000,
  timeout: 10000,
  useSlidingWindow: true,
  windowSize: 60000,
  minRequests: 10,
  failureRateThreshold: 50
};

/**
 * Circuit Breaker Class
 */
export class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private consecutiveSuccesses: number = 0;
  private lastFailureTime?: Date;
  private lastSuccessTime?: Date;
  private lastStateChange: Date = new Date();
  private nextAttempt: Date = new Date();
  private requestHistory: RequestResult[] = [];
  private totalRequests: number = 0;
  private failedRequests: number = 0;

  constructor(config: Partial<CircuitBreakerConfig> & { name: string }) {
    this.config = { ...defaultConfig, ...config };
    logger.info({ circuit: this.config.name }, 'Circuit breaker initialized');
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit should transition from OPEN to HALF_OPEN
    if (this.state === CircuitState.OPEN) {
      if (new Date() >= this.nextAttempt) {
        this.transitionTo(CircuitState.HALF_OPEN);
      } else {
        throw new CircuitBreakerError(this.config.name, this.state);
      }
    }

    const startTime = Date.now();

    try {
      // Execute with timeout
      const result = await this.executeWithTimeout(fn);

      // Record success
      this.onSuccess(Date.now() - startTime);

      return result;
    } catch (error) {
      // Record failure
      this.onFailure(Date.now() - startTime, (error as Error).message);

      throw error;
    }
  }

  /**
   * Execute function with timeout
   */
  private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Circuit breaker timeout after ${this.config.timeout}ms`));
      }, this.config.timeout);

      fn()
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Handle successful request
   */
  private onSuccess(duration: number): void {
    this.successes++;
    this.consecutiveSuccesses++;
    this.totalRequests++;
    this.lastSuccessTime = new Date();

    this.recordRequest(true, duration);

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.consecutiveSuccesses >= this.config.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Reset failure count on success in closed state
      this.failures = 0;
    }

    logger.debug({
      circuit: this.config.name,
      state: this.state,
      duration,
      consecutiveSuccesses: this.consecutiveSuccesses
    }, 'Circuit breaker request succeeded');
  }

  /**
   * Handle failed request
   */
  private onFailure(duration: number, error?: string): void {
    this.failures++;
    this.failedRequests++;
    this.totalRequests++;
    this.consecutiveSuccesses = 0;
    this.lastFailureTime = new Date();

    this.recordRequest(false, duration, error);

    if (this.state === CircuitState.HALF_OPEN) {
      // Immediate trip on failure in half-open
      this.transitionTo(CircuitState.OPEN);
    } else if (this.state === CircuitState.CLOSED) {
      // Check if we should open the circuit
      if (this.shouldTrip()) {
        this.transitionTo(CircuitState.OPEN);
      }
    }

    logger.warn({
      circuit: this.config.name,
      state: this.state,
      failures: this.failures,
      error,
      duration
    }, 'Circuit breaker request failed');
  }

  /**
   * Check if circuit should trip open
   */
  private shouldTrip(): boolean {
    if (this.config.useSlidingWindow) {
      // Clean old requests
      const cutoff = Date.now() - this.config.windowSize;
      this.requestHistory = this.requestHistory.filter(r => r.timestamp > cutoff);

      // Check minimum requests
      if (this.requestHistory.length < this.config.minRequests) {
        return false;
      }

      // Calculate failure rate
      const failures = this.requestHistory.filter(r => !r.success).length;
      const failureRate = (failures / this.requestHistory.length) * 100;

      return failureRate >= this.config.failureRateThreshold;
    }

    // Simple threshold-based
    return this.failures >= this.config.failureThreshold;
  }

  /**
   * Record request for sliding window
   */
  private recordRequest(success: boolean, duration: number, error?: string): void {
    if (!this.config.useSlidingWindow) return;

    this.requestHistory.push({
      timestamp: Date.now(),
      success,
      duration,
      error
    });

    // Keep window size manageable
    const maxHistory = 1000;
    if (this.requestHistory.length > maxHistory) {
      this.requestHistory = this.requestHistory.slice(-maxHistory);
    }
  }

  /**
   * Transition to a new state
   */
  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;
    this.lastStateChange = new Date();

    if (newState === CircuitState.OPEN) {
      this.nextAttempt = new Date(Date.now() + this.config.resetTimeout);
      this.consecutiveSuccesses = 0;
    } else if (newState === CircuitState.CLOSED) {
      this.failures = 0;
      this.consecutiveSuccesses = 0;
    } else if (newState === CircuitState.HALF_OPEN) {
      this.consecutiveSuccesses = 0;
    }

    logger.info({
      circuit: this.config.name,
      from: oldState,
      to: newState,
      nextAttempt: newState === CircuitState.OPEN ? this.nextAttempt : undefined
    }, 'Circuit breaker state changed');
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get statistics
   */
  getStats(): CircuitStats {
    const recentHistory = this.config.useSlidingWindow
      ? this.requestHistory.filter(r => r.timestamp > Date.now() - this.config.windowSize)
      : [];

    const recentFailures = recentHistory.filter(r => !r.success).length;
    const failureRate = recentHistory.length > 0
      ? (recentFailures / recentHistory.length) * 100
      : 0;

    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      consecutiveSuccesses: this.consecutiveSuccesses,
      totalRequests: this.totalRequests,
      failedRequests: this.failedRequests,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      lastStateChange: this.lastStateChange,
      failureRate: Math.round(failureRate * 100) / 100
    };
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.consecutiveSuccesses = 0;
    this.lastStateChange = new Date();
    this.requestHistory = [];

    logger.info({ circuit: this.config.name }, 'Circuit breaker manually reset');
  }

  /**
   * Force circuit to open state
   */
  forceOpen(): void {
    this.transitionTo(CircuitState.OPEN);
    logger.warn({ circuit: this.config.name }, 'Circuit breaker forced open');
  }

  /**
   * Force circuit to closed state
   */
  forceClosed(): void {
    this.transitionTo(CircuitState.CLOSED);
    logger.info({ circuit: this.config.name }, 'Circuit breaker forced closed');
  }

  /**
   * Check if circuit is allowing requests
   */
  isAvailable(): boolean {
    if (this.state === CircuitState.CLOSED) return true;
    if (this.state === CircuitState.HALF_OPEN) return true;
    if (this.state === CircuitState.OPEN && new Date() >= this.nextAttempt) return true;
    return false;
  }
}

/**
 * Circuit breaker registry for managing multiple circuits
 */
class CircuitBreakerRegistry {
  private static instance: CircuitBreakerRegistry;
  private circuits: Map<string, CircuitBreaker> = new Map();

  static getInstance(): CircuitBreakerRegistry {
    if (!CircuitBreakerRegistry.instance) {
      CircuitBreakerRegistry.instance = new CircuitBreakerRegistry();
    }
    return CircuitBreakerRegistry.instance;
  }

  /**
   * Get or create a circuit breaker
   */
  getCircuit(config: Partial<CircuitBreakerConfig> & { name: string }): CircuitBreaker {
    let circuit = this.circuits.get(config.name);

    if (!circuit) {
      circuit = new CircuitBreaker(config);
      this.circuits.set(config.name, circuit);
    }

    return circuit;
  }

  /**
   * Get all circuits
   */
  getAllCircuits(): Map<string, CircuitBreaker> {
    return new Map(this.circuits);
  }

  /**
   * Get stats for all circuits
   */
  getAllStats(): Record<string, CircuitStats> {
    const stats: Record<string, CircuitStats> = {};

    for (const [name, circuit] of this.circuits) {
      stats[name] = circuit.getStats();
    }

    return stats;
  }

  /**
   * Reset all circuits
   */
  resetAll(): void {
    for (const circuit of this.circuits.values()) {
      circuit.reset();
    }
    logger.info({ count: this.circuits.size }, 'All circuit breakers reset');
  }

  /**
   * Remove a circuit
   */
  removeCircuit(name: string): boolean {
    return this.circuits.delete(name);
  }
}

// Export registry singleton
export const circuitBreakerRegistry = CircuitBreakerRegistry.getInstance();

/**
 * Pre-configured circuit breakers for common services
 */
export const circuitBreakers = {
  database: () => circuitBreakerRegistry.getCircuit({
    name: 'database',
    failureThreshold: 3,
    successThreshold: 2,
    resetTimeout: 10000,
    timeout: 5000
  }),

  redis: () => circuitBreakerRegistry.getCircuit({
    name: 'redis',
    failureThreshold: 5,
    successThreshold: 2,
    resetTimeout: 5000,
    timeout: 2000
  }),

  externalApi: (name: string) => circuitBreakerRegistry.getCircuit({
    name: `external-api-${name}`,
    failureThreshold: 5,
    successThreshold: 3,
    resetTimeout: 30000,
    timeout: 15000
  }),

  email: () => circuitBreakerRegistry.getCircuit({
    name: 'email-service',
    failureThreshold: 3,
    successThreshold: 2,
    resetTimeout: 60000,
    timeout: 30000
  }),

  storage: () => circuitBreakerRegistry.getCircuit({
    name: 'storage-service',
    failureThreshold: 3,
    successThreshold: 2,
    resetTimeout: 30000,
    timeout: 60000
  })
};

/**
 * Decorator for wrapping functions with circuit breaker
 */
export function withCircuitBreaker<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  circuit: CircuitBreaker
): T {
  return (async (...args: Parameters<T>) => {
    return circuit.execute(() => fn(...args));
  }) as T;
}

export default {
  CircuitBreaker,
  CircuitBreakerError,
  CircuitState,
  circuitBreakerRegistry,
  circuitBreakers,
  withCircuitBreaker
};
