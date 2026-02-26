/**
 * @file playwright.config.ts
 * @description Playwright E2E test configuration for AuraOS.
 *              Covers functional flows: auth, employees, leave, payroll, expenses.
 */

import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Re-usable storage state path (saved by auth.fixture.ts setup)
export const STORAGE_STATE = path.join(__dirname, '.auth', 'user.json');

export default defineConfig({
  testDir:  './tests',

  /* How to match test files */
  testMatch: ['**/*.spec.ts'],

  /* Run tests in parallel within each file */
  fullyParallel: false,

  /* Fail the build if test.only is accidentally left */
  forbidOnly: Boolean(process.env.CI),

  /* Retry once on CI to handle flakiness */
  retries: process.env.CI ? 1 : 0,

  /* Parallel workers */
  workers: process.env.CI ? 2 : 4,

  /* Reporter configuration */
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-results.json' }],
    ...(process.env.CI ? [['github'] as ['github']] : []),
  ],

  /* Global test timeout */
  timeout: 30_000,

  /* Expect timeout */
  expect: {
    timeout: 8_000,
  },

  /* Global setup / teardown */
  globalSetup:    './fixtures/global-setup.ts',
  globalTeardown: './fixtures/global-teardown.ts',

  use: {
    /* Base URL — override with BASE_URL env var */
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',

    /* Viewport */
    viewport: { width: 1440, height: 900 },

    /* Screenshots on failure */
    screenshot: 'only-on-failure',

    /* Video on retry */
    video: 'retain-on-failure',

    /* Trace on retry */
    trace: 'retain-on-failure',

    /* Navigation timeout */
    navigationTimeout: 15_000,

    /* Action timeout */
    actionTimeout: 8_000,

    /* Ignore HTTPS errors in dev/staging */
    ignoreHTTPSErrors: Boolean(process.env.IGNORE_HTTPS),
  },

  projects: [
    // ── Setup project: creates auth session ──────────────────────────────

    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // ── Chromium (primary) ────────────────────────────────────────────────

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
      testIgnore:   /.*\.setup\.ts/,
    },

    // ── Firefox ───────────────────────────────────────────────────────────

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
      testIgnore:   /.*\.setup\.ts/,
    },

    // ── WebKit (optional, disabled in CI by default) ──────────────────────

    ...(process.env.TEST_WEBKIT
      ? [{
          name: 'webkit',
          use: {
            ...devices['Desktop Safari'],
            storageState: STORAGE_STATE,
          },
          dependencies: ['setup'] as const,
          testIgnore:   /.*\.setup\.ts/,
        }]
      : []),

    // ── Mobile viewport ───────────────────────────────────────────────────

    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 7'],
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
      testIgnore:   /.*\.setup\.ts/,
      testMatch:    /.*\.mobile\.spec\.ts/,  // only explicitly mobile tests
    },
  ],

  /* Directory for test artifacts */
  outputDir: 'test-results',

  /* Dev server — start automatically when running locally */
  webServer: process.env.CI
    ? undefined
    : {
        command:   'pnpm --filter web dev',
        url:       'http://localhost:3000',
        reuseExistingServer: true,
        timeout:   60_000,
      },
});
