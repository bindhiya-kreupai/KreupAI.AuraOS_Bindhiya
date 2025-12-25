/**
 * Database Query Performance Monitoring
 * Tracks query execution time, slow queries, and connection pool metrics
 */

import type { Prisma} from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';

// Performance thresholds (in milliseconds)
export const QUERY_THRESHOLDS = {
  SLOW: 100, // Queries slower than 100ms are considered slow
  VERY_SLOW: 500, // Queries slower than 500ms are very slow
  CRITICAL: 1000, // Queries slower than 1s are critical
} as const;

// Query statistics tracking
interface QueryStats {
  totalQueries: number;
  slowQueries: number;
  verySlowQueries: number;
  criticalQueries: number;
  totalDuration: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
}

class QueryMonitor {
  private stats: QueryStats = {
    totalQueries: 0,
    slowQueries: 0,
    verySlowQueries: 0,
    criticalQueries: 0,
    totalDuration: 0,
    averageDuration: 0,
    minDuration: Infinity,
    maxDuration: 0,
  };

  private recentQueries: Array<{
    query: string;
    duration: number;
    timestamp: Date;
    params?: any;
  }> = [];

  private readonly MAX_RECENT_QUERIES = 100;

  /**
   * Track a query execution
   */
  trackQuery(query: string, duration: number, params?: any): void {
    // Update statistics
    this.stats.totalQueries++;
    this.stats.totalDuration += duration;
    this.stats.averageDuration = this.stats.totalDuration / this.stats.totalQueries;
    this.stats.minDuration = Math.min(this.stats.minDuration, duration);
    this.stats.maxDuration = Math.max(this.stats.maxDuration, duration);

    // Track slow queries
    if (duration >= QUERY_THRESHOLDS.CRITICAL) {
      this.stats.criticalQueries++;
      this.logSlowQuery(query, duration, 'critical', params);
    } else if (duration >= QUERY_THRESHOLDS.VERY_SLOW) {
      this.stats.verySlowQueries++;
      this.logSlowQuery(query, duration, 'very_slow', params);
    } else if (duration >= QUERY_THRESHOLDS.SLOW) {
      this.stats.slowQueries++;
      this.logSlowQuery(query, duration, 'slow', params);
    }

    // Store in recent queries (for debugging)
    this.recentQueries.push({
      query,
      duration,
      timestamp: new Date(),
      params,
    });

    // Keep only recent queries
    if (this.recentQueries.length > this.MAX_RECENT_QUERIES) {
      this.recentQueries.shift();
    }
  }

  /**
   * Log slow query with appropriate severity
   */
  private logSlowQuery(
    query: string,
    duration: number,
    severity: 'slow' | 'very_slow' | 'critical',
    params?: any
  ): void {
    const logLevel = severity === 'critical' ? 'error' : 'warn';
    const message = `${severity.toUpperCase()} query detected: ${duration}ms`;

    logger[logLevel](
      {
        query,
        duration,
        severity,
        params: params ? this.sanitizeParams(params) : undefined,
        threshold: QUERY_THRESHOLDS[severity.toUpperCase() as keyof typeof QUERY_THRESHOLDS],
      },
      message
    );

    // Send critical queries to Sentry
    if (severity === 'critical') {
      Sentry.captureMessage(`Critical slow query: ${duration}ms`, {
        level: 'warning',
        contexts: {
          query: {
            sql: query,
            duration,
            params: params ? this.sanitizeParams(params) : undefined,
          },
        },
        tags: {
          performance_issue: 'slow_query',
          severity,
        },
      });
    }
  }

  /**
   * Sanitize query parameters to prevent sensitive data logging
   */
  private sanitizeParams(params: any): any {
    if (!params || typeof params !== 'object') {
      return params;
    }

    const sanitized = { ...params };
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'accessToken'];

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Get current statistics
   */
  getStats(): QueryStats {
    return { ...this.stats };
  }

