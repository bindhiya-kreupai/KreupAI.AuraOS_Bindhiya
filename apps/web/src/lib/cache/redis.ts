/**
 * Redis Client Configuration
 * Singleton Redis client for caching and session storage
 */

import Redis from 'ioredis';
import { logger } from '@/lib/logger';
import { isBuildPhase } from '@/lib/utils/build-phase';

// Redis configuration from environment
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false';

// Default TTL (Time To Live) in seconds
export const DEFAULT_TTL = 3600; // 1 hour
export const SHORT_TTL = 300; // 5 minutes
export const LONG_TTL = 86400; // 24 hours

/**
 * Redis Client Singleton
 */
class RedisClient {
  private client: Redis | null = null;
  private isConnected: boolean = false;
  private hasLoggedConnectionError = false;

  constructor() {
    if (!REDIS_ENABLED || isBuildPhase()) {
      return;
    }

    try {
      this.client = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        lazyConnect: true,
        retryStrategy: (times) => {
          // Stop retrying after a few attempts in local/dev when Redis is down
          if (times > 5) return null;
          return Math.min(times * 200, 2000);
        },
        reconnectOnError: (err) => {
          const targetError = 'READONLY';
          if (err.message.includes(targetError)) {
            // Only reconnect when the error contains "READONLY"
            return true;
          }
          return false;
        },
      });

      // Kick off connection without blocking module load; failures are non-fatal.
      void this.client.connect().catch(() => {
        // error handler below logs once
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        this.hasLoggedConnectionError = false;
        logger.info('Redis connected successfully');
      });

      this.client.on('error', (error) => {
        this.isConnected = false;
        if (!this.hasLoggedConnectionError) {
          this.hasLoggedConnectionError = true;
          logger.error(
            { error },
            'Redis connection error — caching disabled. Set REDIS_ENABLED=false or start Redis to silence this.'
          );
        }
      });

      this.client.on('close', () => {
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        if (!this.hasLoggedConnectionError) {
          logger.info('Redis reconnecting...');
        }
      });
    } catch (error: any) {
      logger.error({ error }, 'Failed to initialize Redis client');
    }
  }

  /**
   * Get the Redis client instance
   */
  getClient(): Redis | null {
    return this.client;
  }

  /**
   * Check if Redis is connected
   */
  isReady(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Get value from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isReady()) {
      return null;
    }

    try {
      const value = await this.client!.get(key);
      if (!value) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error: any) {
      logger.error({ error, key }, 'Redis GET error');
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key: string, value: any, ttl: number = DEFAULT_TTL): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      await this.client!.setex(key, ttl, serialized);
      return true;
    } catch (error: any) {
      logger.error({ error, key }, 'Redis SET error');
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async del(key: string): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }

    try {
      await this.client!.del(key);
      return true;
    } catch (error: any) {
      logger.error({ error, key }, 'Redis DEL error');
      return false;
    }
  }

  /** Alias for `del` — kept for callers that use the longer name. */
  async delete(key: string): Promise<boolean> {
    return this.del(key);
  }

  /**
   * List keys matching a glob pattern. Prefer `delPattern` for delete
   * workflows; this is for cases that need to inspect each key first.
   */
  async keys(pattern: string): Promise<string[]> {
    if (!this.isReady()) {
      return [];
    }
    try {
      return await this.client!.keys(pattern);
    } catch (error: any) {
      logger.error({ error, pattern }, 'Redis KEYS error');
      return [];
    }
  }

  /**
   * Delete multiple keys from cache
   */
  async delMany(keys: string[]): Promise<boolean> {
    if (!this.isReady() || keys.length === 0) {
      return false;
    }

    try {
      await this.client!.del(...keys);
      return true;
    } catch (error: any) {
      logger.error({ error, keys }, 'Redis DEL MANY error');
      return false;
    }
  }

  /**
   * Delete keys by pattern
   */
  async delPattern(pattern: string): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }

    try {
      const keys = await this.client!.keys(pattern);
      if (keys.length > 0) {
        await this.client!.del(...keys);
      }
      return true;
    } catch (error: any) {
      logger.error({ error, pattern }, 'Redis DEL PATTERN error');
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }

    try {
      const result = await this.client!.exists(key);
      return result === 1;
    } catch (error: any) {
      logger.error({ error, key }, 'Redis EXISTS error');
      return false;
    }
  }

  /**
   * Set expiration time for a key
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }

    try {
      await this.client!.expire(key, ttl);
      return true;
    } catch (error: any) {
      logger.error({ error, key, ttl }, 'Redis EXPIRE error');
      return false;
    }
  }

  /**
   * Get TTL for a key
   */
  async ttl(key: string): Promise<number> {
    if (!this.isReady()) {
      return -1;
    }

    try {
      return await this.client!.ttl(key);
    } catch (error: any) {
      logger.error({ error, key }, 'Redis TTL error');
      return -1;
    }
  }

  /**
   * Increment value
   */
  async incr(key: string): Promise<number | null> {
    if (!this.isReady()) {
      return null;
    }

    try {
      return await this.client!.incr(key);
    } catch (error: any) {
      logger.error({ error, key }, 'Redis INCR error');
      return null;
    }
  }

  /**
   * Decrement value
   */
  async decr(key: string): Promise<number | null> {
    if (!this.isReady()) {
      return null;
    }

    try {
      return await this.client!.decr(key);
    } catch (error: any) {
      logger.error({ error, key }, 'Redis DECR error');
      return null;
    }
  }

  /**
   * Flush all keys (use with caution!)
   */
  async flushAll(): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }

    try {
      await this.client!.flushall();
      logger.warn('Redis FLUSHALL executed - all keys deleted');
      return true;
    } catch (error: any) {
      logger.error({ error }, 'Redis FLUSHALL error');
      return false;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis disconnected');
    }
  }
}

let redisInstance: RedisClient | undefined;

export function getRedisClient(): RedisClient {
  if (!redisInstance) {
    redisInstance = new RedisClient();
  }
  return redisInstance;
}

// Proxy export for 100% backward compatibility with lazy evaluation
export const redis = new Proxy({} as RedisClient, {
  get(_target, prop) {
    const instance = getRedisClient();
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

// Export for testing
export { RedisClient };
