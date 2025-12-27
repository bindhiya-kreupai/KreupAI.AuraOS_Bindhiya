/**
 * Playwright Global Teardown
 * Week 5: E2E Testing Setup
 *
 * This file runs after all tests and cleans up:
 * - Test database
 * - Test artifacts
 * - Temporary files
 */

import { PrismaClient } from '@prisma/client';

async function globalTeardown() {
  console.log('🧹 Starting global E2E test teardown...');

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
      },
    },
  });

  try {
    // Optional: Clean up test data
    // Comment out if you want to inspect data after test run
    if (process.env.CLEANUP_AFTER_TESTS !== 'false') {
      console.log('🗑️  Cleaning up test data...');
      await prisma.userSession.deleteMany({
        where: { userId: { contains: 'test-' } },
      });
      await prisma.auditLog.deleteMany({
        where: { userId: { contains: 'test-' } },
      });
    }

    console.log('✅ Global teardown completed successfully');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

export default globalTeardown;
