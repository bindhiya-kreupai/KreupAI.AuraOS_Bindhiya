/**
 * Metrics Collection and Reporting
 *
 * @module @aura/monitoring
 */

import { BUSINESS_METRICS } from '../config/apm.config';

export class MetricsCollector {
  private metrics: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();

  /**
   * Increment a counter metric
   */
  increment(metricName: string, value: number = 1, tags?: Record<string, string>): void {
    const current = this.metrics.get(metricName) || 0;
    this.metrics.set(metricName, current + value);
    this.reportToDatadog('increment', metricName, value, tags);
  }

  /**
   * Set a gauge metric
   */
  gauge(metricName: string, value: number, tags?: Record<string, string>): void {
    this.metrics.set(metricName, value);
    this.reportToDatadog('gauge', metricName, value, tags);
  }

  /**
   * Record a histogram value
   */
  histogram(metricName: string, value: number, tags?: Record<string, string>): void {
    const values = this.histograms.get(metricName) || [];
    values.push(value);
    this.histograms.set(metricName, values);
    this.reportToDatadog('histogram', metricName, value, tags);
  }

  /**
   * Record API latency
   */
  recordAPILatency(endpoint: string, method: string, latency: number, statusCode: number): void {
    this.histogram('aura.api.latency', latency, {
      endpoint,
      method,
      status: statusCode.toString(),
    });
  }

  /**
   * Record database query time
   */
  recordDBQueryTime(query: string, duration: number): void {
    this.histogram('aura.db.query.time', duration, {
      query: this.sanitizeQuery(query),
    });
  }

  /**
   * Record cache hit/miss
   */
  recordCacheAccess(hit: boolean, key: string): void {
    this.increment('aura.cache.access', 1, {
      hit: hit.toString(),
      key: this.sanitizeKey(key),
    });
  }

  /**
   * Record business event
   */
  recordBusinessEvent(event: string, value: number = 1, tags?: Record<string, string>): void {
    this.increment(event, value, tags);
  }

  /**
   * Get metric value
   */
  getMetric(name: string): number | undefined {
    return this.metrics.get(name);
  }

  /**
   * Get histogram statistics
   */
  getHistogramStats(name: string): {
    count: number;
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  } | null {
    const values = this.histograms.get(name);
    if (!values || values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const count = sorted.length;

    return {
      count,
      min: sorted[0],
      max: sorted[count - 1],
      avg: sorted.reduce((a, b) => a + b, 0) / count,
      p50: sorted[Math.floor(count * 0.5)],
      p95: sorted[Math.floor(count * 0.95)],
      p99: sorted[Math.floor(count * 0.99)],
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics.clear();
    this.histograms.clear();
  }

  /**
   * Report metric to Datadog (mock implementation)
   */
  private reportToDatadog(
    type: string,
    name: string,
    value: number,
    tags?: Record<string, string>
  ): void {
    // In production, this would use the Datadog client
    if (process.env.NODE_ENV === 'development') {
      const tagStr = tags ? Object.entries(tags).map(([k, v]) => `${k}:${v}`).join(',') : '';
      console.debug(`[Metric] ${type} ${name}=${value} ${tagStr}`);
    }
  }

  /**
   * Sanitize SQL query for logging
   */
  private sanitizeQuery(query: string): string {
    return query
      .replace(/\s+/g, ' ')
      .substring(0, 100)
      .replace(/'/g, '')
      .trim();
  }

  /**
   * Sanitize cache key
   */
  private sanitizeKey(key: string): string {
    return key.split(':')[0]; // Only keep the prefix
  }
}

// Singleton instance
let metricsInstance: MetricsCollector | null = null;

export function getMetricsCollector(): MetricsCollector {
  if (!metricsInstance) {
    metricsInstance = new MetricsCollector();
  }
  return metricsInstance;
}

/**
 * Middleware to track API metrics
 */
export function trackAPIMetrics(
  endpoint: string,
  method: string,
  startTime: number,
  statusCode: number
): void {
  const metrics = getMetricsCollector();
  const latency = Date.now() - startTime;

  metrics.recordAPILatency(endpoint, method, latency, statusCode);
  metrics.increment('aura.api.requests', 1, {
    endpoint,
    method,
    status: statusCode.toString(),
  });

  if (statusCode >= 400) {
    metrics.increment('aura.api.errors', 1, {
      endpoint,
      method,
      status: statusCode.toString(),
    });
  }
}
