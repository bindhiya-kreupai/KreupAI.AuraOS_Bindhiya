/**
 * Query Monitoring Middleware
 *
 * Tracks and analyzes database queries for performance optimization.
 * Provides insights into slow queries, N+1 problems, and query patterns.
 */

import { logger } from '@/lib/logger';

/**
 * Query monitoring configuration
 */
interface QueryMonitorConfig {
  enabled: boolean;
  slowQueryThreshold: number; // milliseconds
  verySlowQueryThreshold: number; // milliseconds
  maxQueryHistory: number;
  detectN1Queries: boolean;
  n1DetectionWindow: number; // milliseconds
  n1ThresholdCount: number;
}

const config: QueryMonitorConfig = {
  enabled: process.env.QUERY_MONITORING_ENABLED !== 'false',
  slowQueryThreshold: parseInt(process.env.SLOW_QUERY_THRESHOLD || '100', 10),
  verySlowQueryThreshold: parseInt(process.env.VERY_SLOW_QUERY_THRESHOLD || '500', 10),
  maxQueryHistory: parseInt(process.env.MAX_QUERY_HISTORY || '1000', 10),
  detectN1Queries: process.env.DETECT_N1_QUERIES !== 'false',
  n1DetectionWindow: parseInt(process.env.N1_DETECTION_WINDOW || '1000', 10),
  n1ThresholdCount: parseInt(process.env.N1_THRESHOLD_COUNT || '5', 10)
};

/**
 * Query record for tracking
 */
interface QueryRecord {
  id: string;
  model: string;
  action: string;
  duration: number;
  timestamp: Date;
  args?: Record<string, unknown>;
  stackTrace?: string;
  requestId?: string;
  tenantId?: string;
  userId?: string;
}

/**
 * Query statistics
 */
interface QueryStats {
  totalQueries: number;
  slowQueries: number;
  verySlowQueries: number;
  failedQueries: number;
  totalDuration: number;
  avgDuration: number;
  n1Warnings: number;
  byModel: Map<string, ModelStats>;
  byAction: Map<string, number>;
}

interface ModelStats {
  count: number;
  totalDuration: number;
  avgDuration: number;
  slowCount: number;
}

/**
 * N+1 Detection tracker
 */
interface N1Pattern {
  model: string;
  action: string;
  count: number;
  firstSeen: number;
  lastSeen: number;
  requestId?: string;
}

/**
 * Query Monitor Class
 */
class QueryMonitor {
  private static instance: QueryMonitor;
  private queryHistory: QueryRecord[] = [];
  private stats: QueryStats;
  private n1Patterns: Map<string, N1Pattern> = new Map();
  private currentRequestQueries: Map<string, QueryRecord[]> = new Map();

  private constructor() {
    this.stats = this.createEmptyStats();
    this.startCleanupInterval();
  }

  static getInstance(): QueryMonitor {
    if (!QueryMonitor.instance) {
      QueryMonitor.instance = new QueryMonitor();
    }
    return QueryMonitor.instance;
  }

  private createEmptyStats(): QueryStats {
    return {
      totalQueries: 0,
      slowQueries: 0,
      verySlowQueries: 0,
      failedQueries: 0,
      totalDuration: 0,
      avgDuration: 0,
      n1Warnings: 0,
      byModel: new Map(),
      byAction: new Map()
    };
  }

  /**
   * Record a query execution
   */
  recordQuery(record: Omit<QueryRecord, 'id' | 'timestamp'>): void {
    if (!config.enabled) return;

    const query: QueryRecord = {
      ...record,
      id: this.generateId(),
      timestamp: new Date()
    };

    // Update history
    this.queryHistory.push(query);
    if (this.queryHistory.length > config.maxQueryHistory) {
      this.queryHistory.shift();
    }

    // Update statistics
    this.updateStats(query);

    // Check for slow queries
    this.checkSlowQuery(query);

    // N+1 detection
    if (config.detectN1Queries) {
      this.detectN1Pattern(query);
    }

    // Track per-request queries
    if (query.requestId) {
      const requestQueries = this.currentRequestQueries.get(query.requestId) || [];
      requestQueries.push(query);
      this.currentRequestQueries.set(query.requestId, requestQueries);
    }
  }

