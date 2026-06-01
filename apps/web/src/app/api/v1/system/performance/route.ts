import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  getPerformanceStats,
  getSlowEndpoints,
  _exportMetrics,
} from '@/lib/middleware/performance.middleware';
import { queryDetective } from '@/lib/utils/query-detective';
import { cacheService } from '@/lib/cache';

// API Response Standard
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    apiVersion: string;
  };
}

/**
 * GET /api/v1/system/performance
 * Get comprehensive performance metrics and statistics
 *
 * Query Parameters:
 * - type (optional): 'overview' | 'api' | 'database' | 'cache' | 'all' (default: 'all')
 * - lastMinutes (optional): Number of minutes to analyze (default: 60)
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  const { permissions } = context;
  if (!permissions.includes('system:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing system:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const lastMinutes = parseInt(searchParams.get('lastMinutes') || '60');

    const performanceData: any = {};

    // Hoisted so the overview block (below) can reference cache health
    // without re-fetching when type === 'all'
    let cacheStats: { isConnected: boolean; keysCount?: number } = { isConnected: false };

    // API Performance Metrics
    if (type === 'all' || type === 'api') {
      const apiStats = getPerformanceStats({ lastMinutes });
      const slowEndpoints = getSlowEndpoints();

      performanceData.api = {
        summary: {
          totalRequests: apiStats.total,
          averageResponseTime: `${apiStats.average}ms`,
          medianResponseTime: `${apiStats.p50}ms`,
          p95ResponseTime: `${apiStats.p95}ms`,
          p99ResponseTime: `${apiStats.p99}ms`,
          fastestResponse: `${apiStats.min}ms`,
          slowestResponse: `${apiStats.max}ms`,
          cacheHitRate: apiStats.cacheHitRate ? `${apiStats.cacheHitRate}%` : 'N/A',
        },
        slowEndpoints: slowEndpoints.map((endpoint) => ({
          ...endpoint,
          averageDuration: `${endpoint.averageDuration}ms`,
        })),
        performanceDistribution: {
          fast: `${apiStats.total > 0 ? Math.round(((apiStats.p50 < 100 ? 1 : 0) / apiStats.total) * 100) : 0}%`,
          moderate: `${apiStats.total > 0 ? Math.round(((apiStats.p95 < 500 ? 1 : 0) / apiStats.total) * 100) : 0}%`,
          slow: `${apiStats.total > 0 ? Math.round(((apiStats.p99 < 1000 ? 1 : 0) / apiStats.total) * 100) : 0}%`,
        },
      };
    }

    // Database Query Metrics
    if (type === 'all' || type === 'database') {
      const queryStats = queryDetective.getStats();

      performanceData.database = {
        summary: {
          totalQueries: queryStats.totalQueries,
          uniqueQueryPatterns: queryStats.uniquePatterns,
          averageQueriesPerSecond: queryStats.averageQueriesPerSecond,
          suspiciousPatternsDetected: queryStats.suspiciousPatterns,
        },
        nPlusOneDetection: {
          enabled: process.env.NODE_ENV === 'development',
          threshold: 10,
          status:
            queryStats.suspiciousPatterns > 0
              ? 'SUSPICIOUS_PATTERNS_DETECTED'
              : 'NO_ISSUES_DETECTED',
        },
        recommendations:
          queryStats.suspiciousPatterns > 0
            ? [
                'Review recent query logs for N+1 patterns',
                'Use Prisma include/select for eager loading',
                'Batch database queries where possible',
              ]
            : [],
      };
    }

    // Cache Metrics
    if (type === 'all' || type === 'cache') {
      cacheStats = await cacheService.getStats();

      performanceData.cache = {
        status: cacheStats.isConnected ? 'CONNECTED' : 'DISCONNECTED',
        keysCount: cacheStats.keysCount || 0,
        hitRate: 'N/A', // Would need to track this separately
        recommendations: cacheStats.isConnected
          ? ['Cache is operational', 'Monitor cache hit rate for optimization opportunities']
          : [
              'Cache is not connected',
              'Check Redis configuration',
              'API will fall back to database queries',
            ],
      };
    }

    // System Overview
    if (type === 'all' || type === 'overview') {
      performanceData.overview = {
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          uptime: `${Math.round(process.uptime())}s`,
          memoryUsage: {
            used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
            total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
            percentage: `${Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)}%`,
          },
        },
        health: {
          status: 'HEALTHY',
          checks: {
            api: 'OK',
            cache: cacheStats.isConnected ? 'OK' : 'DEGRADED',
            database: 'OK', // Would need actual DB health check
          },
        },
      };
    }

    const response: ApiResponse = {
      success: true,
      data: {
        ...performanceData,
        analyzedPeriod: `Last ${lastMinutes} minutes`,
        generatedAt: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('[Performance API] GET Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch performance metrics',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
});
