import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { redis } from '@/lib/cache/redis';
import { queryMonitor } from '@/lib/monitoring/query-monitor';
import { logger } from '@/lib/logger';

// GET - Basic health check (public endpoint - no auth required)
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();

    // Check database connectivity
    let dbStatus = 'healthy';
    let dbResponseTime = 0;

    try {
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbResponseTime = Date.now() - dbStart;
    } catch (error) {
      dbStatus = 'unhealthy';
      logger.error('Database health check failed:', error);
    }

    // Check Redis connectivity
    const redisStatus = redis.isReady() ? 'healthy' : 'unavailable';

    // Get query performance stats
    const queryStats = queryMonitor.getStats();

    // Get environment info (without sensitive data)
    const environment = process.env.NODE_ENV || 'development';
    const nodeVersion = process.version;

    // Calculate total response time
    const totalResponseTime = Date.now() - startTime;

    const healthData = {
      status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment,
      version: '1.0.0', // Update this with actual version
      node: nodeVersion,
      checks: {
        database: {
          status: dbStatus,
          responseTime: `${dbResponseTime}ms`,
        },
        cache: {
          status: redisStatus,
        },
        api: {
          status: 'healthy',
          responseTime: `${totalResponseTime}ms`,
        },
      },
      performance: {
        queries: {
          total: queryStats.totalQueries,
          slow: queryStats.slowQueries,
          critical: queryStats.criticalQueries,
          averageDuration: queryStats.averageDuration.toFixed(2) + 'ms',
        },
      },
    };

    // Return 503 if any critical service is unhealthy
    const statusCode = dbStatus === 'healthy' ? 200 : 503;

    return NextResponse.json(healthData, { status: statusCode });
  } catch (error) {
    logger.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 503 }
    );
  }
}
