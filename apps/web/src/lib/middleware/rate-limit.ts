import { NextRequest, NextResponse } from 'next/server';
import { RateLimitError } from '@/lib/errors';
import logger from '@/lib/logger';
import { rateLimitConfig } from '@/lib/config/env';

/**
 * Rate Limiting Middleware
 *
 * Implements token bucket algorithm for rate limiting
 * Supports both in-memory and Redis-based storage
 */

interface RateLimitRecord {
  tokens: number;
  lastRefill: number;
}

/**
 * In-memory rate limit store
 * Used when Redis is not available
 */
class MemoryStore {
  private store: Map<string, RateLimitRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup old entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  async get(key: string): Promise<RateLimitRecord | null> {
    return this.store.get(key) || null;
  }

  async set(key: string, record: RateLimitRecord, ttl: number): Promise<void> {
    this.store.set(key, record);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    const maxAge = rateLimitConfig.windowMs;

    for (const [key, record] of this.store.entries()) {
      if (now - record.lastRefill > maxAge) {
        this.store.delete(key);
      }
    }

    logger.debug({ size: this.store.size }, 'Rate limit store cleanup completed');
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Singleton store instance
const store = new MemoryStore();

/**
 * Rate limit configuration options
 */
export interface RateLimitOptions {
  /**
   * Maximum number of requests allowed in the window
   * @default 100
   */
  max?: number;

  /**
   * Time window in milliseconds
   * @default 900000 (15 minutes)
   */
  windowMs?: number;

  /**
   * Key generator function to identify clients
   * @default IP address + user ID (if authenticated)
   */
  keyGenerator?: (request: NextRequest) => string;

  /**
   * Custom error message
   */
  message?: string;

  /**
   * Skip rate limiting for certain requests
   */
  skip?: (request: NextRequest) => boolean;

  /**
   * Handler called when rate limit is exceeded
   */
  onLimitReached?: (request: NextRequest, key: string) => void;
}

/**
 * Default key generator
 * Uses IP address and user ID if available
 */
function defaultKeyGenerator(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown';

  // If authenticated, include user ID for more granular limiting
  const userHeader = request.headers.get('x-user-id');
  if (userHeader) {
    return `${ip}:${userHeader}`;
  }

  return ip;
}

/**
 * Token bucket rate limiter
 */
class TokenBucket {
  private max: number;
  private windowMs: number;
  private refillRate: number;

  constructor(max: number, windowMs: number) {
    this.max = max;
    this.windowMs = windowMs;
    // Refill rate: tokens per millisecond
    this.refillRate = max / windowMs;
  }

  async consume(key: string, tokens: number = 1): Promise<{ allowed: boolean; remaining: number }> {
    const now = Date.now();
    let record = await store.get(key);

    if (!record) {
      // First request from this key
      record = {
        tokens: this.max - tokens,
        lastRefill: now,
      };
      await store.set(key, record, this.windowMs);

      return {
        allowed: true,
        remaining: record.tokens,
      };
    }

    // Calculate tokens to add based on time elapsed
    const elapsed = now - record.lastRefill;
    const tokensToAdd = Math.floor(elapsed * this.refillRate);

    // Refill tokens (capped at max)
    record.tokens = Math.min(this.max, record.tokens + tokensToAdd);
    record.lastRefill = now;

    // Try to consume tokens
    if (record.tokens >= tokens) {
      record.tokens -= tokens;
      await store.set(key, record, this.windowMs);

      return {
        allowed: true,
        remaining: record.tokens,
      };
    }

    // Not enough tokens
    await store.set(key, record, this.windowMs);

    return {
      allowed: false,
      remaining: record.tokens,
    };
  }
}

/**
 * Rate limit middleware factory
 *
 * @example
 * export const GET = rateLimit()(async (request) => {
 *   return NextResponse.json({ data: 'success' });
 * });
 *
 * @example
 * export const POST = rateLimit({ max: 10, windowMs: 60000 })(
 *   async (request) => {
 *     return NextResponse.json({ data: 'success' });
 *   }
 * );
 */
export function rateLimit(options: RateLimitOptions = {}) {
  const {
    max = rateLimitConfig.max,
    windowMs = rateLimitConfig.windowMs,
    keyGenerator = defaultKeyGenerator,
    message = 'Too many requests, please try again later',
    skip,
    onLimitReached,
  } = options;

  const bucket = new TokenBucket(max, windowMs);

  return function rateLimitMiddleware<T extends (request: NextRequest, ...args: any[]) => Promise<NextResponse>>(
    handler: T
  ): (...args: Parameters<T>) => Promise<NextResponse> {
    return async (...args: Parameters<T>): Promise<NextResponse> => {
      const request = args[0] as NextRequest;

      // Skip rate limiting if specified
      if (skip && skip(request)) {
        return handler(...args);
      }

      // Generate key for this request
      const key = keyGenerator(request);

      try {
        // Try to consume a token
        const { allowed, remaining } = await bucket.consume(key, 1);

        if (!allowed) {
          // Rate limit exceeded
          if (onLimitReached) {
            onLimitReached(request, key);
          }

          logger.warn(
            {
              key,
              url: request.url,
              method: request.method,
            },
            'Rate limit exceeded'
          );

          throw new RateLimitError(message, {
            key,
            max,
            windowMs,
          });
        }

        // Add rate limit headers
        const response = await handler(...args);

        response.headers.set('X-RateLimit-Limit', max.toString());
        response.headers.set('X-RateLimit-Remaining', remaining.toString());
        response.headers.set('X-RateLimit-Reset', new Date(Date.now() + windowMs).toISOString());

        return response;
      } catch (error) {
        if (error instanceof RateLimitError) {
          return NextResponse.json(
            {
              success: false,
              error: {
                message: error.message,
                code: error.code,
                retryAfter: Math.ceil(windowMs / 1000), // seconds
              },
            },
            {
              status: 429,
              headers: {
                'Retry-After': Math.ceil(windowMs / 1000).toString(),
                'X-RateLimit-Limit': max.toString(),
                'X-RateLimit-Remaining': '0',
              },
            }
          );
        }
        throw error;
      }
    };
  };
}

/**
 * Preset rate limiters for common use cases
 */

/**
 * Strict rate limit for sensitive operations (login, password reset)
 * 5 requests per 15 minutes
 */
export const strictRateLimit = rateLimit({
  max: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many attempts, please try again in 15 minutes',
});

/**
 * Auth rate limit for authentication endpoints
 * 10 requests per 5 minutes
 */
export const authRateLimit = rateLimit({
  max: 10,
  windowMs: 5 * 60 * 1000, // 5 minutes
  message: 'Too many login attempts, please try again later',
});

/**
 * API rate limit for general API endpoints
 * 100 requests per 15 minutes
 */
export const apiRateLimit = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
});

/**
 * Generous rate limit for read-only endpoints
 * 300 requests per 15 minutes
 */
export const readRateLimit = rateLimit({
  max: 300,
  windowMs: 15 * 60 * 1000, // 15 minutes
});

/**
 * Check remaining rate limit for a key without consuming
 */
export async function checkRateLimit(key: string): Promise<{ remaining: number; reset: Date }> {
  const record = await store.get(key);

  if (!record) {
    return {
      remaining: rateLimitConfig.max,
      reset: new Date(Date.now() + rateLimitConfig.windowMs),
    };
  }

  return {
    remaining: record.tokens,
    reset: new Date(record.lastRefill + rateLimitConfig.windowMs),
  };
}

/**
 * Reset rate limit for a specific key
 * Useful for administrative overrides
 */
export async function resetRateLimit(key: string): Promise<void> {
  await store.delete(key);
  logger.info({ key }, 'Rate limit reset for key');
}

// Cleanup on process exit
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => {
    store.destroy();
  });

  process.on('SIGINT', () => {
    store.destroy();
  });
}
