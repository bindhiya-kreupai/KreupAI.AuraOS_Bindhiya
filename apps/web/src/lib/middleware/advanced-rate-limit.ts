import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Redis } from 'ioredis';
import { logger } from '@/lib/logger';

/**
 * Advanced Rate Limiting Middleware
 *
 * Implements sliding window rate limiting with Redis for distributed systems.
 * Supports multiple rate limit tiers, IP-based and user-based limiting.
 */

// Redis client singleton
let redisClient: Redis | null = null;

function getRedisClient(): Redis {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const redisPassword = process.env.REDIS_PASSWORD;
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      password: redisPassword,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    redisClient.on('error', (error) => {
      logger.error({ error }, 'Redis connection error');
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected for rate limiting');
    });
  }

  return redisClient;
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the window
   */
  maxRequests: number;

  /**
   * Time window in seconds
   */
  windowSeconds: number;

  /**
   * Unique identifier for this rate limit (e.g., 'auth:login', 'api:users')
   */
  identifier: string;

  /**
   * Custom key function to identify the requester
   * Defaults to IP address
   */
  keyGenerator?: (request: NextRequest) => string;

  /**
   * Skip rate limiting for certain conditions
   */
  skip?: (request: NextRequest) => boolean;

  /**
   * Custom error message
   */
  message?: string;

  /**
   * Whether to use user ID instead of IP (requires authentication)
   */
  useUserId?: boolean;
}

/**
 * Rate limit result
 */
interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  total: number;
}

/**
 * Get rate limit key for a request
 */
function getRateLimitKey(config: RateLimitConfig, request: NextRequest, userId?: string): string {
  let identifier: string;

  if (config.keyGenerator) {
    identifier = config.keyGenerator(request);
  } else if (config.useUserId && userId) {
    identifier = `user:${userId}`;
  } else {
    // Use IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    identifier = `ip:${ip}`;
  }

  return `ratelimit:${config.identifier}:${identifier}`;
}

/**
 * Check rate limit using sliding window algorithm
 */
async function checkRateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
  try {
    const redis = getRedisClient();
    await redis.connect().catch(() => {
      // Already connected or connection in progress
    });

    const now = Date.now();
    const windowStart = now - config.windowSeconds * 1000;

    // Use Redis sorted set for sliding window
    const pipeline = redis.pipeline();

    // Remove old entries outside the window
    pipeline.zremrangebyscore(key, '-inf', windowStart);

    // Count requests in current window
    pipeline.zcard(key);

    // Add current request
    pipeline.zadd(key, now, `${now}-${Math.random()}`);

    // Set expiration
    pipeline.expire(key, config.windowSeconds);

    const results = await pipeline.exec();

    if (!results) {
      throw new Error('Redis pipeline failed');
    }

    // Get count (before adding current request)
    const count = (results[1][1] as number) || 0;

    const allowed = count < config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - count - 1);
    const resetTime = now + config.windowSeconds * 1000;

    return {
      allowed,
      remaining,
      resetTime,
      total: config.maxRequests,
    };
  } catch (error: any) {
    logger.error({ error, key }, 'Rate limit check failed');

    // Fail open - allow request if Redis is unavailable
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetTime: Date.now() + config.windowSeconds * 1000,
      total: config.maxRequests,
    };
  }
}

/**
 * Rate limiting middleware factory
 */
export function createRateLimit(config: RateLimitConfig) {
  return async function rateLimitMiddleware(
    request: NextRequest,
    handler: () => Promise<NextResponse> | NextResponse,
    userId?: string
  ): Promise<NextResponse> {
    // Skip rate limiting if configured
    if (config.skip && config.skip(request)) {
      return handler();
    }

    const key = getRateLimitKey(config, request, userId);
    const result = await checkRateLimit(key, config);

    // Add rate limit headers
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', result.total.toString());
    headers.set('X-RateLimit-Remaining', result.remaining.toString());
    headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      headers.set('Retry-After', retryAfter.toString());

      logger.warn(
        {
          key,
          config: config.identifier,
          resetTime: new Date(result.resetTime).toISOString(),
        },
        'Rate limit exceeded'
      );

      const message =
        config.message || `Too many requests. Please try again in ${retryAfter} seconds.`;

      return new NextResponse(
        JSON.stringify({
          success: false,
          error: message,
          retryAfter,
        }),
        {
          status: 429,
          headers,
        }
      );
    }

    // Execute handler
    const response = await handler();

    // Add rate limit headers to successful response
    headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    return response;
  };
}

