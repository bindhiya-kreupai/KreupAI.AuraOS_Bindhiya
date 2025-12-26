/**
 * N+1 Query Detection Utility
 * Monitors and detects N+1 query patterns in database operations
 */

import { logger } from '@/lib/logger';

interface QueryLog {
  query: string;
  timestamp: number;
  stackTrace: string;
  duration?: number;
}

interface QueryPattern {
  baseQuery: string;
  count: number;
  variations: Set<string>;
  firstSeen: number;
  lastSeen: number;
  stackTrace: string;
}

// Query detection configuration
const DETECTION_CONFIG = {
  ENABLE_DETECTION: process.env.NODE_ENV === 'development',
  TIME_WINDOW_MS: 1000, // 1 second window
  SUSPICIOUS_THRESHOLD: 5, // 5+ similar queries = suspicious
  N_PLUS_ONE_THRESHOLD: 10, // 10+ similar queries = likely N+1
} as const;

// Query logs storage
const queryLogs: QueryLog[] = [];
const MAX_QUERY_LOGS = 1000;

/**
 * Query Detective - N+1 Detection
 */
export class QueryDetective {
  private static enabled = DETECTION_CONFIG.ENABLE_DETECTION;

  /**
   * Enable query detection
   */
  static enable(): void {
    this.enabled = true;
    logger.info('N+1 Query detection enabled');
  }

  /**
   * Disable query detection
   */
  static disable(): void {
    this.enabled = false;
    logger.info('N+1 Query detection disabled');
  }

  /**
   * Log a database query
   */
  static logQuery(query: string, duration?: number): void {
    if (!this.enabled) return;

    const stackTrace = new Error().stack || '';

    queryLogs.push({
      query: this.normalizeQuery(query),
      timestamp: Date.now(),
      stackTrace,
      duration,
    });

    // Keep only recent logs
    if (queryLogs.length > MAX_QUERY_LOGS) {
      queryLogs.shift();
    }

    // Analyze queries in real-time
    this.analyzeQueries();
  }

  /**
   * Normalize query for pattern matching
   * Removes specific IDs and parameters to identify patterns
   */
  private static normalizeQuery(query: string): string {
    return query
      .replace(/'[^']*'/g, '?') // Replace string literals
      .replace(/\d+/g, '?') // Replace numbers
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .toLowerCase();
  }

  /**
   * Analyze queries for N+1 patterns
   */
  private static analyzeQueries(): void {
    const now = Date.now();
    const windowStart = now - DETECTION_CONFIG.TIME_WINDOW_MS;

    // Get recent queries within time window
    const recentQueries = queryLogs.filter((log) => log.timestamp >= windowStart);

    if (recentQueries.length < DETECTION_CONFIG.SUSPICIOUS_THRESHOLD) {
      return;
    }

    // Group queries by pattern
    const patterns = new Map<string, QueryPattern>();

    recentQueries.forEach((log) => {
      const baseQuery = this.getBaseQueryPattern(log.query);

      if (!patterns.has(baseQuery)) {
        patterns.set(baseQuery, {
          baseQuery,
          count: 0,
          variations: new Set(),
          firstSeen: log.timestamp,
          lastSeen: log.timestamp,
          stackTrace: log.stackTrace,
        });
      }

      const pattern = patterns.get(baseQuery)!;
      pattern.count++;
      pattern.variations.add(log.query);
      pattern.lastSeen = log.timestamp;
    });

    // Check for N+1 patterns
    patterns.forEach((pattern) => {
      if (pattern.count >= DETECTION_CONFIG.N_PLUS_ONE_THRESHOLD) {
        this.reportNPlusOne(pattern, 'CRITICAL');
      } else if (pattern.count >= DETECTION_CONFIG.SUSPICIOUS_THRESHOLD) {
        this.reportNPlusOne(pattern, 'WARNING');
      }
    });
  }

  /**
   * Get base query pattern (remove WHERE conditions)
   */
  private static getBaseQueryPattern(query: string): string {
    // Remove WHERE clauses to identify base query pattern
    return query.split('where')[0].trim();
  }

  /**
   * Report potential N+1 query
   */
  private static reportNPlusOne(pattern: QueryPattern, severity: 'WARNING' | 'CRITICAL'): void {
    const message = `${severity === 'CRITICAL' ? '🚨' : '⚠️'} Potential N+1 Query Detected`;

    const details = {
      severity,
      queryPattern: pattern.baseQuery,
      executionCount: pattern.count,
      variations: pattern.variations.size,
      timeSpan: `${pattern.lastSeen - pattern.firstSeen}ms`,
      suggestion: this.getSuggestion(pattern),
      stackTrace: this.extractRelevantStack(pattern.stackTrace),
    };

    if (severity === 'CRITICAL') {
      logger.error(details, message);
    } else {
      logger.warn(details, message);
    }
  }

