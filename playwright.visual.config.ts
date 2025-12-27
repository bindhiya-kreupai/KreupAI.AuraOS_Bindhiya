/**
 * Playwright Configuration for Visual & Accessibility Testing
 * Week 13-14: Visual & Accessibility Testing
 *
 * Cross-browser testing configuration for:
 * - Chromium (Chrome, Edge)
 * - Firefox
 * - WebKit (Safari)
 * - Mobile browsers (iOS Safari, Chrome Android)
 */

import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './apps/web/src/__tests__',
  testMatch: ['**/*visual*.test.ts', '**/*accessibility*.test.ts', '**/*wcag*.test.ts'],

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report/visual' }],
    ['json', { outputFile: 'playwright-report/visual/results.json' }],
    ['junit', { outputFile: 'playwright-report/visual/results.xml' }],
    ['list'],
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'http://localhost:3006',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',

    /* Extra HTTP headers */
    extraHTTPHeaders: {
      'Accept-Language': 'en-US',
    },
  },

  /* Configure projects for major browsers */
  projects: [
    // Desktop Browsers - Chromium
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        colorScheme: 'light',
      },
    },
    {
      name: 'chromium-desktop-dark',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        colorScheme: 'dark',
      },
    },

    // Desktop Browsers - Firefox
    {
      name: 'firefox-desktop',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
        colorScheme: 'light',
      },
    },
    {
      name: 'firefox-desktop-dark',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
        colorScheme: 'dark',
      },
    },

    // Desktop Browsers - WebKit (Safari)
    {
      name: 'webkit-desktop',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
        colorScheme: 'light',
      },
    },
    {
      name: 'webkit-desktop-dark',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
        colorScheme: 'dark',
      },
    },

    // Desktop - Microsoft Edge
    {
      name: 'edge-desktop',
      use: {
        ...devices['Desktop Edge'],
        viewport: { width: 1920, height: 1080 },
        channel: 'msedge',
      },
    },

    // Tablet Devices
    {
      name: 'ipad-pro',
      use: {
        ...devices['iPad Pro'],
      },
    },
    {
      name: 'ipad',
      use: {
        ...devices['iPad (gen 7)'],
      },
    },
    {
      name: 'tablet-landscape',
      use: {
        ...devices['iPad Pro landscape'],
      },
    },

    // Mobile Devices - iOS
    {
      name: 'iphone-14-pro',
      use: {
        ...devices['iPhone 14 Pro'],
      },
    },
    {
      name: 'iphone-14',
      use: {
        ...devices['iPhone 14'],
      },
    },
    {
      name: 'iphone-13',
      use: {
        ...devices['iPhone 13'],
      },
    },
    {
      name: 'iphone-12',
      use: {
        ...devices['iPhone 12'],
      },
    },

    // Mobile Devices - Android
    {
      name: 'pixel-7',
      use: {
        ...devices['Pixel 7'],
      },
    },
    {
      name: 'pixel-5',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'galaxy-s9-plus',
      use: {
        ...devices['Galaxy S9+'],
      },
    },

    // Accessibility Testing - Specific Configurations
    {
      name: 'accessibility-high-contrast',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        colorScheme: 'dark',
        forcedColors: 'active',
      },
    },
    {
      name: 'accessibility-reduced-motion',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        reducedMotion: 'reduce',
      },
    },
    {
      name: 'accessibility-zoom-200',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 640, height: 360 }, // Simulates 200% zoom on 1280x720
      },
    },

    // Screen Reader Testing Configurations
    {
      name: 'screen-reader-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        // Screen reader testing - requires manual verification
        extraHTTPHeaders: {
          'User-Agent': 'NVDA/JAWS Screen Reader Testing',
        },
      },
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.CI
    ? undefined
    : {
        command: 'pnpm dev',
        url: 'http://localhost:3006',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
        env: {
          NODE_ENV: 'test',
        },
      },

  /* Global timeout for each test */
  timeout: 60000,

  /* Global setup/teardown */
  // globalSetup: require.resolve('./apps/web/src/__tests__/global-setup.ts'),
  // globalTeardown: require.resolve('./apps/web/src/__tests__/global-teardown.ts'),

  /* Expect timeout */
  expect: {
    timeout: 10000,
  },
});
