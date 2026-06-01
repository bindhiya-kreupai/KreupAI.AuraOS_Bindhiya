/**
 * Metrics API Endpoint
 *
 * Provides application metrics for monitoring dashboards (Prometheus, Grafana, etc.)
 * This is a protected endpoint that requires authentication.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { prisma } from '@aura/database';
import { redis } from '@/lib/cache/redis';
import { queryMonitor } from '@/lib/monitoring/query-monitor';
import { apmManager } from '@/lib/monitoring/apm';
import { logger } from '@/lib/logger';

interface MetricValue {
  name: string;
  value: number;
  labels?: Record<string, string>;
  type: 'counter' | 'gauge' | 'histogram';
  help?: string;
}

/**
 * GET /api/metrics
 * Returns application metrics in Prometheus format or JSON (auth: metrics:read)
 *
 * Prometheus scrapers should authenticate using a service-account bearer token
 * granted the `metrics:read` permission. Do not expose this endpoint publicly.
 */
export const GET = createProtectedRoute(
  async (request: NextRequest, _ctx) => {
    const startTime = Date.now();
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'json';

    // Collect all metrics
    const metrics: MetricValue[] = [];

    // 1. System Metrics
    const memoryUsage = process.memoryUsage();
    metrics.push(
      {
        name: 'nodejs_heap_size_used_bytes',
        value: memoryUsage.heapUsed,
        type: 'gauge',
        help: 'Process heap size used in bytes',
      },
      {
        name: 'nodejs_heap_size_total_bytes',
        value: memoryUsage.heapTotal,
        type: 'gauge',
        help: 'Process heap size total in bytes',
      },
      {
        name: 'nodejs_external_memory_bytes',
        value: memoryUsage.external,
        type: 'gauge',
        help: 'Process external memory in bytes',
      },
      {
        name: 'nodejs_rss_bytes',
        value: memoryUsage.rss,
        type: 'gauge',
        help: 'Process resident set size in bytes',
      },
      {
        name: 'process_uptime_seconds',
        value: process.uptime(),
        type: 'gauge',
        help: 'Process uptime in seconds',
      }
    );

    // 2. Database Metrics
    try {
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const dbResponseTime = Date.now() - dbStart;

      metrics.push(
        {
          name: 'database_connection_status',
          value: 1,
          type: 'gauge',
          help: 'Database connection status (1 = connected, 0 = disconnected)',
        },
        {
          name: 'database_query_duration_ms',
          value: dbResponseTime,
          type: 'gauge',
          help: 'Database query latency in milliseconds',
        }
      );
    } catch (error) {
      logger.error({ error }, 'Database metrics collection failed');
      metrics.push({
        name: 'database_connection_status',
        value: 0,
        type: 'gauge',
        help: 'Database connection status (1 = connected, 0 = disconnected)',
      });
    }

    // 3. Redis/Cache Metrics
    const redisConnected = redis.isReady();
    metrics.push({
      name: 'redis_connection_status',
      value: redisConnected ? 1 : 0,
      type: 'gauge',
      help: 'Redis connection status (1 = connected, 0 = disconnected)',
    });

    // 4. Query Monitor Metrics
    const queryStats = queryMonitor.getStats();
    metrics.push(
      {
        name: 'database_queries_total',
        value: queryStats.totalQueries,
        type: 'counter',
        help: 'Total number of database queries',
      },
      {
        name: 'database_queries_slow_total',
        value: queryStats.slowQueries,
        type: 'counter',
        help: 'Total number of slow database queries',
      },
      {
        name: 'database_queries_critical_total',
        value: queryStats.criticalQueries,
        type: 'counter',
        help: 'Total number of critical database queries',
      },
      {
        name: 'database_query_duration_avg_ms',
        value: parseFloat(queryStats.averageDuration.toFixed(2)),
        type: 'gauge',
        help: 'Average database query duration in milliseconds',
      }
    );

    // 5. APM Metrics
    const apmMetrics = apmManager.getMetrics();
    metrics.push(
      {
        name: 'http_requests_total',
        value: apmMetrics.requestCount || 0,
        type: 'counter',
        help: 'Total number of HTTP requests',
      },
      {
        name: 'http_request_duration_avg_ms',
        value: apmMetrics.averageResponseTime || 0,
        type: 'gauge',
        help: 'Average HTTP request duration in milliseconds',
      },
      {
        name: 'http_requests_slow_total',
        value: apmMetrics.slowRequestCount || 0,
        type: 'counter',
        help: 'Total number of slow HTTP requests',
      },
      {
        name: 'http_errors_total',
        value: apmMetrics.errorCount || 0,
        type: 'counter',
        help: 'Total number of HTTP errors',
      }
    );

    // Calculate response time
    const responseTime = Date.now() - startTime;
    metrics.push({
      name: 'metrics_collection_duration_ms',
      value: responseTime,
      type: 'gauge',
      help: 'Time to collect all metrics in milliseconds',
    });

    // Return in requested format
    if (format === 'prometheus') {
      const prometheusOutput = metrics
        .map((m) => {
          let output = '';
          if (m.help) {
            output += `# HELP ${m.name} ${m.help}\n`;
          }
          output += `# TYPE ${m.name} ${m.type}\n`;
          const labels = m.labels
            ? `{${Object.entries(m.labels)
                .map(([k, v]) => `${k}="${v}"`)
                .join(',')}}`
            : '';
          output += `${m.name}${labels} ${m.value}`;
          return output;
        })
        .join('\n\n');

      return new Response(prometheusOutput, {
        headers: {
          'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        },
      });
    }

    // JSON format
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      collectionDuration: `${responseTime}ms`,
      metrics: metrics.reduce(
        (acc, m) => {
          acc[m.name] = {
            value: m.value,
            type: m.type,
            help: m.help,
          };
          return acc;
        },
        {} as Record<string, { value: number; type: string; help?: string }>
      ),
    });
  },
  {
    requiredPermissions: ['metrics:read'],
    rateLimit: 'API_USER',
  }
);
