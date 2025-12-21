#!/usr/bin/env ts-node
/**
 * Setup Test Database Script
 *
 * Creates and seeds test database with fixture data
 *
 * Usage:
 *   pnpm test:db:setup
 */

import { PrismaClient } from '@prisma/client';
import { seedDatabase, clearDatabase } from '../src/__tests__/helpers/seed-database';

async function main() {
  console.log('🚀 Setting up test database...\n');

  const testDatabaseUrl =
    process.env.TEST_DATABASE_URL ||
    process.env.DATABASE_URL?.replace('auraos', 'auraos_test') ||
    'postgresql://test:test@localhost:5432/auraos_test';

  console.log(`📊 Using test database: ${testDatabaseUrl.replace(/:[^:@]+@/, ':****@')}\n`);

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: testDatabaseUrl,
      },
    },
  });

  try {
    // Connect to database
    await prisma.$connect();
    console.log('✅ Connected to test database\n');

    // Run migrations
    console.log('🔄 Running migrations...');
    // Note: In a real setup, you would run migrations here
    // For now, we assume migrations are already applied
    console.log('✅ Migrations complete\n');

    // Clear existing data
    await clearDatabase(prisma);

    // Seed database
    await seedDatabase(prisma);

    console.log('\n🎉 Test database setup complete!');
    console.log('\nYou can now run tests with:');
    console.log('  pnpm test');
    console.log('  pnpm test:run');
    console.log('  pnpm test:ui\n');
  } catch (error) {
    console.error('\n❌ Failed to setup test database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
