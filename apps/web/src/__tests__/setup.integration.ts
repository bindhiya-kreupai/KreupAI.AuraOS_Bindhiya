/**
 * Integration test setup
 *
 * Unlike setup.ts (which mocks Prisma for unit tests), this file
 * connects to a REAL Postgres + Redis. The test database is expected
 * to be a dedicated instance — never the dev or prod DB — because
 * tests will TRUNCATE tables.
 *
 * If the required env vars are not set, the suite fails loudly with
 * an actionable message rather than silently using fixtures.
 */

import { beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';

// Minimum env vars the env validator requires before any module imports
// it transitively. Tests don't care about the actual values; we just
// need them present so the zod schema doesn't reject startup.
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'integration-test-jwt-secret-min-32-chars';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'integration-test-refresh-secret-32-chars';
process.env.MFA_ENCRYPTION_KEY =
  process.env.MFA_ENCRYPTION_KEY || 'integration-test-mfa-key-min-32-chars-abc';
process.env.SSN_ENCRYPTION_KEY =
  process.env.SSN_ENCRYPTION_KEY || 'integration-test-ssn-key-min-32-chars-abc';
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'error';

// REQUIRED real connections — no fallbacks
const requiredRealConnections = ['DATABASE_URL', 'REDIS_URL'] as const;
for (const key of requiredRealConnections) {
  if (!process.env[key]) {
    throw new Error(
      `Integration test setup: ${key} is not set. ` +
        'Bring up a test Postgres + Redis (docker-compose.ci.yml has one) ' +
        'and export the connection strings before running the integration suite. ' +
        'Tests will TRUNCATE tables in the connected DB — do NOT point this at dev or prod.'
    );
  }
}

// Safety check: refuse to run if the DATABASE_URL looks like a production target
const dbUrl = process.env.DATABASE_URL!;
const FORBIDDEN_HOST_PATTERNS = [/supabase\.co/, /amazonaws\.com/, /azure\.com/, /\.prod\./];
if (FORBIDDEN_HOST_PATTERNS.some((re) => re.test(dbUrl))) {
  throw new Error(
    `Integration test setup REFUSED to run: DATABASE_URL appears to point at a managed/prod database (${dbUrl.replace(/:[^@]+@/, ':***@')}). ` +
      'Tests TRUNCATE tables. Point DATABASE_URL at a dedicated test database before retrying.'
  );
}

const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Truncate the audit tables between tests so tests don't see stale rows
  // from the previous file. Add more tables here as integration tests
  // accumulate. Order matters for FK constraints — leaf tables first.
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "aura_audit_log" RESTART IDENTITY CASCADE');
});

export { prisma };
