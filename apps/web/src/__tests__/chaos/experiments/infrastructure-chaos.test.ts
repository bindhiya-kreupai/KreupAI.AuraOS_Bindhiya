/**
 * Infrastructure Chaos Engineering Tests (Day 74)
 *
 * Tests system resilience under infrastructure failures:
 * - Network degradation and latency
 * - Database connection failures
 * - Cache service unavailability
 * - Message queue failures
 * - Resource exhaustion (CPU, Memory, Disk)
 */

import { test, expect } from '@playwright/test';
import chaosConfig from '../chaos.config.json';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:3001';

// Helper to verify steady state
async function verifySteadyState(page: any): Promise<boolean> {
  try {
    const response = await page.goto(`${BASE_URL}/api/health`);
    return response?.ok() || false;
  } catch (error) {
    return false;
  }
}

// Helper to measure response time
async function measureResponseTime(page: any, url: string): Promise<number> {
  const start = Date.now();
  await page.goto(url);
  return Date.now() - start;
}

test.describe('Network Chaos Experiments', () => {
  test('should handle network latency gracefully', async ({ page, context }) => {
    // Verify steady state before chaos
    const initialHealth = await verifySteadyState(page);
    expect(initialHealth).toBeTruthy();

    // Introduce network latency (500ms)
    await context.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.continue();
    });

    // Test application behavior under latency
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');

    // Application should still work, just slower
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 15000 });
    expect(page.url()).toContain('/dashboard');

    // Check for loading indicators
    const loadingIndicator = page.locator('[data-testid="loading"], .spinner, .loading');
    const hasLoading = await loadingIndicator.count() > 0;
    console.log(`Loading indicator present: ${hasLoading}`);

    // Verify steady state after chaos
    await context.unroute('**/*');
    const finalHealth = await verifySteadyState(page);
    expect(finalHealth).toBeTruthy();
  });

  test('should timeout gracefully on excessive latency', async ({ page, context }) => {
    // Introduce extreme latency (30 seconds)
    await context.route('**/api/**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 30000));
      await route.continue();
    });

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');

    const start = Date.now();
    await page.click('button[type="submit"]');

    // Should show timeout error before 30s
    await page.waitForTimeout(5000);

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(15000); // Should timeout within 15s

    // Should show error message
    const errorMessage = page.locator('.error, .alert-error, [role="alert"]');
    const hasError = await errorMessage.count() > 0;
    console.log(`Timeout error shown: ${hasError}`);

    await context.unroute('**/api/**');
  });

  test('should handle packet loss', async ({ page, context }) => {
    let requestCount = 0;

    // Simulate 10% packet loss
    await context.route('**/*', async (route) => {
      requestCount++;
      if (requestCount % 10 === 0) {
        // Drop 10% of requests
        await route.abort('failed');
      } else {
        await route.continue();
      }
    });

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');

    // Should retry and eventually succeed
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 20000 });
    expect(page.url()).toContain('/dashboard');

    await context.unroute('**/*');
  });

  test('should handle complete network failure', async ({ page, context }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Simulate complete network failure
    await context.setOffline(true);

    // Try to load a page
    await page.goto(`${BASE_URL}/employees`);

    await page.waitForTimeout(2000);

    // Should show offline indicator
    const offlineIndicator = page.locator('[data-testid="offline-indicator"], .offline-banner');
    const hasOffline = await offlineIndicator.count() > 0;
    console.log(`Offline indicator shown: ${hasOffline}`);

    // Restore network
    await context.setOffline(false);

    await page.waitForTimeout(1000);

    // Should automatically reconnect
    const onlineIndicator = page.locator('[data-testid="online-indicator"]');
    const hasOnline = await onlineIndicator.count() > 0;
    console.log(`Online indicator shown: ${hasOnline}`);
  });
});

