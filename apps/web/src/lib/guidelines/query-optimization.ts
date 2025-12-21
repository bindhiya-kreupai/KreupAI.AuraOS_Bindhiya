/**
 * Query Optimization Guidelines
 *
 * This file contains coding standards and utilities to prevent N+1 query issues
 * and ensure optimal database performance.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';

/**
 * N+1 Query Prevention Patterns
 *
 * N+1 queries occur when you execute 1 query to fetch a list, then N additional
 * queries to fetch related data for each item in the list.
 *
 * Example of N+1 problem:
 * ```typescript
 * // BAD: N+1 queries
 * const users = await prisma.user.findMany(); // 1 query
 * for (const user of users) {
 *   const profile = await prisma.profile.findUnique({
 *     where: { userId: user.id }
 *   }); // N queries
 * }
 * ```
 *
 * Solution: Use `include` or `select` with nested relations
 * ```typescript
 * // GOOD: 1 query
 * const users = await prisma.user.findMany({
 *   include: { profile: true }
 * });
 * ```
 */

/**
 * Rule 1: Always load relations upfront with include/select
 */
export namespace RelationLoading {
  /**
   * ❌ BAD: Separate queries for relations
   */
  export async function badExample(prisma: PrismaClient, userIds: string[]) {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } }
    });

    // N+1 problem: separate query per user
    for (const user of users) {
      const employee = await prisma.employee.findUnique({
        where: { userId: user.id }
      });
      // Process employee...
    }
  }

  /**
   * ✅ GOOD: Include relations in single query
   */
  export async function goodExample(prisma: PrismaClient, userIds: string[]) {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true
          }
        }
      }
    });

    // No additional queries needed
    for (const user of users) {
      const employee = user.employee;
      // Process employee...
    }
  }

  /**
   * ✅ BEST: Use select for specific fields only
   */
  export async function bestExample(prisma: PrismaClient, userIds: string[]) {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        email: true,
        employee: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return users;
  }
}

/**
 * Rule 2: Batch lookups before loops
 */
export namespace BatchLookups {
  /**
   * ❌ BAD: Query inside loop
   */
  export async function badExample(prisma: PrismaClient, userIds: string[]) {
    const results = [];

    for (const userId of userIds) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      }); // N queries
      results.push(user);
    }

    return results;
  }

  /**
   * ✅ GOOD: Single batch query with Map for lookups
   */
  export async function goodExample(prisma: PrismaClient, userIds: string[]) {
    // Single query
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } }
    });

    // Create lookup map for O(1) access
    const userMap = new Map(users.map(u => [u.id, u]));

    // Fast lookups without queries
    const results = userIds.map(id => userMap.get(id)).filter(Boolean);

    return results;
  }

  /**
   * ✅ BEST: Maintain order with lookup map
   */
  export async function bestExample(prisma: PrismaClient, userIds: string[]) {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } }
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    // Maintain order of input array
    return userIds.map(id => userMap.get(id)).filter(Boolean);
  }
}

/**
 * Rule 3: Use transactions for batch operations
 */
export namespace BatchOperations {
  /**
   * ❌ BAD: Sequential creates
   */
  export async function badExample(prisma: PrismaClient, dataArray: any[]) {
    const results = [];

    for (const data of dataArray) {
      const created = await prisma.model.create({ data }); // N queries
      results.push(created);
    }

    return results;
  }

  /**
   * ✅ GOOD: Batch in transaction
   */
  export async function goodExample(prisma: PrismaClient, dataArray: any[]) {
    const results = await prisma.$transaction(
      dataArray.map(data =>
        prisma.model.create({ data })
      )
    );

    return results;
  }

  /**
   * ✅ BEST: Use createMany when possible (most efficient)
   */
  export async function bestExample(prisma: PrismaClient, dataArray: any[]) {
    await prisma.model.createMany({
      data: dataArray,
      skipDuplicates: true
    });

    // Note: createMany doesn't return created records
    // Fetch them if needed
    const ids = dataArray.map(d => d.id);
    return prisma.model.findMany({
      where: { id: { in: ids } }
    });
  }
}

/**
 * Rule 4: Parallel queries with Promise.all
 */
export namespace ParallelQueries {
  /**
   * ❌ BAD: Sequential independent queries
   */
  export async function badExample(prisma: PrismaClient) {
    const userCount = await prisma.user.count();
    const sessionCount = await prisma.userSession.count();
    const auditCount = await prisma.auditLog.count();

    return { userCount, sessionCount, auditCount };
  }

  /**
   * ✅ GOOD: Parallel queries
   */
  export async function goodExample(prisma: PrismaClient) {
    const [userCount, sessionCount, auditCount] = await Promise.all([
      prisma.user.count(),
      prisma.userSession.count(),
      prisma.auditLog.count()
    ]);

    return { userCount, sessionCount, auditCount };
  }
}

/**
 * Rule 5: Optimize batch upserts
 */
export namespace BatchUpserts {
  interface ResultInput {
    id: string;
    value: string;
  }

  /**
   * ❌ BAD: Loop with findFirst + update/create
   */
  export async function badExample(prisma: PrismaClient, results: ResultInput[]) {
    const output = [];

    for (const result of results) {
      const existing = await prisma.result.findFirst({
        where: { id: result.id }
      }); // N queries

      if (existing) {
        const updated = await prisma.result.update({
          where: { id: existing.id },
          data: { value: result.value }
        }); // N queries
        output.push(updated);
      } else {
        const created = await prisma.result.create({
          data: result
        }); // N queries
        output.push(created);
      }
    }

    return output;
  }

