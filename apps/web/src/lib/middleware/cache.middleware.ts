// @ts-nocheck — Lib middleware/repository drift (generic NextResponse types, Sentry API changes, Prisma enum imports, permission template literal). Tracked under #29.
/**
 * API Response Caching Middleware
 * Provides automatic caching for GET requests
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { cacheService, DEFAULT_TTL, SHORT_TTL, LONG_TTL } from '@/lib/cache';
import { logger } from '@/lib/logger';

export interface CacheOptions {
  /**
   * Cache TTL in seconds
   */
  ttl?: number;

  /**
   * Custom cache key generator
   * Default: uses request URL
   */
  keyGenerator?: (request: NextRequest) => string;

  /**
   * Condition to determine if response should be cached
   * Default: caches all successful responses (200)
   */
  shouldCache?: (response: any) => boolean;

  /**
   * Cache key prefix
   */
  prefix?: string;
}

/**
 * Generate cache key from request
 */
function generateCacheKey(request: NextRequest, prefix?: string): string {
  const url = new URL(request.url);
  const path = url.pathname;
  const searchParams = url.searchParams.toString();

  const baseKey = searchParams ? `${path}?${searchParams}` : path;
  return prefix ? `${prefix}:${baseKey}` : `api:${baseKey}`;
}

/**
 * Cache middleware wrapper for API routes
 *
 * Usage:
 * ```typescript
 * export const GET = withCache(
 *   async (request) => {
 *     // your handler
 *   },
 *   { ttl: 300, prefix: 'employees' }
 * );
 * ```
 */
export function withCache<T extends (request: NextRequest, context?: any) => Promise<NextResponse>>(
  handler: T,
  options: CacheOptions = {}
): T {
  const {
    ttl = DEFAULT_TTL,
    keyGenerator,
    shouldCache = (response) => response?.success === true,
    prefix,
  } = options;

  return (async (request: NextRequest, context?: any) => {
    // Only cache GET requests
    if (request.method !== 'GET') {
      return handler(request, context);
    }

    try {
      // Generate cache key
      const cacheKey = keyGenerator
        ? keyGenerator(request)
        : generateCacheKey(request, prefix);

      // Try to get from cache
      const cached = await cacheService['redis'].get(cacheKey);
      if (cached) {
        logger.debug({ cacheKey }, 'API Cache HIT');
        return NextResponse.json(cached, {
          headers: {
            'X-Cache': 'HIT',
            'X-Cache-Key': cacheKey,
          },
        });
      }

      logger.debug({ cacheKey }, 'API Cache MISS');

      // Execute handler
      const response = await handler(request, context);

      // Get response body
      const clonedResponse = response.clone();
      const body = await clonedResponse.json();

      // Cache if successful
      if (shouldCache(body)) {
        await cacheService['redis'].set(cacheKey, body, ttl);
        logger.debug({ cacheKey, ttl }, 'API response cached');
      }

      // Return response with cache headers
      return NextResponse.json(body, {
        status: response.status,
        headers: {
          'X-Cache': 'MISS',
          'X-Cache-Key': cacheKey,
        },
      });
    } catch (error: any) {
      logger.error({ error }, 'Cache middleware error - falling back to handler');
      return handler(request, context);
    }
  }) as T;
}

/**
 * Predefined cache configurations
 */
export const CacheConfig = {
  /**
   * Short-lived cache for frequently changing data (5 minutes)
   */
  SHORT: { ttl: SHORT_TTL },

  /**
   * Default cache for moderate data (1 hour)
   */
  DEFAULT: { ttl: DEFAULT_TTL },

  /**
   * Long-lived cache for static/master data (24 hours)
   */
  LONG: { ttl: LONG_TTL },

  /**
   * No cache - always fetch fresh data
   */
  NONE: { ttl: 0 },
} as const;

/**
 * Cache invalidation helper for API routes
 */
export class ApiCacheInvalidator {
  /**
   * Invalidate cache for specific endpoint
   */
  static async invalidateEndpoint(path: string): Promise<void> {
    const key = `api:${path}`;
    await cacheService.invalidate(key);
  }

  /**
   * Invalidate cache by pattern
   */
  static async invalidatePattern(pattern: string): Promise<void> {
    await cacheService.invalidatePattern(`api:${pattern}`);
  }

  /**
   * Invalidate all employee-related caches
   */
  static async invalidateEmployeeCaches(employeeId?: string): Promise<void> {
    if (employeeId) {
      await Promise.all([
        this.invalidatePattern(`*/employees/${employeeId}*`),
        this.invalidatePattern('*/employees?*'),
      ]);
    } else {
      await this.invalidatePattern('*/employees*');
    }
  }

  /**
   * Invalidate all department-related caches
   */
  static async invalidateDepartmentCaches(departmentId?: string): Promise<void> {
    if (departmentId) {
      await Promise.all([
        this.invalidatePattern(`*/departments/${departmentId}*`),
        this.invalidatePattern('*/departments?*'),
      ]);
    } else {
      await this.invalidatePattern('*/departments*');
    }
  }

  /**
   * Invalidate all payroll-related caches
   */
  static async invalidatePayrollCaches(companyId?: string): Promise<void> {
    if (companyId) {
      await this.invalidatePattern(`*/payroll*company=${companyId}*`);
    } else {
      await this.invalidatePattern('*/payroll*');
    }
  }

  /**
   * Invalidate all leave-related caches
   */
  static async invalidateLeaveCaches(employeeId?: string): Promise<void> {
    if (employeeId) {
      await Promise.all([
        this.invalidatePattern(`*/leave/balance/${employeeId}*`),
        this.invalidatePattern('*/leave/calendar*'),
        this.invalidatePattern('*/leave/policies*'),
      ]);
    } else {
      await this.invalidatePattern('*/leave*');
    }
  }

  /**
   * Invalidate all attendance-related caches
   */
  static async invalidateAttendanceCaches(employeeId?: string): Promise<void> {
    if (employeeId) {
      await this.invalidatePattern(`*/attendance*employee=${employeeId}*`);
    } else {
      await this.invalidatePattern('*/attendance*');
    }
  }

  /**
   * Invalidate all shift-related caches
   */
  static async invalidateShiftCaches(shiftId?: string): Promise<void> {
    if (shiftId) {
      await Promise.all([
        this.invalidatePattern(`*/shifts/${shiftId}*`),
        this.invalidatePattern('*/shifts?*'),
        this.invalidatePattern('*/shifts/roster*'),
      ]);
    } else {
      await this.invalidatePattern('*/shifts*');
    }
  }
}

/**
 * Export cache invalidator instance
 */
export const apiCache = ApiCacheInvalidator;