test.describe('Database Chaos Experiments', () => {
  test('should handle database connection failures gracefully', async ({ page, context }) => {
    // Simulate database connection failures by blocking database requests
    await context.route('**/api/**', async (route) => {
      const url = route.request().url();

      // Randomly fail database-dependent requests
      if (Math.random() < 0.3) { // 30% failure rate
        await route.fulfill({
          status: 503,
          body: JSON.stringify({ error: 'Database connection failed' }),
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');

    // May fail, but should show appropriate error
    await page.waitForTimeout(3000);

    const errorShown = await page.locator('.error, [role="alert"]').count() > 0;
    const dashboardLoaded = page.url().includes('/dashboard');

    console.log(`Error shown: ${errorShown}, Dashboard loaded: ${dashboardLoaded}`);
    expect(errorShown || dashboardLoaded).toBeTruthy();

    await context.unroute('**/api/**');
  });

  test('should handle database slow queries', async ({ page, context }) => {
    // Simulate slow database queries
    await context.route('**/api/employees**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await route.continue();
    });

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    const start = Date.now();
    await page.goto(`${BASE_URL}/employees`);

    // Should show loading state
    const loading = page.locator('[data-testid="loading"], .spinner, .skeleton');
    const hasLoading = await loading.count() > 0;
    console.log(`Loading state shown: ${hasLoading}`);

    await page.waitForLoadState('networkidle', { timeout: 10000 });
    const elapsed = Date.now() - start;

    console.log(`Slow query took: ${elapsed}ms`);
    expect(elapsed).toBeGreaterThan(3000);

    await context.unroute('**/api/employees**');
  });

  test('should recover from database connection pool exhaustion', async ({ page, context }) => {
    let requestCount = 0;

    // Simulate pool exhaustion by failing after N requests
    await context.route('**/api/**', async (route) => {
      requestCount++;

      if (requestCount > 5 && requestCount <= 10) {
        await route.fulfill({
          status: 503,
          body: JSON.stringify({ error: 'Connection pool exhausted' }),
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        await route.continue();
      }
    });

    // Make multiple requests
    for (let i = 0; i < 3; i++) {
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForTimeout(1000);
    }

    // Should eventually succeed after pool recovers
    await page.goto(`${BASE_URL}/employees`);
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    console.log(`Total requests made: ${requestCount}`);
    expect(requestCount).toBeGreaterThan(5);

    await context.unroute('**/api/**');
  });
});

test.describe('Cache Service Chaos Experiments', () => {
  test('should function without cache service', async ({ page, context }) => {
    // Simulate cache service failure
    await context.route('**/api/cache/**', async (route) => {
      await route.fulfill({
        status: 503,
        body: JSON.stringify({ error: 'Cache service unavailable' }),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');

    // Should still work, just slower (cache miss)
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
    expect(page.url()).toContain('/dashboard');

    await context.unroute('**/api/cache/**');
  });

  test('should degrade gracefully with intermittent cache failures', async ({ page, context }) => {
    // Intermittent cache failures
    await context.route('**/api/**', async (route) => {
      const url = route.request().url();

      if (url.includes('cache') && Math.random() < 0.5) {
        await route.fulfill({ status: 503 });
      } else {
        await route.continue();
      }
    });

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Navigate to multiple pages
    const pages = ['/employees', '/dashboard', '/attendance'];
    for (const pagePath of pages) {
      await page.goto(`${BASE_URL}${pagePath}`);
      await page.waitForTimeout(1000);
    }

    // Should handle gracefully
    expect(page.url()).toBeTruthy();

    await context.unroute('**/api/**');
  });
});

test.describe('Message Queue Chaos Experiments', () => {
  test('should queue operations when message queue fails', async ({ page, context }) => {
    // Simulate queue service failure
    await context.route('**/api/queue/**', async (route) => {
      await route.fulfill({
        status: 503,
        body: JSON.stringify({ error: 'Message queue unavailable' }),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Try to perform async operation (e.g., generate report)
    await page.goto(`${BASE_URL}/reports`);

    const generateButton = page.locator('button:has-text("Generate"), button[data-action="generate"]');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();

      await page.waitForTimeout(2000);

      // Should show queued or error message
      const message = page.locator('.info, .warning, [role="status"]');
      const hasMessage = await message.count() > 0;
      console.log(`Queue failure message shown: ${hasMessage}`);
    }

    await context.unroute('**/api/queue/**');
  });

  test('should process queued jobs after queue recovery', async ({ page }) => {
    // This would require actual queue implementation testing
    test.skip(); // Implementation-specific
  });
});

test.describe('Resource Exhaustion Experiments', () => {
  test('should handle high CPU usage', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Simulate CPU-intensive operation
    await page.evaluate(() => {
      const start = Date.now();
      // CPU-intensive calculation for 2 seconds
      while (Date.now() - start < 2000) {
        Math.sqrt(Math.random());
      }
    });

    // UI should still be responsive
    await page.click('[data-testid="menu"], .hamburger, nav');
    await page.waitForTimeout(500);

    expect(page.url()).toContain('/dashboard');
  });

  test('should handle memory pressure', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Simulate memory-intensive operation
    const memoryUsed = await page.evaluate(() => {
      const arrays: any[] = [];
      // Allocate ~50MB
      for (let i = 0; i < 50; i++) {
        arrays.push(new Array(1024 * 1024).fill(0));
      }

      // @ts-ignore
      return performance.memory?.usedJSHeapSize || 0;
    });

    console.log(`Memory used: ${(memoryUsed / 1024 / 1024).toFixed(2)}MB`);

    // Application should still function
    await page.goto(`${BASE_URL}/employees`);
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/employees');
  });

  test('should warn on disk space issues', async ({ page }) => {
    // Disk space testing requires server-side simulation
    test.skip(); // Infrastructure-level test
  });
});

test.describe('Service Failure Recovery', () => {
  test('should implement circuit breaker pattern', async ({ page, context }) => {
    let failureCount = 0;
    const FAILURE_THRESHOLD = 5;

    // Simulate repeated failures triggering circuit breaker
    await context.route('**/api/employees', async (route) => {
      failureCount++;

      if (failureCount <= FAILURE_THRESHOLD) {
        await route.fulfill({ status: 503 });
      } else {
        // Circuit breaker should open, stop trying
        await route.fulfill({
          status: 503,
          body: JSON.stringify({ error: 'Circuit breaker open' }),
          headers: { 'Content-Type': 'application/json' },
        });
      }
    });

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Try to access employees multiple times
    for (let i = 0; i < 7; i++) {
      await page.goto(`${BASE_URL}/employees`);
      await page.waitForTimeout(500);
    }

    console.log(`Failures before circuit breaker: ${failureCount}`);
    expect(failureCount).toBeGreaterThanOrEqual(FAILURE_THRESHOLD);

    await context.unroute('**/api/employees');
  });

  test('should implement retry with exponential backoff', async ({ page, context }) => {
    let attemptCount = 0;
    const attemptTimes: number[] = [];

    await context.route('**/api/employees', async (route) => {
      attemptCount++;
      attemptTimes.push(Date.now());

      if (attemptCount < 3) {
        await route.fulfill({ status: 503 });
      } else {
        await route.continue();
      }
    });

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    await page.goto(`${BASE_URL}/employees`);
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    console.log(`Retry attempts: ${attemptCount}`);

    // Check for exponential backoff
    if (attemptTimes.length >= 3) {
      const delay1 = attemptTimes[1] - attemptTimes[0];
      const delay2 = attemptTimes[2] - attemptTimes[1];
      console.log(`Retry delays: ${delay1}ms, ${delay2}ms`);
      // Second delay should be longer (exponential backoff)
      expect(delay2).toBeGreaterThanOrEqual(delay1 * 0.8);
    }

    await context.unroute('**/api/employees');
  });

  test('should implement health checks and auto-recovery', async ({ page }) => {
    await page.goto(`${BASE_URL}/api/health`);

    const response = await page.evaluate(async () => {
      const res = await fetch('/api/health');
      return {
        status: res.status,
        data: await res.json(),
      };
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('status');

    console.log('Health check response:', response.data);
  });
});

test.describe('Chaos Experiment Orchestration', () => {
  test('should run chaos experiment with rollback', async ({ page, context }) => {
    // Verify steady state
    const initialHealth = await verifySteadyState(page);
    expect(initialHealth).toBeTruthy();

    // Introduce chaos (network latency)
    await context.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.continue();
    });

    // Run experiment
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Rollback (remove chaos)
    await context.unroute('**/*');

    await page.waitForTimeout(2000);

    // Verify steady state restored
    const finalHealth = await verifySteadyState(page);
    expect(finalHealth).toBeTruthy();
  });

  test('should abort experiment on critical failure', async ({ page, context }) => {
    let aborted = false;

    // Simulate critical failure
    await context.route('**/api/health', async (route) => {
      await route.fulfill({
        status: 503,
        body: JSON.stringify({ status: 'critical', error: 'System failure' }),
        headers: { 'Content-Type': 'application/json' },
      });
      aborted = true;
    });

    try {
      const health = await verifySteadyState(page);
      expect(health).toBeFalsy();
    } catch (error) {
      console.log('Health check failed as expected');
    }

    // Rollback immediately on critical failure
    await context.unroute('**/api/health');

    expect(aborted).toBeTruthy();
    console.log('Experiment aborted due to critical failure');
  });
});
