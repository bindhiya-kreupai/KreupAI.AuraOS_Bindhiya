/**
 * Redis Client Singleton
 */

import Redis from 'ioredis';
import { logger } from '../utils/logger';
import { config } from '../config';

export const redis = new Redis(config.redis.url, {
  password: config.redis.password || undefined,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    logger.warn({ attempt: times, delay }, 'Redis connection retry');
    return delay;
  },
  reconnectOnError: (err) => {
    logger.error({ err }, 'Redis connection error');
    return true;
  },
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('ready', () => {
  logger.info('Redis ready');
});

redis.on('error', (err) => {
  logger.error({ err }, 'Redis error');
});

redis.on('close', () => {
  logger.info('Redis connection closed');
});

redis.on('reconnecting', () => {
  logger.info('Redis reconnecting');
});