/**
 * Predefined rate limit configurations
 */
export const RateLimitPresets = {
  /**
   * Strict rate limit for authentication endpoints
   * 5 requests per 15 minutes
   */
  AUTH_STRICT: {
    maxRequests: 5,
    windowSeconds: 15 * 60,
    identifier: 'auth:strict',
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  } as RateLimitConfig,

  /**
   * Standard rate limit for authentication endpoints
   * 10 requests per 5 minutes
   */
  AUTH_STANDARD: {
    maxRequests: 10,
    windowSeconds: 5 * 60,
    identifier: 'auth:standard',
    message: 'Too many authentication attempts. Please try again later.',
  } as RateLimitConfig,

  /**
   * Rate limit for API endpoints (per user)
   * 100 requests per minute
   */
  API_USER: {
    maxRequests: 100,
    windowSeconds: 60,
    identifier: 'api:user',
    useUserId: true,
    message: 'API rate limit exceeded. Please slow down your requests.',
  } as RateLimitConfig,

  /**
   * Rate limit for API endpoints (per IP)
   * 200 requests per minute
   */
  API_IP: {
    maxRequests: 200,
    windowSeconds: 60,
    identifier: 'api:ip',
    message: 'API rate limit exceeded. Please slow down your requests.',
  } as RateLimitConfig,

  /**
   * Rate limit for public endpoints
   * 50 requests per minute
   */
  PUBLIC: {
    maxRequests: 50,
    windowSeconds: 60,
    identifier: 'public',
    message: 'Rate limit exceeded. Please try again later.',
  } as RateLimitConfig,

  /**
   * Aggressive rate limit for password reset
   * 3 requests per hour
   */
  PASSWORD_RESET: {
    maxRequests: 3,
    windowSeconds: 60 * 60,
    identifier: 'auth:password-reset',
    message: 'Too many password reset attempts. Please try again in 1 hour.',
  } as RateLimitConfig,

  /**
   * Rate limit for MFA validation
   * 10 attempts per 5 minutes
   */
  MFA_VALIDATION: {
    maxRequests: 10,
    windowSeconds: 5 * 60,
    identifier: 'auth:mfa-validate',
    message: 'Too many MFA validation attempts. Please try again later.',
  } as RateLimitConfig,

  /**
   * Rate limit for file uploads
   * 20 uploads per hour
   */
  UPLOAD: {
    maxRequests: 20,
    windowSeconds: 60 * 60,
    identifier: 'upload',
    message: 'Upload rate limit exceeded. Please try again later.',
  } as RateLimitConfig,
};

/**
 * Helper function to wrap API route with rate limiting
 */
export function withRateLimit(
  config: RateLimitConfig,
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse
) {
  const rateLimiter = createRateLimit(config);

  return async function (request: NextRequest): Promise<NextResponse> {
    return rateLimiter(request, () => handler(request));
  };
}

/**
 * Helper function to get current rate limit status for a key
 */
export async function getRateLimitStatus(
  config: RateLimitConfig,
  request: NextRequest,
  userId?: string
): Promise<RateLimitResult> {
  const key = getRateLimitKey(config, request, userId);
  return checkRateLimit(key, config);
}

/**
 * Helper function to reset rate limit for a key (admin use)
 */
export async function resetRateLimit(config: RateLimitConfig, identifier: string): Promise<void> {
  try {
    const redis = getRedisClient();
    await redis.connect().catch(() => {});

    const key = `ratelimit:${config.identifier}:${identifier}`;
    await redis.del(key);

    logger.info({ key }, 'Rate limit reset');
  } catch (error: any) {
    logger.error({ error }, 'Failed to reset rate limit');
    throw error;
  }
}

/**
 * Cleanup function to close Redis connection
 */
export async function closeRateLimitRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
}