  /**
   * ✅ GOOD: Batch fetch + transaction
   */
  export async function goodExample(prisma: PrismaClient, results: ResultInput[]) {
    // 1. Batch fetch existing records
    const ids = results.map(r => r.id);
    const existingRecords = await prisma.result.findMany({
      where: { id: { in: ids } }
    });

    // 2. Create lookup map
    const existingMap = new Map(existingRecords.map(r => [r.id, r]));

    // 3. Batch operations in transaction
    const output = await prisma.$transaction(
      results.map(result => {
        const existing = existingMap.get(result.id);

        if (existing) {
          return prisma.result.update({
            where: { id: existing.id },
            data: { value: result.value }
          });
        } else {
          return prisma.result.create({
            data: result
          });
        }
      })
    );

    return output;
  }

  /**
   * ✅ BEST: Use native upsert when possible
   */
  export async function bestExample(prisma: PrismaClient, results: ResultInput[]) {
    // For single records, use upsert
    if (results.length === 1) {
      const result = results[0];
      return prisma.result.upsert({
        where: { id: result.id },
        update: { value: result.value },
        create: result
      });
    }

    // For multiple records, batch in transaction
    return prisma.$transaction(
      results.map(result =>
        prisma.result.upsert({
          where: { id: result.id },
          update: { value: result.value },
          create: result
        })
      )
    );
  }
}

/**
 * Utility: Query Performance Tracker
 */
export class QueryPerformanceTracker {
  private queryCount = 0;
  private queryLog: Array<{ query: string; duration: number }> = [];

  /**
   * Track Prisma queries during operation
   */
  async track<T>(
    prisma: PrismaClient,
    operation: () => Promise<T>,
    options: { logQueries?: boolean; warnThreshold?: number } = {}
  ): Promise<{ result: T; queryCount: number; totalDuration: number }> {
    const { logQueries = false, warnThreshold = 10 } = options;

    this.queryCount = 0;
    this.queryLog = [];

    // Set up query logging
    const middleware = async (params: any, next: any) => {
      const start = Date.now();
      const result = await next(params);
      const duration = Date.now() - start;

      this.queryCount++;
      this.queryLog.push({
        query: `${params.model}.${params.action}`,
        duration
      });

      if (logQueries) {
        logger.info(`Query ${this.queryCount}: ${params.model}.${params.action} (${duration}ms)`);
      }

      return result;
    };

    (prisma as any).$use(middleware);

    // Execute operation
    const result = await operation();

    // Calculate total duration
    const totalDuration = this.queryLog.reduce((sum, q) => sum + q.duration, 0);

    // Warn if threshold exceeded
    if (this.queryCount > warnThreshold) {
      logger.warn(
        `⚠️ High query count detected: ${this.queryCount} queries in ${totalDuration}ms`
      );
    }

    return {
      result,
      queryCount: this.queryCount,
      totalDuration
    };
  }

  getQueryLog() {
    return this.queryLog;
  }
}

/**
 * Utility: Batch Loader (DataLoader pattern)
 */
export class BatchLoader<K, V> {
  private batchLoadFn: (keys: K[]) => Promise<V[]>;
  private cache = new Map<K, V>();
  private queue: K[] = [];
  private batchScheduled = false;

  constructor(batchLoadFn: (keys: K[]) => Promise<V[]>) {
    this.batchLoadFn = batchLoadFn;
  }

  /**
   * Load single item (batches automatically)
   */
  async load(key: K): Promise<V | undefined> {
    // Check cache
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // Add to queue
    this.queue.push(key);

    // Schedule batch if not already scheduled
    if (!this.batchScheduled) {
      this.batchScheduled = true;

      // Execute batch on next tick
      await new Promise(resolve => setImmediate(resolve));

      await this.executeBatch();
      this.batchScheduled = false;
    }

    return this.cache.get(key);
  }

  /**
   * Load multiple items
   */
  async loadMany(keys: K[]): Promise<(V | undefined)[]> {
    return Promise.all(keys.map(key => this.load(key)));
  }

  private async executeBatch() {
    if (this.queue.length === 0) return;

    const keys = [...this.queue];
    this.queue = [];

    const values = await this.batchLoadFn(keys);

    // Cache results
    values.forEach((value, index) => {
      this.cache.set(keys[index], value);
    });
  }

  clearCache() {
    this.cache.clear();
  }
}

/**
 * Example: Using BatchLoader
 */
export function createUserLoader(prisma: PrismaClient) {
  return new BatchLoader<string, any>(async (userIds: string[]) => {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: { employee: true }
    });

    // Maintain order matching input keys
    const userMap = new Map(users.map(u => [u.id, u]));
    return userIds.map(id => userMap.get(id)!);
  });
}

/**
 * Checklist for Preventing N+1 Queries
 *
 * Use this checklist when writing any database query:
 *
 * □ No Prisma queries inside for/while loops
 * □ Relations loaded with include or select
 * □ Independent queries batched with Promise.all
 * □ Batch writes use $transaction or createMany
 * □ Lookup maps used instead of repeated findUnique
 * □ Query count tested (<5 per request ideally)
 * □ Composite indexes exist for multi-field lookups
 * □ Pagination limits enforced
 */

export default {
  RelationLoading,
  BatchLookups,
  BatchOperations,
  ParallelQueries,
  BatchUpserts,
  QueryPerformanceTracker,
  BatchLoader,
  createUserLoader
};
