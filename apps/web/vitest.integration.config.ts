import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Vitest config for INTEGRATION tests.
 *
 * Picks up only files matching *.integration.test.ts(x) — distinct
 * from the unit-test config which picks up everything else.
 *
 * Differences from vitest.config.mts:
 *   - Higher per-test timeout (integration tests hit real DB + Redis)
 *   - Lower concurrency (parallel DB writes can contend on row locks)
 *   - No coverage gates (coverage is enforced by the unit config; the
 *     integration suite is for behaviour, not line coverage)
 *   - Sequential pool to avoid Prisma client races against a shared
 *     test database
 *
 * Required env for the suite to run (set by docker-compose.ci.yml in
 * CI, or by the developer locally):
 *   DATABASE_URL  -> a dedicated test Postgres (separate from dev DB)
 *   REDIS_URL     -> a dedicated test Redis instance
 *   JWT_SECRET, JWT_REFRESH_SECRET, MFA_ENCRYPTION_KEY, SSN_ENCRYPTION_KEY
 *                 -> any 32-byte strings; the actual values don't matter
 *                    in tests, but the validators in src/lib/config/env.ts
 *                    require them to be set.
 *
 * Per CI:  pnpm --filter web test:integration
 * Per dev: pnpm --filter web exec vitest run --config vitest.integration.config.ts
 */
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['**/*.integration.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'dist', 'coverage', 'playwright-report'],

    setupFiles: ['./src/__tests__/setup.integration.ts'],

    // Integration tests hit real services — give them room
    testTimeout: 60_000,
    hookTimeout: 60_000,

    // Sequential pool to avoid race conditions when multiple test files
    // touch the same DB rows (e.g. tenant fixtures)
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },

    // No coverage thresholds for integration runs — coverage is owned by
    // the unit-test config. Generate a report for debugging only.
    coverage: {
      enabled: false,
    },

    reporters: ['verbose', 'junit'],
    outputFile: {
      junit: './test-results/junit-integration.xml',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
