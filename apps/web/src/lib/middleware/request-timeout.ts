/**
 * Request Timeout Middleware
 *
 * Provides configurable request timeouts to prevent hanging requests
 * and improve system reliability under load.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * Timeout configuration
 */
export interface TimeoutConfig {
  /** Default timeout in milliseconds */
  defaultTimeout: number;
  /** Maximum allowed timeout */
  maxTimeout: number;
  /** Timeout for specific routes */
  routeTimeouts: Map<string, number>;
  /** Timeout for specific methods */
  methodTimeouts: Map<string, number>;
  /** Whether to abort on timeout */
  abortOnTimeout: boolean;
  /** Custom timeout header name */
  timeoutHeader: string;
}

const defaultConfig: TimeoutConfig = {
  defaultTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),
  maxTimeout: parseInt(process.env.REQUEST_MAX_TIMEOUT || '300000', 10),
  routeTimeouts: new Map([
    ['/api/health', 5000],
    ['/api/upload', 120000],
    ['/api/export', 180000],
    ['/api/import', 300000],
    ['/api/reports', 60000]
  ]),
  methodTimeouts: new Map([
    ['GET', 15000],
    ['POST', 30000],
    ['PUT', 30000],
    ['PATCH', 30000],
    ['DELETE', 15000]
  ]),
  abortOnTimeout: true,
  timeoutHeader: 'X-Request-Timeout'
};

/**
 * Timeout error class
 */
export class RequestTimeoutError extends Error {
  public readonly statusCode = 408;
  public readonly code = 'REQUEST_TIMEOUT';
  public readonly timeout: number;
  public readonly path: string;

  constructor(timeout: number, path: string) {
    super(`Request timed out after ${timeout}ms`);
    this.name = 'RequestTimeoutError';
    this.timeout = timeout;
    this.path = path;
  }
}

/**
 * Get timeout for a specific request
 */
export function getTimeoutForRequest(
  request: NextRequest,
  config: TimeoutConfig = defaultConfig
): number {
  const path = new URL(request.url).pathname;
  const method = request.method;

  // Check for custom timeout header
  const headerTimeout = request.headers.get(config.timeoutHeader);
  if (headerTimeout) {
    const parsedTimeout = parseInt(headerTimeout, 10);
    if (!isNaN(parsedTimeout) && parsedTimeout > 0) {
      return Math.min(parsedTimeout, config.maxTimeout);
    }
  }

  // Check route-specific timeout
  for (const [route, timeout] of config.routeTimeouts) {
    if (path.startsWith(route)) {
      return timeout;
    }
  }

  // Check method-specific timeout
  const methodTimeout = config.methodTimeouts.get(method);
  if (methodTimeout) {
    return methodTimeout;
  }

  return config.defaultTimeout;
}

/**
 * Create a timeout promise
 */
function createTimeoutPromise(
  timeout: number,
  path: string,
  abortController?: AbortController
): Promise<never> {
  return new Promise((_, reject) => {
    const timeoutId = setTimeout(() => {
      if (abortController) {
        abortController.abort();
      }
      reject(new RequestTimeoutError(timeout, path));
    }, timeout);

    // Store timeout ID for cleanup
    (createTimeoutPromise as { lastTimeoutId?: ReturnType<typeof setTimeout> }).lastTimeoutId = timeoutId;
  });
}

/**
 * Clear pending timeout
 */
function clearPendingTimeout(): void {
  const lastTimeoutId = (createTimeoutPromise as { lastTimeoutId?: ReturnType<typeof setTimeout> }).lastTimeoutId;
  if (lastTimeoutId) {
    clearTimeout(lastTimeoutId);
  }
}

/**
 * Request timeout middleware wrapper
 */