  /**
   * Record a failed query
   */
  recordFailedQuery(model: string, action: string, error: Error): void {
    if (!config.enabled) return;

    this.stats.failedQueries++;

    logger.error({
      model,
      action,
      error: error.message
    }, 'Database query failed');
  }

  /**
   * Update query statistics
   */
  private updateStats(query: QueryRecord): void {
    this.stats.totalQueries++;
    this.stats.totalDuration += query.duration;
    this.stats.avgDuration = this.stats.totalDuration / this.stats.totalQueries;

    // Update model stats
    const modelStats = this.stats.byModel.get(query.model) || {
      count: 0,
      totalDuration: 0,
      avgDuration: 0,
      slowCount: 0
    };
    modelStats.count++;
    modelStats.totalDuration += query.duration;
    modelStats.avgDuration = modelStats.totalDuration / modelStats.count;
    if (query.duration > config.slowQueryThreshold) {
      modelStats.slowCount++;
    }
    this.stats.byModel.set(query.model, modelStats);

    // Update action stats
    const actionKey = `${query.model}.${query.action}`;
    const actionCount = this.stats.byAction.get(actionKey) || 0;
    this.stats.byAction.set(actionKey, actionCount + 1);
  }

  /**
   * Check for slow queries
   */
  private checkSlowQuery(query: QueryRecord): void {
    if (query.duration > config.verySlowQueryThreshold) {
      this.stats.verySlowQueries++;
      logger.warn({
        model: query.model,
        action: query.action,
        duration: query.duration,
        threshold: config.verySlowQueryThreshold,
        args: this.sanitizeArgs(query.args),
        requestId: query.requestId
      }, 'Very slow query detected');
    } else if (query.duration > config.slowQueryThreshold) {
      this.stats.slowQueries++;
      logger.info({
        model: query.model,
        action: query.action,
        duration: query.duration,
        threshold: config.slowQueryThreshold
      }, 'Slow query detected');
    }
  }

  /**
   * Detect N+1 query patterns
   */
  private detectN1Pattern(query: QueryRecord): void {
    const patternKey = `${query.requestId || 'global'}:${query.model}.${query.action}`;
    const now = Date.now();

    const pattern = this.n1Patterns.get(patternKey);

    if (pattern) {
      // Check if within detection window
      if (now - pattern.firstSeen <= config.n1DetectionWindow) {
        pattern.count++;
        pattern.lastSeen = now;

        // Trigger warning if threshold exceeded
        if (pattern.count === config.n1ThresholdCount) {
          this.stats.n1Warnings++;
          logger.warn({
            model: query.model,
            action: query.action,
            count: pattern.count,
            windowMs: config.n1DetectionWindow,
            requestId: query.requestId
          }, 'Potential N+1 query pattern detected');
        }
      } else {
        // Reset pattern
        this.n1Patterns.set(patternKey, {
          model: query.model,
          action: query.action,
          count: 1,
          firstSeen: now,
          lastSeen: now,
          requestId: query.requestId
        });
      }
    } else {
      this.n1Patterns.set(patternKey, {
        model: query.model,
        action: query.action,
        count: 1,
        firstSeen: now,
        lastSeen: now,
        requestId: query.requestId
      });
    }
  }

  /**
   * Get query statistics
   */
  getStats(): Record<string, unknown> {
    return {
      totalQueries: this.stats.totalQueries,
      slowQueries: this.stats.slowQueries,
      verySlowQueries: this.stats.verySlowQueries,
      failedQueries: this.stats.failedQueries,
      avgDuration: Math.round(this.stats.avgDuration * 100) / 100,
      n1Warnings: this.stats.n1Warnings,
      byModel: Object.fromEntries(this.stats.byModel),
      topActions: this.getTopActions(10)
    };
  }

