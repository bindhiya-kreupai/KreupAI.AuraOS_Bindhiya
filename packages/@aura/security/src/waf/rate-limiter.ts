/**
 * RateLimiter
 *
 * Redis-backed sliding window rate limiter.
 * Implements OWASP rate limiting best practices.
 *
 * Default limits:
 *   - General API:       100 req/60s
 *   - Auth endpoints:     10 req/60s
 *   - Sensitive ops:       5 req/60s
 *
 * @module @aura/security
 */

import Redis, { type RedisOptions } from 'ioredis';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  limit: number;
  windowSeconds: number;
}

export interface RateLimiterOptions {
  host?: string;
  port?: number;
  password?: string;
  keyPrefix?: string;
  redisOptions?: RedisOptions;
}

export interface EndpointLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

// Default rate limit configurations
export const DEFAULT_LIMITS: Record<string, EndpointLimitConfig> = {
  general:   { maxRequests: 100, windowSeconds: 60 },
  auth:      { maxRequests: 10,  windowSeconds: 60 },
  sensitive: { maxRequests: 5,   windowSeconds: 60 },
  upload:    { maxRequests: 20,  windowSeconds: 60 },
  export:    { maxRequests: 5,   windowSeconds: 300 },
};

// ---------------------------------------------------------------------------
// RateLimiter
// ---------------------------------------------------------------------------

export class RateLimiter {
  private redis: Redis;
  private readonly keyPrefix: string;

  constructor(options: RateLimiterOptions = {}) {
    const host     = options.host     ?? process.env.REDIS_HOST ?? 'localhost';
    const port     = options.port     ?? parseInt(process.env.REDIS_PORT ?? '6379', 10);
    const password = options.password ?? process.env.REDIS_PASSWORD;

    this.keyPrefix = options.keyPrefix ?? 'aura:ratelimit:';

    this.redis = new Redis({
      host,
      port,
      password: password || undefined,
      maxRetriesPerRequest: 2,
      retryStrategy: (times) => Math.min(times * 50, 1000),
      lazyConnect: true,
      ...options.redisOptions,
    });

    this.redis.on('error', (err) => {
      console.error('[RateLimiter] Redis error:', err.message);
    });
  }

  async connect(): Promise<void> {
    await this.redis.connect();
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
  }

  // -------------------------------------------------------------------------
  // Core rate limiting — sliding window using sorted sets
  // -------------------------------------------------------------------------

  /**
   * Check and consume a rate limit token for a given key.
   *
   * Uses a sliding window algorithm with Redis ZSET:
   *   1. Remove entries older than `windowSeconds`
   *   2. Count remaining entries
   *   3. If count < maxRequests: add current timestamp
   *   4. Set expiry on the key
   *
   * @param key            Unique limit identifier (e.g. 'ip:192.168.1.1', 'user:abc123')
   * @param maxRequests    Maximum requests allowed within the window
   * @param windowSeconds  Rolling window duration in seconds
   */
  async checkLimit(
    key: string,
    maxRequests: number,
    windowSeconds: number
  ): Promise<RateLimitResult> {
    const redisKey   = this.keyPrefix + key;
    const now        = Date.now();
    const windowMs   = windowSeconds * 1000;
    const windowStart = now - windowMs;
    const resetAt    = new Date(now + windowMs);

    try {
      const pipeline = this.redis.pipeline();
      // Remove expired entries
      pipeline.zremrangebyscore(redisKey, '-inf', windowStart.toString());
      // Count remaining
      pipeline.zcard(redisKey);
      // Add current request timestamp
      pipeline.zadd(redisKey, now.toString(), `${now}-${Math.random()}`);
      // Set key expiry
      pipeline.expire(redisKey, windowSeconds + 1);

      const results = await pipeline.exec();

      const count = (results?.[1]?.[1] ?? 0) as number;
      const allowed = count < maxRequests;
      const remaining = Math.max(0, maxRequests - count - (allowed ? 1 : 0));

      if (!allowed) {
        // Roll back the zadd we just did
        await this.redis.zremrangebyscore(redisKey, now.toString(), now.toString());
      }

      return {
        allowed,
        remaining,
        resetAt,
        limit: maxRequests,
        windowSeconds,
      };
    } catch (err) {
      // Fail open on Redis errors — log and allow the request
      console.error('[RateLimiter] Redis error during checkLimit:', err);
      return {
        allowed: true,
        remaining: maxRequests,
        resetAt,
        limit: maxRequests,
        windowSeconds,
      };
    }
  }

  // -------------------------------------------------------------------------
  // Convenience methods with default limits
  // -------------------------------------------------------------------------

  async checkGeneralLimit(identifier: string): Promise<RateLimitResult> {
    const { maxRequests, windowSeconds } = DEFAULT_LIMITS.general;
    return this.checkLimit(`general:${identifier}`, maxRequests, windowSeconds);
  }

  async checkAuthLimit(identifier: string): Promise<RateLimitResult> {
    const { maxRequests, windowSeconds } = DEFAULT_LIMITS.auth;
    return this.checkLimit(`auth:${identifier}`, maxRequests, windowSeconds);
  }

  async checkSensitiveLimit(identifier: string): Promise<RateLimitResult> {
    const { maxRequests, windowSeconds } = DEFAULT_LIMITS.sensitive;
    return this.checkLimit(`sensitive:${identifier}`, maxRequests, windowSeconds);
  }

  // -------------------------------------------------------------------------
  // Per-tenant and per-user limits
  // -------------------------------------------------------------------------

  async checkUserLimit(userId: string, endpoint = 'general'): Promise<RateLimitResult> {
    const config = DEFAULT_LIMITS[endpoint] ?? DEFAULT_LIMITS.general;
    return this.checkLimit(`user:${userId}:${endpoint}`, config.maxRequests, config.windowSeconds);
  }

  async checkIPLimit(ip: string, endpoint = 'general'): Promise<RateLimitResult> {
    const config = DEFAULT_LIMITS[endpoint] ?? DEFAULT_LIMITS.general;
    return this.checkLimit(`ip:${ip}:${endpoint}`, config.maxRequests, config.windowSeconds);
  }

  async checkTenantLimit(tenantId: string, endpoint = 'general'): Promise<RateLimitResult> {
    const config = DEFAULT_LIMITS[endpoint] ?? DEFAULT_LIMITS.general;
    return this.checkLimit(`tenant:${tenantId}:${endpoint}`, config.maxRequests * 10, config.windowSeconds);
  }

  // -------------------------------------------------------------------------
  // Reset / admin
  // -------------------------------------------------------------------------

  async resetLimit(key: string): Promise<void> {
    await this.redis.del(this.keyPrefix + key);
  }

  async getCurrentCount(key: string, windowSeconds: number): Promise<number> {
    const redisKey = this.keyPrefix + key;
    const windowStart = Date.now() - windowSeconds * 1000;
    return this.redis.zcount(redisKey, windowStart.toString(), '+inf');
  }
}
