/**
 * Redis Client Configuration
 * Singleton Redis client for caching and session storage
 */

import Redis from 'ioredis';
import { logger } from '@/lib/logger';

// Redis configuration from environment
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
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

  constructor() {
    if (!REDIS_ENABLED) {
      logger.info('Redis is disabled. Caching will be skipped.');
      return;
    }

    try {
      this.client = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
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

      this.client.on('connect', () => {
        this.isConnected = true;
        logger.info('Redis connected successfully');
      });

      this.client.on('error', (error) => {
        this.isConnected = false;
        logger.error({ error }, 'Redis connection error');
      });

      this.client.on('close', () => {
        this.isConnected = false;
        logger.warn('Redis connection closed');
      });

      this.client.on('reconnecting', () => {
        logger.info('Redis reconnecting...');
      });
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      logger.error({ error, key }, 'Redis DEL error');
      return false;
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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

// Export singleton instance
export const redis = new RedisClient();

// Export for testing
export { RedisClient };
