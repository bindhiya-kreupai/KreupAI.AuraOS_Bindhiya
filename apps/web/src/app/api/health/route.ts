import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { redis } from '@/lib/cache/redis';
import { queryMonitor } from '@/lib/monitoring/query-monitor';
import { checkPhase3Health } from '@/lib/init/phase3';
import { getEnvironmentSummary, isFeatureEnabled } from '@/lib/config/env-validation';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

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
    } catch (error: any) {
      dbStatus = 'unhealthy';
      logger.error('Database health check failed:', error);
    }

    // Check Redis connectivity
    const redisStatus = redis.isReady() ? 'healthy' : 'unavailable';

    // Check Phase 3 services
    const phase3Health = await checkPhase3Health();

    // Get query performance stats
    const queryStats = queryMonitor.getStats();

    // Get environment info (without sensitive data)
    const environment = process.env.NODE_ENV || 'development';
    const nodeVersion = process.version;

    // Check feature flags
    const features = {
      oauth2Google: isFeatureEnabled('google-oauth'),
      oauth2Microsoft: isFeatureEnabled('microsoft-oauth'),
      oauth2Okta: isFeatureEnabled('okta-oauth'),
      messaging: isFeatureEnabled('rabbitmq'),
      search: isFeatureEnabled('elasticsearch'),
      monitoring: isFeatureEnabled('datadog'),
    };

    // Get environment summary
    const envSummary = getEnvironmentSummary();

    // Calculate total response time
    const totalResponseTime = Date.now() - startTime;

    // Determine overall status
    const criticalServicesHealthy = dbStatus === 'healthy' && redisStatus === 'healthy';
    const phase3ServicesHealthy = phase3Health.messaging && phase3Health.search && phase3Health.events;
    const overallStatus = criticalServicesHealthy
      ? (phase3ServicesHealthy ? 'healthy' : 'degraded')
      : 'unhealthy';

    const healthData = {
      status: overallStatus,
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
        messaging: {
          status: phase3Health.messaging ? 'healthy' : 'unavailable',
          message: phase3Health.messaging ? 'RabbitMQ connected' : 'RabbitMQ unavailable',
        },
        search: {
          status: phase3Health.search ? 'healthy' : 'unavailable',
          message: phase3Health.search ? 'Elasticsearch connected' : 'Elasticsearch unavailable',
        },
        events: {
          status: phase3Health.events ? 'healthy' : 'unavailable',
          message: phase3Health.events ? 'Event bus ready' : 'Event bus not initialized',
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
      features,
      environmentVariables: {
        required: envSummary.required.map(v => ({ key: v.key, present: v.present })),
        optionalMissing: envSummary.optional.filter(v => !v.present).map(v => v.key),
      },
    };

    // Return 503 if any critical service is unhealthy
    const statusCode = overallStatus === 'unhealthy' ? 503 : 200;

    return NextResponse.json(healthData, { status: statusCode });
  } catch (error: any) {
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

/**
 * HEAD /api/health
 * Lightweight readiness probe for Kubernetes/load balancers
 * Only checks critical services (database + Redis)
 */
export async function HEAD(request: NextRequest) {
  try {
    // Check only critical services for readiness
    await prisma.$queryRaw`SELECT 1`;
    const redisReady = redis.isReady();

    if (redisReady) {
      return new NextResponse(null, { status: 200 });
    } else {
      return new NextResponse(null, { status: 503 });
    }
  } catch (error: any) {
    logger.error('Readiness check failed:', error);
    return new NextResponse(null, { status: 503 });
  }
}
