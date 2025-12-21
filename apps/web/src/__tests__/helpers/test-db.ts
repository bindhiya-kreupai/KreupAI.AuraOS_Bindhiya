/**
 * Test Database Helper
 *
 * Provides utilities for working with test database
 */

import { PrismaClient } from '@prisma/client';

/**
 * Create a test database connection
 *
 * Uses separate database URL for tests to avoid conflicts with development data
 */
export function createTestDbConnection(): PrismaClient {
  const testDatabaseUrl =
    process.env.TEST_DATABASE_URL ||
    process.env.DATABASE_URL?.replace('auraos', 'auraos_test') ||
    'postgresql://test:test@localhost:5432/auraos_test';

  return new PrismaClient({
    datasources: {
      db: {
        url: testDatabaseUrl,
      },
    },
    log: process.env.DEBUG_TESTS === 'true' ? ['query', 'error', 'warn'] : ['error'],
  });
}

/**
 * Setup test database connection
 * Call this in beforeAll hook
 */
export async function setupTestDb(): Promise<PrismaClient> {
  const prisma = createTestDbConnection();

  try {
    // Test connection
    await prisma.$connect();
    console.log('📊 Test database connected');
    return prisma;
  } catch (error) {
    console.error('❌ Failed to connect to test database:', error);
    throw error;
  }
}

/**
 * Cleanup test database connection
 * Call this in afterAll hook
 */
export async function teardownTestDb(prisma: PrismaClient): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('👋 Test database disconnected');
  } catch (error) {
    console.error('❌ Failed to disconnect from test database:', error);
    throw error;
  }
}

/**
 * Execute query within a transaction
 */
export async function withTransaction<T>(
  prisma: PrismaClient,
  callback: (tx: any) => Promise<T>
): Promise<T> {
  return prisma.$transaction(callback);
}

/**
 * Count records in a table
 */
export async function countRecords(
  prisma: PrismaClient,
  table: string
): Promise<number> {
  const result = await (prisma as any)[table].count();
  return result;
}

/**
 * Check if database is empty
 */
export async function isDatabaseEmpty(prisma: PrismaClient): Promise<boolean> {
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.license.count(),
    prisma.country.count(),
  ]);

  return counts.every((count) => count === 0);
}

/**
 * Wait for database to be ready
 */
export async function waitForDb(
  prisma: PrismaClient,
  maxAttempts = 10,
  delayMs = 1000
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return;
    } catch (error) {
      if (i === maxAttempts - 1) {
        throw new Error('Database not ready after maximum attempts');
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
