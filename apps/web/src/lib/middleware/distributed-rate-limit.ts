/**
 * Distributed Rate Limiting with Redis
 *
 * Provides Redis-backed rate limiting that works across multiple server instances.
 * Uses sliding window algorithm for accurate rate limiting.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { redis } from '@/lib/cache/redis';
import { logger } from '@/lib/logger';

// Configuration
const RATE_LIMIT_PREFIX = 'ratelimit:';
const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_MAX_REQUESTS = 100;

export interface RateLimitConfig {
  /** Unique identifier for the rate limit window */
  key?: string;
  /** Maximum requests per window */
  max?: number;
  /** Window size in milliseconds */
  windowMs?: number;
  /** Key generator function */
  keyGenerator?: (request: NextRequest) => string;
  /** Skip rate limiting for certain requests */
  skip?: (request: NextRequest) => boolean;
  /** Custom error handler */
  onLimitReached?: (request: NextRequest, retryAfter: number) => NextResponse;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
  total: number;
}

/**
 * Default key generator - uses IP address
 */
function defaultKeyGenerator(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0].trim() || realIp || 'unknown';
  return ip;
}

/**
 * Check rate limit using Redis sliding window
 */
export async function checkRateLimit(
  identifier: string,
  max: number = DEFAULT_MAX_REQUESTS,
  windowMs: number = DEFAULT_WINDOW_MS
): Promise<RateLimitResult> {
  const key = `${RATE_LIMIT_PREFIX}${identifier}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  // If Redis is not available, fall back to allowing the request
  if (!redis.isReady()) {
    logger.warn('Redis not available for rate limiting - allowing request');
    return {
      allowed: true,
      remaining: max,
      resetAt: now + windowMs,
      total: 0,
    };
  }

  try {
    const client = redis.getClient();
    if (!client) {
      return {
        allowed: true,
        remaining: max,
        resetAt: now + windowMs,
        total: 0,
      };
    }

    // Use Redis pipeline for atomic operations
    const pipeline = client.pipeline();

    // Remove old entries outside the window
    pipeline.zremrangebyscore(key, 0, windowStart);

    // Add current request
    pipeline.zadd(key, now, `${now}:${Math.random()}`);

    // Count requests in window
    pipeline.zcard(key);

    // Set expiry on the key
    pipeline.pexpire(key, windowMs);

    const results = await pipeline.exec();

    if (!results) {
      return {
        allowed: true,
        remaining: max,
        resetAt: now + windowMs,
        total: 0,
      };
    }

    // Get the count from results (third command)
    const count = results[2]?.[1] as number || 0;

    const allowed = count <= max;
    const remaining = Math.max(0, max - count);
    const resetAt = now + windowMs;
    const retryAfter = allowed ? undefined : Math.ceil(windowMs / 1000);

    return {
      allowed,
      remaining,
      resetAt,
      retryAfter,
      total: count,
    };
  } catch (error) {
    logger.error({ error, identifier }, 'Rate limit check failed');
    // On error, allow the request
    return {
      allowed: true,
      remaining: max,
      resetAt: now + windowMs,
      total: 0,
    };
  }
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult, max: number): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(max),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  };

  if (result.retryAfter) {
    headers['Retry-After'] = String(result.retryAfter);
  }

  return headers;
}

/**
 * Rate limit presets
 */
export const RateLimitPresets = {
  // Very strict - for sensitive operations like login
  strict: { max: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 minutes

  // Auth endpoints
  auth: { max: 10, windowMs: 5 * 60 * 1000 }, // 10 per 5 minutes

  // API endpoints
  api: { max: 100, windowMs: 60 * 1000 }, // 100 per minute

  // Read-only endpoints
  read: { max: 300, windowMs: 60 * 1000 }, // 300 per minute

  // Bulk operations
  bulk: { max: 10, windowMs: 60 * 1000 }, // 10 per minute

  // Upload endpoints
  upload: { max: 20, windowMs: 60 * 1000 }, // 20 per minute

  // Webhook endpoints
  webhook: { max: 1000, windowMs: 60 * 1000 }, // 1000 per minute
} as const;

export type RateLimitPreset = keyof typeof RateLimitPresets;

/**
 * Distributed Rate Limiting Middleware
 *
 * Usage:
 * ```typescript
 * export const POST = withDistributedRateLimit({
 *   max: 10,
 *   windowMs: 60000,
 * })(async (request) => {
 *   // Your handler code
 * });
 * ```
 */
export function withDistributedRateLimit(config: RateLimitConfig = {}) {
  const {
    max = DEFAULT_MAX_REQUESTS,
    windowMs = DEFAULT_WINDOW_MS,
    keyGenerator = defaultKeyGenerator,
    skip,
    onLimitReached,
  } = config;

  return function rateLimitMiddleware<T extends (request: NextRequest, ...args: any[]) => Promise<NextResponse>>(
    handler: T
  ): T {
    return (async (request: NextRequest, ...args: any[]) => {
      // Check if should skip rate limiting
      if (skip && skip(request)) {
        return handler(request, ...args);
      }

      // Generate rate limit key
      const path = new URL(request.url).pathname;
      const identifier = config.key || `${keyGenerator(request)}:${path}`;

      // Check rate limit
      const result = await checkRateLimit(identifier, max, windowMs);

      // Create rate limit headers
      const headers = createRateLimitHeaders(result, max);

      if (!result.allowed) {
        logger.warn(
          {
            identifier,
            max,
            windowMs,
            total: result.total,
          },
          'Rate limit exceeded'
        );

        // Custom handler for rate limit exceeded
        if (onLimitReached) {
          return onLimitReached(request, result.retryAfter || 60);
        }

        // Default response
        const response = NextResponse.json(
          {
            success: false,
            error: {
              message: 'Too many requests. Please try again later.',
              code: 'RATE_LIMIT_EXCEEDED',
              retryAfter: result.retryAfter,
            },
          },
          { status: 429 }
        );

        // Add rate limit headers
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });

        return response;
      }

      // Process request
      const response = await handler(request, ...args);

      // Add rate limit headers to successful response
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    }) as T;
  };
}

/**
 * Create rate limiter with preset
 */
export function createRateLimiter(preset: RateLimitPreset, additionalConfig?: Partial<RateLimitConfig>) {
  const presetConfig = RateLimitPresets[preset];
  return withDistributedRateLimit({
    ...presetConfig,
    ...additionalConfig,
  });
}

/**
 * Rate limit by user ID (for authenticated routes)
 */
export function rateLimitByUser(userId: string, max: number = 100, windowMs: number = 60000) {
  return checkRateLimit(`user:${userId}`, max, windowMs);
}

/**
 * Rate limit by tenant ID (for multi-tenant routes)
 */
export function rateLimitByTenant(tenantId: string, max: number = 1000, windowMs: number = 60000) {
  return checkRateLimit(`tenant:${tenantId}`, max, windowMs);
}

/**
 * Rate limit by API key
 */
export function rateLimitByAPIKey(apiKeyId: string, max: number = 1000, windowMs: number = 60000) {
  return checkRateLimit(`apikey:${apiKeyId}`, max, windowMs);
}

export default {
  checkRateLimit,
  withDistributedRateLimit,
  createRateLimiter,
  rateLimitByUser,
  rateLimitByTenant,
  rateLimitByAPIKey,
  createRateLimitHeaders,
  RateLimitPresets,
};