  /**
   * Extract relevant parts of stack trace (skip internal frames)
   */
  private static extractRelevantStack(stackTrace: string): string {
    const lines = stackTrace.split('\n');
    const relevantLines = lines.filter(
      (line) =>
        !line.includes('node_modules') &&
        !line.includes('node:internal') &&
        !line.includes('query-detective')
    );
    return relevantLines.slice(0, 5).join('\n');
  }

  /**
   * Get optimization suggestion
   */
  private static getSuggestion(pattern: QueryPattern): string {
    const query = pattern.baseQuery;

    if (query.includes('select') && query.includes('from')) {
      return `Consider using 'include' or 'select' with Prisma to eager load related data instead of lazy loading in a loop.`;
    }

    if (query.includes('findunique') || query.includes('findmany')) {
      return `Use 'findMany' with 'where: { id: { in: [ids] } }' to fetch multiple records in one query.`;
    }

    return 'Review the code path and batch database queries where possible.';
  }

  /**
   * Get query statistics
   */
  static getStats(): {
    totalQueries: number;
    uniquePatterns: number;
    averageQueriesPerSecond: number;
    suspiciousPatterns: number;
  } {
    const now = Date.now();
    const windowStart = now - 60000; // Last minute

    const recentQueries = queryLogs.filter((log) => log.timestamp >= windowStart);
    const patterns = new Set(recentQueries.map((log) => this.normalizeQuery(log.query)));

    // Group and count
    const patternCounts = new Map<string, number>();
    recentQueries.forEach((log) => {
      const pattern = this.normalizeQuery(log.query);
      patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
    });

    const suspiciousPatterns = Array.from(patternCounts.values()).filter(
      (count) => count >= DETECTION_CONFIG.SUSPICIOUS_THRESHOLD
    ).length;

    return {
      totalQueries: recentQueries.length,
      uniquePatterns: patterns.size,
      averageQueriesPerSecond: Math.round((recentQueries.length / 60) * 10) / 10,
      suspiciousPatterns,
    };
  }

  /**
   * Clear query logs
   */
  static clear(): void {
    queryLogs.length = 0;
    logger.info('Query logs cleared');
  }

  /**
   * Get all query logs
   */
  static getLogs(limit: number = 100): QueryLog[] {
    return queryLogs.slice(-limit);
  }
}

/**
 * Prisma middleware for automatic query logging
 *
 * Add to your Prisma client:
 * ```typescript
 * import { queryDetectiveMiddleware } from '@/lib/utils/query-detective';
 *
 * prisma.$use(queryDetectiveMiddleware);
 * ```
 */
export async function queryDetectiveMiddleware(params: any, next: any) {
  const startTime = performance.now();

  // Log query
  const query = `${params.model}.${params.action}`;
  QueryDetective.logQuery(query);

  // Execute query
  const result = await next(params);

  // Log duration
  const duration = Math.round(performance.now() - startTime);
  if (duration > 100) {
    logger.warn(
      {
        query,
        duration: `${duration}ms`,
        model: params.model,
        action: params.action,
      },
      'Slow database query'
    );
  }

  return result;
}

/**
 * Helper to detect N+1 in loops
 *
 * Usage:
 * ```typescript
 * const detector = new LoopQueryDetector('fetchEmployeeDetails');
 *
 * for (const employee of employees) {
 *   detector.recordQuery();
 *   const details = await getEmployeeDetails(employee.id);
 * }
 *
 * detector.report();
 * ```
 */
export class LoopQueryDetector {
  private queryCount = 0;
  private startTime = performance.now();

  constructor(private operationName: string) {}

  recordQuery(): void {
    this.queryCount++;
  }

  report(): void {
    const duration = Math.round(performance.now() - this.startTime);

    if (this.queryCount >= DETECTION_CONFIG.SUSPICIOUS_THRESHOLD) {
      logger.warn(
        {
          operation: this.operationName,
          queryCount: this.queryCount,
          duration: `${duration}ms`,
          averagePerQuery: `${Math.round(duration / this.queryCount)}ms`,
        },
        '⚠️  Multiple queries in loop detected - potential N+1'
      );
    }
  }

  getCount(): number {
    return this.queryCount;
  }
}

// Export singleton
export const queryDetective = QueryDetective;
