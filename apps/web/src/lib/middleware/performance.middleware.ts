/**
 * Performance Monitoring Middleware
 * Tracks API response times and detects slow queries
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export interface PerformanceMetrics {
  endpoint: string;
  method: string;
  duration: number;
  timestamp: string;
  status: number;
  cacheHit?: boolean;
}

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  FAST: 100, // < 100ms = Fast
  MODERATE: 500, // 100-500ms = Moderate
  SLOW: 1000, // 500-1000ms = Slow
  VERY_SLOW: 2000, // > 2000ms = Very Slow (alert)
} as const;

// In-memory metrics storage (replace with proper metrics service in production)
const metricsStore: PerformanceMetrics[] = [];
const MAX_METRICS_STORE_SIZE = 1000;

/**
 * Performance monitoring middleware
 *
 * Usage:
 * ```typescript
 * export const GET = withPerformanceMonitoring(
 *   async (request) => {
 *     // your handler
 *   }
 * );
 * ```
 */
export function withPerformanceMonitoring<
  T extends (request: NextRequest, context?: any) => Promise<NextResponse>
>(handler: T): T {
  return (async (request: NextRequest, context?: any) => {
    const startTime = performance.now();
    const endpoint = new URL(request.url).pathname;
    const method = request.method;

    try {
      // Execute handler
      const response = await handler(request, context);

      // Calculate duration
      const duration = Math.round(performance.now() - startTime);

      // Check cache header
      const cacheHit = response.headers.get('X-Cache') === 'HIT';

      // Store metrics
      const metric: PerformanceMetrics = {
        endpoint,
        method,
        duration,
        timestamp: new Date().toISOString(),
        status: response.status,
        cacheHit,
      };

      // Add to metrics store
      metricsStore.push(metric);
      if (metricsStore.length > MAX_METRICS_STORE_SIZE) {
        metricsStore.shift(); // Remove oldest
      }

      // Log performance
      logPerformance(metric);

      // Add performance headers
      const clonedResponse = response.clone();
      const body = await clonedResponse.json();

      return NextResponse.json(body, {
        status: response.status,
        headers: {
          ...Object.fromEntries(response.headers),
          'X-Response-Time': `${duration}ms`,
          'X-Performance-Level': getPerformanceLevel(duration),
        },
      });
    } catch (error: any) {
      const duration = Math.round(performance.now() - startTime);

      logger.error(
        {
          error,
          endpoint,
          method,
          duration,
        },
        'Request failed'
      );

      throw error;
    }
  }) as T;
}

/**
 * Get performance level based on duration
 */
function getPerformanceLevel(duration: number): string {
  if (duration < PERFORMANCE_THRESHOLDS.FAST) return 'FAST';
  if (duration < PERFORMANCE_THRESHOLDS.MODERATE) return 'MODERATE';
  if (duration < PERFORMANCE_THRESHOLDS.SLOW) return 'SLOW';
  if (duration < PERFORMANCE_THRESHOLDS.VERY_SLOW) return 'VERY_SLOW';
  return 'CRITICAL';
}

/**
 * Log performance metrics
 */
function logPerformance(metric: PerformanceMetrics): void {
  const level = getPerformanceLevel(metric.duration);

  const logData = {
    endpoint: metric.endpoint,
    method: metric.method,
    duration: `${metric.duration}ms`,
    status: metric.status,
    cacheHit: metric.cacheHit,
    level,
  };

  if (level === 'CRITICAL' || level === 'VERY_SLOW') {
    logger.warn(logData, '⚠️  SLOW API Response');
  } else if (level === 'SLOW') {
    logger.info(logData, 'Moderate API Response');
  } else {
    logger.debug(logData, 'API Response');
  }
}

/**
 * Get performance statistics
 */
export function getPerformanceStats(options: {
  endpoint?: string;
  method?: string;
  lastMinutes?: number;
}): {
  total: number;
  average: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
  cacheHitRate?: number;
} {
  let filteredMetrics = [...metricsStore];

  // Filter by endpoint
  if (options.endpoint) {
    filteredMetrics = filteredMetrics.filter((m) => m.endpoint.includes(options.endpoint!));
  }

  // Filter by method
  if (options.method) {
    filteredMetrics = filteredMetrics.filter((m) => m.method === options.method);
  }

  // Filter by time
  if (options.lastMinutes) {
    const cutoff = new Date(Date.now() - options.lastMinutes * 60 * 1000);
    filteredMetrics = filteredMetrics.filter((m) => new Date(m.timestamp) > cutoff);
  }

  if (filteredMetrics.length === 0) {
    return {
      total: 0,
      average: 0,
      min: 0,
      max: 0,
      p50: 0,
      p95: 0,
      p99: 0,
    };
  }

  // Calculate statistics
  const durations = filteredMetrics.map((m) => m.duration).sort((a, b) => a - b);
  const total = filteredMetrics.length;
  const sum = durations.reduce((acc, d) => acc + d, 0);

  const average = Math.round(sum / total);
  const min = durations[0];
  const max = durations[durations.length - 1];
  const p50 = durations[Math.floor(total * 0.5)];
  const p95 = durations[Math.floor(total * 0.95)];
  const p99 = durations[Math.floor(total * 0.99)];

  // Calculate cache hit rate
  const cacheHits = filteredMetrics.filter((m) => m.cacheHit).length;
  const cacheHitRate = total > 0 ? Math.round((cacheHits / total) * 100) : undefined;

  return {
    total,
    average,
    min,
    max,
    p50,
    p95,
    p99,
    cacheHitRate,
  };
}

/**
 * Get slow endpoints
 */
export function getSlowEndpoints(threshold: number = PERFORMANCE_THRESHOLDS.SLOW): {
  endpoint: string;
  averageDuration: number;
  count: number;
}[] {
  const endpointMetrics = new Map<string, number[]>();

  // Group by endpoint
  metricsStore.forEach((metric) => {
    if (!endpointMetrics.has(metric.endpoint)) {
      endpointMetrics.set(metric.endpoint, []);
    }
    endpointMetrics.get(metric.endpoint)!.push(metric.duration);
  });

  // Calculate averages and filter slow endpoints
  const slowEndpoints: { endpoint: string; averageDuration: number; count: number }[] = [];

  endpointMetrics.forEach((durations, endpoint) => {
    const average = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    if (average > threshold) {
      slowEndpoints.push({
        endpoint,
        averageDuration: average,
        count: durations.length,
      });
    }
  });

  return slowEndpoints.sort((a, b) => b.averageDuration - a.averageDuration);
}

/**
 * Clear metrics store
 */
export function clearMetrics(): void {
  metricsStore.length = 0;
  logger.info('Performance metrics cleared');
}

/**
 * Export metrics for external monitoring systems
 */
export function exportMetrics(): PerformanceMetrics[] {
  return [...metricsStore];
}
