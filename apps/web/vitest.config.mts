import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Support both node and jsdom environments
    environment: 'node',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', '.next', 'dist', 'coverage', 'playwright-report'],

    // Parallel execution for faster tests
    pool: 'threads',
    singleThread: false,

    // Test timeouts
    testTimeout: 10000,
    hookTimeout: 10000,

    // Coverage configuration — #49 ratchet model.
    //
    // The platform-wide 70% target is the destination, not today's
    // reality. As of 2026-06-02 we have tests for 11 of ~40 service
    // domains. Strategy: per-domain thresholds at achievable levels,
    // ratchet upward as Copilot delivers each handoff packet (see
    // docs/implementation/COVERAGE-HANDOFF-49.md).
    //
    // Per-domain thresholds use the `glob:` form of v8 thresholds.
    // Each domain that has tests today has a floor that REJECTS
    // regressions; domains without tests are excluded from coverage
    // until tests land.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'text-summary'],
      reportsDirectory: './coverage',
      include: [
        // Only the service domains that have tests today are measured.
        // Add new globs as new domains gain coverage (commit alongside
        // the tests that produce the numbers).
        'src/lib/services/payroll/**/*.ts',
        'src/lib/services/attendance/**/*.ts',
        'src/lib/services/leave/**/*.ts',
        'src/lib/services/recruitment/**/*.ts',
        'src/lib/services/employee/**/*.ts',
        'src/lib/services/compliance/**/*.ts',
        'src/lib/services/organization/**/*.ts',
        'src/lib/services/document/**/*.ts',
        'src/lib/services/dashboard/**/*.ts',
        'src/lib/services/analytics/**/*.ts',
        'src/lib/services/reporting/**/*.ts',
        'src/lib/services/i18n/**/*.ts',
        'src/lib/services/integrations/connection.service.ts',
        'src/lib/services/integrations/registry.service.ts',
        'src/lib/services/integrations/marketplace-governance.service.ts',
        'src/lib/services/integrations/connector-framework.service.ts',
        'src/lib/services/analytics/model-calibration.service.ts',
        'src/lib/services/employment-history.service.ts',
        // Root-level service modules that have tests today.
        'src/lib/services/leave.service.ts',
        'src/lib/services/attendance.service.ts',
        'src/lib/services/payroll.service.ts',
        'src/lib/services/asset.service.ts',
        'src/lib/services/document.service.ts',
        'src/lib/services/employment-history.service.ts',
        'src/lib/audit/**/*.ts',
      ],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
        '**/types/**',
        '**/__tests__/**',
        '.next/',
        'dist/',
        'coverage/',
        'public/',
        'scripts/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        // Drift-marked files (@ts-nocheck) are excluded until rewrite.
        '**/types.ts',
        '**/index.ts',
      ],
      // Per-domain thresholds. Floor = "the team commits to never drop
      // below this". These match the ACTUAL coverage today
      // (post-Packet-1, 2026-06-02) rounded down for headroom. Each
      // rises as additional packets land.
      // See docs/implementation/COVERAGE-HANDOFF-49.md.
      thresholds: {
        // Audit — anchor; was the original well-covered domain
        'src/lib/audit/**': {
          lines: 85,
          functions: 85,
          branches: 70,
          statements: 85,
        },
        // Payroll — money + regulatory (Priority 1)
        'src/lib/services/payroll/**': {
          lines: 65,
          functions: 75,
          branches: 50,
          statements: 65,
        },
        // Organization — high (delete-tenant-bleed tests catch the rest)
        'src/lib/services/organization/**': {
          lines: 90,
          functions: 95,
          branches: 65,
          statements: 90,
        },
        // Recruitment — PII (Priority 4)
        'src/lib/services/recruitment/**': {
          lines: 50,
          functions: 55,
          branches: 35,
          statements: 50,
        },
        // Compliance — anchor (eosb, gosi, hijri)
        'src/lib/services/compliance/**': {
          lines: 25,
          functions: 25,
          branches: 20,
          statements: 25,
        },
        // Employee — Packet 1 just landed
        'src/lib/services/employee/**': {
          lines: 90,
          functions: 95,
          branches: 90,
          statements: 90,
        },
        // Leave subdir — accrual + encashment via Packet 1
        'src/lib/services/leave/**': {
          lines: 15,
          functions: 65,
          branches: 10,
          statements: 15,
        },
        // Leave service at root level — Packet 1
        'src/lib/services/leave.service.ts': {
          lines: 40,
          functions: 95,
          branches: 30,
          statements: 40,
        },
      },
      clean: true,
      // `all: false` so files without ANY test aren't counted yet — that
      // would tank averages and mask real coverage. Files that get a test
      // become measured automatically (they're in the include glob).
      all: false,
    },

    // Reporter configuration
    reporters: ['verbose', 'junit', 'json'],
    outputFile: {
      junit: './test-results/junit.xml',
      json: './test-results/results.json',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});