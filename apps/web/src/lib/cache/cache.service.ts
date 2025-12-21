/**
 * Cache Service
 * High-level caching operations with automatic key generation and invalidation
 */

import { redis, DEFAULT_TTL, SHORT_TTL, LONG_TTL } from './redis';
import { logger } from '@/lib/logger';

/**
 * Cache key prefixes for different entity types
 */
export const CachePrefix = {
  USER: 'user',
  TENANT: 'tenant',
  SESSION: 'session',
  ROLE: 'role',
  PERMISSION: 'permission',
  LICENSE: 'license',
  MASTER_DATA: 'master',
  EMPLOYEE: 'employee',
  DEPARTMENT: 'department',
  COMPANY: 'company',
} as const;

/**
 * Cache key generators
 */
export const CacheKeys = {
  // User keys
  user: (id: string) => `${CachePrefix.USER}:${id}`,
  userByEmail: (email: string) => `${CachePrefix.USER}:email:${email}`,
  usersByTenant: (tenantId: string, page: number = 1) =>
    `${CachePrefix.USER}:tenant:${tenantId}:page:${page}`,

  // Tenant keys
  tenant: (id: string) => `${CachePrefix.TENANT}:${id}`,
  tenantByCode: (code: string) => `${CachePrefix.TENANT}:code:${code}`,

  // Session keys
  session: (token: string) => `${CachePrefix.SESSION}:${token}`,
  userSessions: (userId: string) => `${CachePrefix.SESSION}:user:${userId}`,

  // Role & Permission keys
  role: (id: string) => `${CachePrefix.ROLE}:${id}`,
  userPermissions: (userId: string) => `${CachePrefix.PERMISSION}:user:${userId}`,

  // License keys
  license: (id: string) => `${CachePrefix.LICENSE}:${id}`,
  tenantLicenses: (tenantId: string) => `${CachePrefix.LICENSE}:tenant:${tenantId}`,

  // Master data keys
  masterData: (entity: string) => `${CachePrefix.MASTER_DATA}:${entity}`,
  countries: () => `${CachePrefix.MASTER_DATA}:countries`,
  states: (countryId: string) => `${CachePrefix.MASTER_DATA}:states:${countryId}`,
  cities: (stateId: string) => `${CachePrefix.MASTER_DATA}:cities:${stateId}`,

  // Employee keys
  employee: (id: string) => `${CachePrefix.EMPLOYEE}:${id}`,
  employeesByCompany: (companyId: string, page: number = 1) =>
    `${CachePrefix.EMPLOYEE}:company:${companyId}:page:${page}`,
  employeesByDepartment: (departmentId: string) =>
    `${CachePrefix.EMPLOYEE}:department:${departmentId}`,

  // Department keys
  department: (id: string) => `${CachePrefix.DEPARTMENT}:${id}`,
  companyDepartments: (companyId: string) =>
    `${CachePrefix.DEPARTMENT}:company:${companyId}`,

  // Company keys
  company: (id: string) => `${CachePrefix.COMPANY}:${id}`,
  tenantCompanies: (tenantId: string) => `${CachePrefix.COMPANY}:tenant:${tenantId}`,
};

/**
 * Cache Service
 */
export class CacheService {
  /**
   * Get cached value with fallback to database
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = DEFAULT_TTL
  ): Promise<T> {
    try {
      // Try to get from cache
      const cached = await redis.get<T>(key);
      if (cached !== null) {
        logger.debug({ key }, 'Cache HIT');
        return cached;
      }

      logger.debug({ key }, 'Cache MISS');

      // Fetch from database
      const fresh = await fetchFn();

      // Store in cache (async, don't wait)
      redis.set(key, fresh, ttl).catch((error) => {
        logger.error({ error, key }, 'Failed to cache value');
      });

      return fresh;
    } catch (error) {
      logger.error({ error, key }, 'Cache getOrSet error - falling back to fetch');
      return fetchFn();
    }
  }

  /**
   * Invalidate cache by key
   */
  async invalidate(key: string): Promise<boolean> {
    return redis.del(key);
  }

  /**
   * Invalidate multiple keys
   */
  async invalidateMany(keys: string[]): Promise<boolean> {
    return redis.delMany(keys);
  }

  /**
   * Invalidate by pattern (use with caution!)
   */
  async invalidatePattern(pattern: string): Promise<boolean> {
    return redis.delPattern(pattern);
  }

  /**
   * Invalidate all user-related caches
   */
  async invalidateUser(userId: string): Promise<void> {
    await Promise.all([
      this.invalidate(CacheKeys.user(userId)),
      this.invalidatePattern(`${CachePrefix.USER}:*:${userId}`),
      this.invalidate(CacheKeys.userPermissions(userId)),
      this.invalidate(CacheKeys.userSessions(userId)),
    ]);
  }

  /**
   * Invalidate all tenant-related caches
   */
  async invalidateTenant(tenantId: string): Promise<void> {
    await Promise.all([
      this.invalidate(CacheKeys.tenant(tenantId)),
      this.invalidatePattern(`${CachePrefix.USER}:tenant:${tenantId}:*`),
      this.invalidatePattern(`${CachePrefix.COMPANY}:tenant:${tenantId}*`),
      this.invalidatePattern(`${CachePrefix.LICENSE}:tenant:${tenantId}*`),
    ]);
  }

  /**
   * Invalidate all company-related caches
   */
  async invalidateCompany(companyId: string): Promise<void> {
    await Promise.all([
      this.invalidate(CacheKeys.company(companyId)),
      this.invalidatePattern(`${CachePrefix.EMPLOYEE}:company:${companyId}:*`),
      this.invalidate(CacheKeys.companyDepartments(companyId)),
    ]);
  }

  /**
   * Invalidate all department-related caches
   */
  async invalidateDepartment(departmentId: string): Promise<void> {
    await Promise.all([
      this.invalidate(CacheKeys.department(departmentId)),
      this.invalidate(CacheKeys.employeesByDepartment(departmentId)),
    ]);
  }

  /**
   * Warm up cache with commonly accessed data
   */
  async warmUp(tenantId: string): Promise<void> {
    logger.info({ tenantId }, 'Warming up cache');

    // This would be called during application startup or after deployment
    // to pre-populate frequently accessed data

    // Example: Load master data
    // await this.getOrSet(
    //   CacheKeys.countries(),
    //   () => countryRepository.findAll(),
    //   LONG_TTL
    // );
  }

  /**
   * Clear all caches (use with extreme caution!)
   */
  async clearAll(): Promise<boolean> {
    logger.warn('Clearing all caches');
    return redis.flushAll();
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    isConnected: boolean;
    keysCount?: number;
  }> {
    const isConnected = redis.isReady();

    if (!isConnected) {
      return { isConnected: false };
    }

    try {
      const client = redis.getClient();
      if (!client) {
        return { isConnected: false };
      }

      const dbSize = await client.dbsize();
      return {
        isConnected: true,
        keysCount: dbSize,
      };
    } catch (error) {
      logger.error({ error }, 'Failed to get cache stats');
      return { isConnected: false };
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();
