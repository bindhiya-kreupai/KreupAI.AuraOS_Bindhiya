/**
 * @module metrics
 * @description Prometheus metrics setup for AuraOS microservices.
 *              Provides built-in HTTP/DB/queue metrics and helpers
 *              for creating custom counters, histograms, and gauges.
 *              Also exports an Express middleware for auto-recording HTTP metrics.
 */

import client, {
  type Counter,
  type Histogram,
  type Gauge,
  type Registry,
} from 'prom-client';
import type { Request, Response, NextFunction } from 'express';

// ── Types ──────────────────────────────────────────────────────────────────

export interface MetricsInstance {
  registry: Registry;
  // Built-in metrics
  httpRequestsTotal:      Counter;
  httpRequestDuration:    Histogram;
  dbQueryDuration:        Histogram;
  queueDepth:             Gauge;
  activeConnections:      Gauge;
}

// ── Module-level registry ──────────────────────────────────────────────────

let _metricsInstance: MetricsInstance | null = null;

// ── initMetrics ────────────────────────────────────────────────────────────

/**
 * Initialise Prometheus metrics for a service.
 * Registers default Node.js process metrics + AuraOS built-in metrics.
 * Call once at service startup.
 */
export function initMetrics(serviceName: string): MetricsInstance {
  if (_metricsInstance) return _metricsInstance;

  const registry = new client.Registry();

  // Default Node.js metrics (GC, memory, event loop lag, etc.)
  client.collectDefaultMetrics({
    register: registry,
    prefix:   `aura_${serviceName.replace(/-/g, '_')}_`,
  });

  // ── Built-in: HTTP request counter ────────────────────────────────────

  const httpRequestsTotal = new client.Counter({
    name:       'http_requests_total',
    help:       'Total number of HTTP requests received',
    labelNames: ['method', 'route', 'status_code', 'service'],
    registers:  [registry],
  });

  // ── Built-in: HTTP request duration histogram ──────────────────────────

  const httpRequestDuration = new client.Histogram({
    name:       'http_request_duration_seconds',
    help:       'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status_code', 'service'],
    buckets:    [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10],
    registers:  [registry],
  });

  // ── Built-in: DB query duration ────────────────────────────────────────

  const dbQueryDuration = new client.Histogram({
    name:       'db_query_duration_seconds',
    help:       'Database query duration in seconds',
    labelNames: ['model', 'action', 'service'],
    buckets:    [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
    registers:  [registry],
  });

  // ── Built-in: Queue depth gauge ────────────────────────────────────────

  const queueDepth = new client.Gauge({
    name:       'queue_depth',
    help:       'Number of messages waiting in queue',
    labelNames: ['queue_name', 'service'],
    registers:  [registry],
  });

  // ── Built-in: Active connections gauge ────────────────────────────────

  const activeConnections = new client.Gauge({
    name:       'active_connections',
    help:       'Number of active connections (DB + HTTP)',
    labelNames: ['connection_type', 'service'],
    registers:  [registry],
  });

  _metricsInstance = {
    registry,
    httpRequestsTotal,
    httpRequestDuration,
    dbQueryDuration,
    queueDepth,
    activeConnections,
  };

  console.log(`[AuraMetrics] Prometheus metrics initialized for service "${serviceName}"`);
  return _metricsInstance;
}

// ── getMetrics ─────────────────────────────────────────────────────────────

export function getMetrics(): MetricsInstance {
  if (!_metricsInstance) {
    throw new Error('[AuraMetrics] Metrics not initialized. Call initMetrics() first.');
  }
  return _metricsInstance;
}

// ── Custom metric factories ────────────────────────────────────────────────

/**
 * Create a custom Prometheus counter and register it in the service registry.
 */
export function createCounter(
  name: string,
  help: string,
  labels: string[] = [],
): Counter {
  const metrics = getMetrics();
  return new client.Counter({
    name,
    help,
    labelNames: labels,
    registers:  [metrics.registry],
  });
}

/**
 * Create a custom Prometheus histogram.
 */
export function createHistogram(
  name: string,
  help: string,
  labels: string[] = [],
  buckets: number[] = [0.01, 0.05, 0.1, 0.5, 1, 5],
): Histogram {
  const metrics = getMetrics();
  return new client.Histogram({
    name,
    help,
    labelNames: labels,
    buckets,
    registers:  [metrics.registry],
  });
}

/**
 * Create a custom Prometheus gauge.
 */
export function createGauge(
  name: string,
  help: string,
  labels: string[] = [],
): Gauge {
  const metrics = getMetrics();
  return new client.Gauge({
    name,
    help,
    labelNames: labels,
    registers:  [metrics.registry],
  });
}

// ── metricsMiddleware ──────────────────────────────────────────────────────

/**
 * Express middleware that auto-records HTTP request count and duration metrics.
 *
 * Mount BEFORE your routes:
 * ```ts
 * app.use(metricsMiddleware('my-service'));
 * ```
 */
export function metricsMiddleware(serviceName: string) {
  const metrics = _metricsInstance ?? initMetrics(serviceName);

  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = process.hrtime();

    res.on('finish', () => {
      const [secs, nanos] = process.hrtime(startTime);
      const durationSecs  = secs + nanos / 1e9;

      // Normalise route: replace path params with placeholders
      const route = normaliseRoute(req.route?.path ?? req.path ?? '/unknown');

      const labels = {
        method:      req.method,
        route,
        status_code: String(res.statusCode),
        service:     serviceName,
      };

      metrics.httpRequestsTotal.inc(labels);
      metrics.httpRequestDuration.observe(labels, durationSecs);
    });

    next();
  };
}

/**
 * Express handler for the /metrics endpoint.
 * Mount at GET /metrics.
 */
export async function metricsHandler(
  _req: Request,
  res: Response,
): Promise<void> {
  const metrics = getMetrics();
  res.set('Content-Type', client.register.contentType);
  res.end(await metrics.registry.metrics());
}

// ── DB metrics helper ──────────────────────────────────────────────────────

/**
 * Wrap a Prisma (or any DB) call with automatic duration recording.
 */
export async function measureDbQuery<T>(
  model: string,
  action: string,
  serviceName: string,
  fn: () => Promise<T>,
): Promise<T> {
  const metrics = _metricsInstance ?? initMetrics(serviceName);
  const timer   = metrics.dbQueryDuration.startTimer({ model, action, service: serviceName });
  try {
    return await fn();
  } finally {
    timer();
  }
}

// ── Private helpers ────────────────────────────────────────────────────────

function normaliseRoute(path: string): string {
  return path
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:uuid')
    .replace(/\/\d+/g, '/:id');
}