export function withRequestTimeout<T = unknown>(
  handler: (request: NextRequest, context?: unknown) => Promise<NextResponse<T>>,
  options: Partial<TimeoutConfig> = {}
) {
  const config = { ...defaultConfig, ...options };

  return async (request: NextRequest, context?: unknown): Promise<NextResponse<T>> => {
    const path = new URL(request.url).pathname;
    const timeout = getTimeoutForRequest(request, config);
    const startTime = Date.now();

    // Create abort controller for request cancellation
    const abortController = config.abortOnTimeout ? new AbortController() : undefined;

    // Add abort signal to request context if needed
    const enhancedContext = {
      ...context,
      abortSignal: abortController?.signal
    };

    try {
      // Race between handler and timeout
      const result = await Promise.race([
        handler(request, enhancedContext),
        createTimeoutPromise(timeout, path, abortController)
      ]);

      // Clear timeout on success
      clearPendingTimeout();

      // Add timing headers
      const duration = Date.now() - startTime;
      const response = new NextResponse(result.body, result);
      response.headers.set('X-Response-Time', `${duration}ms`);
      response.headers.set('X-Timeout-Limit', `${timeout}ms`);

      return response;
    } catch (error: any) {
      clearPendingTimeout();

      if (error instanceof RequestTimeoutError) {
        logger.warn({
          path: error.path,
          timeout: error.timeout,
          method: request.method
        }, 'Request timed out');

        return NextResponse.json(
          {
            success: false,
            error: {
              message: error.message,
              code: error.code,
              timeout: error.timeout
            }
          },
          {
            status: error.statusCode,
            headers: {
              'X-Response-Time': `${Date.now() - startTime}ms`,
              'X-Timeout-Limit': `${timeout}ms`
            }
          }
        ) as NextResponse<T>;
      }

      throw error;
    }
  };
}

/**
 * Timeout-aware fetch wrapper
 */
export async function fetchWithTimeout<T = unknown>(
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = defaultConfig.defaultTimeout, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });
    return response;
  } catch (error: any) {
    if ((error as Error).name === 'AbortError') {
      throw new RequestTimeoutError(timeout, url);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Create async operation with timeout
 */
export async function withTimeout<T>(
  operation: () => Promise<T>,
  timeout: number,
  operationName: string = 'operation'
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${operationName} timed out after ${timeout}ms`));
    }, timeout);
  });

  try {
    const result = await Promise.race([operation(), timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error: any) {
    clearTimeout(timeoutId!);
    throw error;
  }
}

/**
 * Timeout configuration presets
 */
export const timeoutPresets = {
  quick: {
    defaultTimeout: 5000,
    maxTimeout: 15000
  },
  standard: {
    defaultTimeout: 30000,
    maxTimeout: 60000
  },
  longRunning: {
    defaultTimeout: 120000,
    maxTimeout: 300000
  },
  upload: {
    defaultTimeout: 300000,
    maxTimeout: 600000
  }
} as const;

/**
 * Get timeout preset by name
 */
export function getTimeoutPreset(name: keyof typeof timeoutPresets): Partial<TimeoutConfig> {
  return timeoutPresets[name];
}

/**
 * Configure route-specific timeouts
 */
export function configureRouteTimeouts(
  routes: Record<string, number>
): Map<string, number> {
  const routeTimeouts = new Map(defaultConfig.routeTimeouts);

  for (const [route, timeout] of Object.entries(routes)) {
    if (timeout > 0 && timeout <= defaultConfig.maxTimeout) {
      routeTimeouts.set(route, timeout);
    }
  }

  return routeTimeouts;
}

/**
 * Timeout statistics tracking
 */
class TimeoutStats {
  private static instance: TimeoutStats;
  private stats = {
    totalRequests: 0,
    timedOutRequests: 0,
    avgResponseTime: 0,
    maxResponseTime: 0
  };

  static getInstance(): TimeoutStats {
    if (!TimeoutStats.instance) {
      TimeoutStats.instance = new TimeoutStats();
    }
    return TimeoutStats.instance;
  }

  recordRequest(duration: number, timedOut: boolean = false): void {
    this.stats.totalRequests++;
    if (timedOut) {
      this.stats.timedOutRequests++;
    }

    // Update average (rolling)
    this.stats.avgResponseTime =
      (this.stats.avgResponseTime * (this.stats.totalRequests - 1) + duration) /
      this.stats.totalRequests;

    this.stats.maxResponseTime = Math.max(this.stats.maxResponseTime, duration);
  }

  getStats(): typeof this.stats {
    return { ...this.stats };
  }

  getTimeoutRate(): number {
    if (this.stats.totalRequests === 0) return 0;
    return (this.stats.timedOutRequests / this.stats.totalRequests) * 100;
  }

  reset(): void {
    this.stats = {
      totalRequests: 0,
      timedOutRequests: 0,
      avgResponseTime: 0,
      maxResponseTime: 0
    };
  }
}

export const timeoutStats = TimeoutStats.getInstance();

export default {
  withRequestTimeout,
  fetchWithTimeout,
  withTimeout,
  getTimeoutForRequest,
  timeoutPresets,
  getTimeoutPreset,
  configureRouteTimeouts,
  timeoutStats,
  RequestTimeoutError
};