  /**
   * Get top actions by count
   */
  private getTopActions(limit: number): Array<{ action: string; count: number }> {
    return Array.from(this.stats.byAction.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get slow queries from history
   */
  getSlowQueries(limit: number = 20): QueryRecord[] {
    return this.queryHistory
      .filter(q => q.duration > config.slowQueryThreshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
      .map(q => ({
        ...q,
        args: this.sanitizeArgs(q.args)
      }));
  }

  /**
   * Get recent queries
   */
  getRecentQueries(limit: number = 50): QueryRecord[] {
    return this.queryHistory
      .slice(-limit)
      .reverse()
      .map(q => ({
        ...q,
        args: this.sanitizeArgs(q.args)
      }));
  }

  /**
   * Get queries for a specific request
   */
  getRequestQueries(requestId: string): QueryRecord[] {
    return this.currentRequestQueries.get(requestId) || [];
  }

  /**
   * Complete request tracking
   */
  completeRequest(requestId: string): { queryCount: number; totalDuration: number } {
    const queries = this.currentRequestQueries.get(requestId) || [];
    const totalDuration = queries.reduce((sum, q) => sum + q.duration, 0);

    // Clean up
    this.currentRequestQueries.delete(requestId);

    // Log request summary if significant
    if (queries.length > 10) {
      logger.info({
        requestId,
        queryCount: queries.length,
        totalDuration
      }, 'Request completed with many queries');
    }

    return { queryCount: queries.length, totalDuration };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = this.createEmptyStats();
    this.queryHistory = [];
    this.n1Patterns.clear();
    logger.info('Query monitor statistics reset');
  }

  /**
   * Sanitize query arguments (remove sensitive data)
   */
  private sanitizeArgs(args?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!args) return undefined;

    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'privateKey', 'hash'];

    const sanitize = (obj: Record<string, unknown>): Record<string, unknown> => {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (sensitiveFields.some(f => key.toLowerCase().includes(f.toLowerCase()))) {
          result[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          result[key] = sanitize(value as Record<string, unknown>);
        } else {
          result[key] = value;
        }
      }
      return result;
    };

    return sanitize(args);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `q_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Cleanup old patterns periodically
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      const maxAge = config.n1DetectionWindow * 2;

      for (const [key, pattern] of this.n1Patterns.entries()) {
        if (now - pattern.lastSeen > maxAge) {
          this.n1Patterns.delete(key);
        }
      }

      // Clean up old request queries
      for (const [requestId, queries] of this.currentRequestQueries.entries()) {
        if (queries.length > 0) {
          const lastQuery = queries[queries.length - 1];
          if (now - lastQuery.timestamp.getTime() > 60000) { // 1 minute
            this.currentRequestQueries.delete(requestId);
          }
        }
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Check if monitoring is enabled
   */
  isEnabled(): boolean {
    return config.enabled;
  }

  /**
   * Get configuration
   */
  getConfig(): QueryMonitorConfig {
    return { ...config };
  }
}

// Export singleton instance
export const queryMonitor = QueryMonitor.getInstance();

/**
 * Prisma middleware for query monitoring
 */
export function createQueryMonitoringMiddleware(requestContext?: {
  requestId?: string;
  tenantId?: string;
  userId?: string;
}) {
  return async function queryMonitoringMiddleware(
    params: { model?: string; action: string; args?: Record<string, unknown> },
    next: (params: { model?: string; action: string; args?: Record<string, unknown> }) => Promise<unknown>
  ) {
    if (!queryMonitor.isEnabled() || !params.model) {
      return next(params);
    }

    const startTime = Date.now();

    try {
      const result = await next(params);

      const duration = Date.now() - startTime;

      queryMonitor.recordQuery({
        model: params.model,
        action: params.action,
        duration,
        args: params.args as Record<string, unknown>,
        requestId: requestContext?.requestId,
        tenantId: requestContext?.tenantId,
        userId: requestContext?.userId
      });

      return result;
    } catch (error) {
      queryMonitor.recordFailedQuery(
        params.model,
        params.action,
        error as Error
      );
      throw error;
    }
  };
}

/**
 * Express/Next.js middleware for request tracking
 */
export function createRequestTrackingMiddleware() {
  return function requestTrackingMiddleware(
    req: { headers: { 'x-request-id'?: string } },
    _res: unknown,
    next: () => void
  ) {
    const requestId = req.headers['x-request-id'] || `req_${Date.now()}`;
    // Attach to request for later use
    (req as Record<string, unknown>).queryMonitorRequestId = requestId;
    next();
  };
}

/**
 * Get query monitor instance
 */
export function getQueryMonitor(): QueryMonitor {
  return queryMonitor;
}

export default queryMonitor;