  /**
   * Get recent slow queries
   */
  getRecentSlowQueries(minDuration: number = QUERY_THRESHOLDS.SLOW): Array<{
    query: string;
    duration: number;
    timestamp: Date;
  }> {
    return this.recentQueries
      .filter((q) => q.duration >= minDuration)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 20)
      .map(({ query, duration, timestamp }) => ({ query, duration, timestamp }));
  }

  /**
   * Reset statistics
   */
  reset(): void {
    this.stats = {
      totalQueries: 0,
      slowQueries: 0,
      verySlowQueries: 0,
      criticalQueries: 0,
      totalDuration: 0,
      averageDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
    };
    this.recentQueries = [];
  }

  /**
   * Get performance summary
   */
  getSummary(): {
    stats: QueryStats;
    slowQueryPercentage: number;
    criticalQueryPercentage: number;
    topSlowQueries: Array<{ query: string; duration: number; timestamp: Date }>;
  } {
    const stats = this.getStats();
    return {
      stats,
      slowQueryPercentage:
        stats.totalQueries > 0 ? (stats.slowQueries / stats.totalQueries) * 100 : 0,
      criticalQueryPercentage:
        stats.totalQueries > 0 ? (stats.criticalQueries / stats.totalQueries) * 100 : 0,
      topSlowQueries: this.getRecentSlowQueries(),
    };
  }
}

// Export singleton instance
export const queryMonitor = new QueryMonitor();

/**
 * Create Prisma client with query monitoring middleware
 */
export function createMonitoredPrismaClient(): PrismaClient {
  const prisma = new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  });

  // Track query events
  prisma.$on('query' as never, (e: Prisma.QueryEvent) => {
    const duration = e.duration;
    const query = e.query;
    const params = e.params;

    queryMonitor.trackQuery(query, duration, params);

    // Log all queries in development
    if (process.env.NODE_ENV === 'development') {
      logger.debug(
        {
          query,
          duration,
          params,
        },
        'Prisma query executed'
      );
    }
  });

  // Track errors
  prisma.$on('error' as never, (e: Prisma.LogEvent) => {
    logger.error({ event: e }, 'Prisma error occurred');
    Sentry.captureException(new Error(e.message), {
      contexts: {
        prisma: {
          target: e.target,
          timestamp: e.timestamp,
        },
      },
      tags: {
        error_type: 'database',
      },
    });
  });

  // Track warnings
  prisma.$on('warn' as never, (e: Prisma.LogEvent) => {
    logger.warn({ event: e }, 'Prisma warning');
  });

  return prisma;
}

/**
 * Middleware to add query monitoring to existing Prisma client
 */
export async function addQueryMonitoring(prisma: PrismaClient): Promise<void> {
  prisma.$use(async (params, next) => {
    const startTime = Date.now();

    try {
      const result = await next(params);
      const duration = Date.now() - startTime;

      // Track the query
      const query = `${params.model}.${params.action}`;
      queryMonitor.trackQuery(query, duration, params.args);

      return result;
    } catch {
      const duration = Date.now() - startTime;

      // Log failed query
      logger.error(
        {
          model: params.model,
          action: params.action,
          duration,
          error,
        },
        'Query failed'
      );

      throw error;
    }
  });
}

/**
 * Get connection pool metrics (if available)
 */
export async function getConnectionPoolMetrics(
  prisma: PrismaClient
): Promise<{
  activeConnections?: number;
  idleConnections?: number;
  totalConnections?: number;
} | null> {
  try {
    // Prisma doesn't expose pool metrics directly, but we can check connection status
    await prisma.$queryRaw`SELECT 1`;
    return {
      // These would need to be tracked via database-specific queries
      // For now, just return null to indicate metrics are not available
    };
  } catch {
    logger.error({ error }, 'Failed to get connection pool metrics');
    return null;
  }
}

/**
 * Export monitoring stats for health check endpoints
 */
export function getMonitoringStats() {
  return {
    queries: queryMonitor.getSummary(),
    timestamp: new Date().toISOString(),
  };
}
