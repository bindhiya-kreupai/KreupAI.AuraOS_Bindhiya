/**
 * Prisma APM Middleware
 *
 * Automatically tracks all Prisma database queries for performance monitoring
 */

import { Prisma } from '@prisma/client';
import { apm } from './apm';
import { logger } from '../logger';

/**
 * Query statistics
 */
interface QueryStats {
  model: string;
  action: string;
  count: number;
  totalDuration: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  lastExecuted: Date;
}

/**
 * Query performance tracker
 */
class PrismaAPMTracker {
  private stats: Map<string, QueryStats> = new Map();
  private slowQueryThreshold: number = parseInt(process.env.SLOW_QUERY_THRESHOLD || '100', 10);

  /**
   * Track a query execution
   */
  trackQuery(model: string, action: string, duration: number) {
    const key = `${model}.${action}`;
    const existing = this.stats.get(key);

    if (existing) {
      existing.count++;
      existing.totalDuration += duration;
      existing.avgDuration = existing.totalDuration / existing.count;
      existing.minDuration = Math.min(existing.minDuration, duration);
      existing.maxDuration = Math.max(existing.maxDuration, duration);
      existing.lastExecuted = new Date();
    } else {
      this.stats.set(key, {
        model,
        action,
        count: 1,
        totalDuration: duration,
        avgDuration: duration,
        minDuration: duration,
        maxDuration: duration,
        lastExecuted: new Date()
      });
    }

    // Log slow queries
    if (duration > this.slowQueryThreshold) {
      logger.warn({
        model,
        action,
        duration,
        threshold: this.slowQueryThreshold
      }, 'Slow Prisma query detected');
    }
  }

  /**
   * Get query statistics
   */
  getStats(): QueryStats[] {
    return Array.from(this.stats.values());
  }

  /**
   * Get top slow queries
   */
  getSlowQueries(limit: number = 10): QueryStats[] {
    return Array.from(this.stats.values())
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, limit);
  }

  /**
   * Get most frequent queries
   */
  getFrequentQueries(limit: number = 10): QueryStats[] {
    return Array.from(this.stats.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Reset statistics
   */
  reset() {
    this.stats.clear();
  }
}

// Singleton instance
export const prismaAPMTracker = new PrismaAPMTracker();

/**
 * Prisma middleware for APM tracking
 */
export const prismaAPMMiddleware: Prisma.Middleware = async (params, next) => {
  // Skip if APM is not enabled
  if (!apm.isEnabled()) {
    return next(params);
  }

  const startTime = Date.now();
  const operation = `${params.model}.${params.action}`;

  // Start APM span
  const span = apm.startSpan(operation, 'db.query');

  // Add query metadata
  span.metadata = {
    model: params.model,
    action: params.action,
    args: sanitizeArgs(params.args)
  };

  try {
    // Execute query
    const result = await next(params);

    // Calculate duration
    const duration = Date.now() - startTime;

    // End span
    span.endTime = Date.now();
    span.duration = duration;
    apm.endSpan(span);

    // Track statistics
    if (params.model) {
      prismaAPMTracker.trackQuery(params.model, params.action, duration);
    }

    // Log query details in development
    if (process.env.NODE_ENV === 'development' && process.env.LOG_QUERIES === 'true') {
      logger.debug({
        model: params.model,
        action: params.action,
        duration,
        args: sanitizeArgs(params.args)
      }, 'Prisma query executed');
    }

    return result;
  } catch (error) {
    // End span with error
    const duration = Date.now() - startTime;
    span.endTime = Date.now();
    span.duration = duration;
    apm.endSpan(span);

    // Record error in APM
    apm.recordError(error as Error);

    // Log error
    logger.error({
      model: params.model,
      action: params.action,
      duration,
      error
    }, 'Prisma query failed');

    throw error;
  }
};

/**
 * Sanitize query arguments (remove sensitive data)
 */
function sanitizeArgs(args: any): any {
  if (!args) return args;

  const sanitized = { ...args };

  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'privateKey'];

  function removeSensitiveData(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;

    if (Array.isArray(obj)) {
      return obj.map(removeSensitiveData);
    }

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        result[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        result[key] = removeSensitiveData(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  return removeSensitiveData(sanitized);
}

/**
 * Get Prisma query statistics
 */
export function getPrismaQueryStats() {
  return {
    all: prismaAPMTracker.getStats(),
    slowest: prismaAPMTracker.getSlowQueries(),
    frequent: prismaAPMTracker.getFrequentQueries()
  };
}

/**
 * Reset Prisma query statistics
 */
export function resetPrismaQueryStats() {
  prismaAPMTracker.reset();
}
