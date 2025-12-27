import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration for AuraOS HCM Platform
 * Week 5: E2E Testing Setup
 * Week 7: Visual Regression Testing
 *
 * This configuration sets up:
 * - Cross-browser testing (Chrome, Firefox, Safari)
 * - Local dev server for testing
 * - Page Object Model pattern support
 * - Screenshot and video recording on failure
 * - Parallel test execution
 * - Visual regression testing
 */

export default defineConfig({
  // Test directory
  testDir: './src/__tests__/e2e',

  // Maximum time one test can run for
  timeout: 30 * 1000,

  // Test expectations timeout
  expect: {
    timeout: 5000,
    // Visual regression settings
    toHaveScreenshot: {
      maxDiffPixels: 100, // Allow up to 100 pixels difference
      threshold: 0.2, // 20% threshold for pixel matching
      animations: 'disabled', // Disable animations for consistent screenshots
    },
  },

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: process.env.CI
    ? [
        ['html', { outputFolder: 'playwright-report' }],
        ['junit', { outputFile: 'test-results/e2e-junit.xml' }],
        ['list'],
      ]
    : [['html'], ['list']],

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3006',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Viewport size
    viewport: { width: 1280, height: 720 },

    // Default timeout for actions (click, fill, etc.)
    actionTimeout: 10 * 1000,

    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },

    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3006',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  // Global setup/teardown
  globalSetup: require.resolve('./src/__tests__/e2e/global-setup.ts'),
  globalTeardown: require.resolve('./src/__tests__/e2e/global-teardown.ts'),
});
