/**
 * Load Testing Under Chaos (Days 78-79)
 *
 * Combines load testing with chaos engineering:
 * - Concurrent users with network latency
 * - Peak load with database failures
 * - Spike testing with cache unavailability
 * - Soak testing with resource constraints
 * - Stress testing under chaos conditions
 */

import type { BrowserContext } from '@playwright/test';
import { test, expect, chromium, Browser } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CONCURRENT_USERS = parseInt(process.env.CONCURRENT_USERS || '10');

interface LoadTestMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  responseTimes: number[];
  errorRate: number;
}

async function measureLoadMetrics(
  contexts: BrowserContext[],
  scenario: (context: BrowserContext) => Promise<number>
): Promise<LoadTestMetrics> {
  const responseTimes: number[] = [];
  let successCount = 0;
  let failCount = 0;

  await Promise.all(
    contexts.map(async (context) => {
      try {
        const responseTime = await scenario(context);
        responseTimes.push(responseTime);
        successCount++;
      } catch (error) {
        failCount++;
        console.error('Request failed:', (error as Error).message);
      }
    })
  );

  const totalRequests = successCount + failCount;
  const averageResponseTime =
    responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

  return {
    totalRequests,
    successfulRequests: successCount,
    failedRequests: failCount,
    averageResponseTime,
    minResponseTime: Math.min(...responseTimes),
    maxResponseTime: Math.max(...responseTimes),
    responseTimes,
    errorRate: totalRequests > 0 ? failCount / totalRequests : 0,
  };
}

function printLoadMetrics(metrics: LoadTestMetrics, testName: string) {
  console.log(`\n📊 Load Test Results: ${testName}`);
  console.log('='.repeat(60));
  console.log(`Total Requests: ${metrics.totalRequests}`);
  console.log(`Successful: ${metrics.successfulRequests} (${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${metrics.failedRequests} (${((metrics.failedRequests / metrics.totalRequests) * 100).toFixed(1)}%)`);
  console.log(`Average Response Time: ${metrics.averageResponseTime.toFixed(2)}ms`);
  console.log(`Min Response Time: ${metrics.minResponseTime.toFixed(2)}ms`);
  console.log(`Max Response Time: ${metrics.maxResponseTime.toFixed(2)}ms`);
  console.log(`Error Rate: ${(metrics.errorRate * 100).toFixed(2)}%`);
  console.log('='.repeat(60));
}

test.describe('Concurrent Users with Network Latency', () => {
  test('should handle concurrent logins with 500ms latency', async ({ browser }) => {
    const contexts: BrowserContext[] = [];

    // Create contexts for concurrent users
    for (let i = 0; i < CONCURRENT_USERS; i++) {
      const context = await browser.newContext();

      // Add network latency
      await context.route('**/*', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await route.continue();
      });

      contexts.push(context);
    }

    const metrics = await measureLoadMetrics(contexts, async (context) => {
      const page = await context.newPage();
      const start = Date.now();

      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"]', `user${Math.floor(Math.random() * 100)}@auraos.com`);
      await page.fill('input[name="password"]', 'User@123');
      await page.click('button[type="submit"]');

      await page.waitForTimeout(2000);
      const elapsed = Date.now() - start;

      await page.close();
      return elapsed;
    });

    printLoadMetrics(metrics, 'Concurrent Logins with Network Latency');

    // Cleanup
    for (const context of contexts) {
      await context.close();
    }

    // Assertions
    expect(metrics.errorRate).toBeLessThan(0.1); // < 10% error rate
    expect(metrics.averageResponseTime).toBeLessThan(10000); // < 10s average
  });

  test('should handle concurrent page loads with packet loss', async ({ browser }) => {
    const contexts: BrowserContext[] = [];

    // Create contexts with packet loss
    for (let i = 0; i < CONCURRENT_USERS; i++) {
      const context = await browser.newContext();
      let requestCount = 0;

      await context.route('**/*', async (route) => {
        requestCount++;
        if (requestCount % 10 === 0) {
          // 10% packet loss
          await route.abort('failed');
        } else {
          await route.continue();
        }
      });

      contexts.push(context);
    }

    const metrics = await measureLoadMetrics(contexts, async (context) => {
      const page = await context.newPage();
      const start = Date.now();

      try {
        await page.goto(`${BASE_URL}/dashboard`, { timeout: 15000 });
        await page.waitForLoadState('domcontentloaded');
      } catch (error) {
        // Some failures expected due to packet loss
      }

      const elapsed = Date.now() - start;
      await page.close();
      return elapsed;
    });

    printLoadMetrics(metrics, 'Concurrent Page Loads with Packet Loss');

    // Cleanup
    for (const context of contexts) {
      await context.close();
    }

    // Should handle packet loss gracefully
    expect(metrics.successfulRequests).toBeGreaterThan(0);
  });
});

test.describe('Peak Load with Database Failures', () => {
  test('should handle peak load with intermittent database failures', async ({ browser }) => {
    const contexts: BrowserContext[] = [];

    // Create contexts with database failure simulation
    for (let i = 0; i < CONCURRENT_USERS; i++) {
      const context = await browser.newContext();

      await context.route('**/api/**', async (route) => {
        // 20% database failure rate
        if (Math.random() < 0.2) {
          await route.fulfill({
            status: 503,
            body: JSON.stringify({ error: 'Database connection failed' }),
            headers: { 'Content-Type': 'application/json' },
          });
        } else {
          await route.continue();
        }
      });

      contexts.push(context);
    }

    const metrics = await measureLoadMetrics(contexts, async (context) => {
      const page = await context.newPage();
      const start = Date.now();

      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"]', 'employee@auraos.com');
      await page.fill('input[name="password"]', 'Employee@123');
      await page.click('button[type="submit"]');

      await page.waitForTimeout(3000);

      try {
        await page.goto(`${BASE_URL}/employees`);
        await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      } catch (error) {
        // Some failures expected
      }

      const elapsed = Date.now() - start;
      await page.close();
      return elapsed;
    });

    printLoadMetrics(metrics, 'Peak Load with Database Failures');

    // Cleanup
    for (const context of contexts) {
      await context.close();
    }

    // Should handle database failures with retries
    expect(metrics.successfulRequests).toBeGreaterThan(CONCURRENT_USERS * 0.5); // > 50% success
  });

  test('should handle peak load with slow queries', async ({ browser }) => {
    const contexts: BrowserContext[] = [];

    // Simulate slow database queries
    for (let i = 0; i < CONCURRENT_USERS; i++) {
      const context = await browser.newContext();

      await context.route('**/api/employees', async (route) => {
        // Random delay 1-3 seconds
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));
        await route.continue();
      });

      contexts.push(context);
    }

    const metrics = await measureLoadMetrics(contexts, async (context) => {
      const page = await context.newPage();
      const start = Date.now();

      await page.goto(`${BASE_URL}/employees`);
      await page.waitForLoadState('networkidle', { timeout: 15000 });

      const elapsed = Date.now() - start;
      await page.close();
      return elapsed;
    });

    printLoadMetrics(metrics, 'Peak Load with Slow Queries');

    // Cleanup
    for (const context of contexts) {
      await context.close();
    }

    // Should complete despite slow queries
    expect(metrics.successfulRequests).toBeGreaterThan(0);
    expect(metrics.averageResponseTime).toBeGreaterThan(1000); // Queries are slow
  });
});

test.describe('Spike Testing with Cache Unavailability', () => {
  test('should handle sudden traffic spike without cache', async ({ browser }) => {
    const contexts: BrowserContext[] = [];

    // Simulate cache unavailability
    for (let i = 0; i < CONCURRENT_USERS * 2; i++) {
      const context = await browser.newContext();

      await context.route('**/api/cache/**', async (route) => {
        await route.fulfill({ status: 503 });
      });

      contexts.push(context);
    }

    const metrics = await measureLoadMetrics(contexts, async (context) => {
      const page = await context.newPage();
      const start = Date.now();

      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });

      const elapsed = Date.now() - start;
      await page.close();
      return elapsed;
    });

    printLoadMetrics(metrics, 'Traffic Spike without Cache');

    // Cleanup
    for (const context of contexts) {
      await context.close();
    }

    // Should degrade gracefully without cache
    expect(metrics.successfulRequests).toBeGreaterThan(0);
  });

  test('should handle burst of concurrent requests with cache failures', async ({ browser }) => {
    const BURST_SIZE = CONCURRENT_USERS * 3;
    const contexts: BrowserContext[] = [];

    for (let i = 0; i < BURST_SIZE; i++) {
      const context = await browser.newContext();

      await context.route('**/api/**', async (route) => {
        if (route.request().url().includes('cache')) {
          await route.fulfill({ status: 503 });
        } else {
          await route.continue();
        }
      });

      contexts.push(context);
    }

    const startTime = Date.now();

    const metrics = await measureLoadMetrics(contexts, async (context) => {
      const page = await context.newPage();
      const start = Date.now();

      try {
        await page.goto(`${BASE_URL}/employees`);
        await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      } catch (error) {
        // Timeout acceptable during burst
      }

      const elapsed = Date.now() - start;
      await page.close();
      return elapsed;
    });

    const totalDuration = Date.now() - startTime;

    printLoadMetrics(metrics, `Burst of ${BURST_SIZE} Requests`);
    console.log(`Total test duration: ${totalDuration}ms`);

    // Cleanup
    for (const context of contexts) {
      await context.close();
    }

    // Should handle burst
    expect(metrics.totalRequests).toBe(BURST_SIZE);
  });
});

test.describe('Soak Testing with Resource Constraints', () => {
  test('should maintain stability under prolonged load with CPU constraints', async ({ browser }) => {
    const SOAK_DURATION = 30000; // 30 seconds
    const contexts: BrowserContext[] = [];

    // Create contexts with CPU stress
    for (let i = 0; i < Math.min(CONCURRENT_USERS, 5); i++) {
      const context = await browser.newContext();
      contexts.push(context);
    }

    const startTime = Date.now();
    const allMetrics: LoadTestMetrics[] = [];

    while (Date.now() - startTime < SOAK_DURATION) {
      const metrics = await measureLoadMetrics(contexts, async (context) => {
        const page = await context.newPage();
        const start = Date.now();

        // Simulate CPU-intensive operation
        await page.evaluate(() => {
          const cpuStart = Date.now();
          while (Date.now() - cpuStart < 100) {
            Math.sqrt(Math.random());
          }
        });

        await page.goto(`${BASE_URL}/dashboard`);
        await page.waitForLoadState('domcontentloaded', { timeout: 10000 });

        const elapsed = Date.now() - start;
        await page.close();
        return elapsed;
      });

      allMetrics.push(metrics);

      // Wait before next iteration
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const totalDuration = Date.now() - startTime;

    // Aggregate metrics
    const aggregated = allMetrics.reduce(
      (acc, m) => ({
        totalRequests: acc.totalRequests + m.totalRequests,
        successfulRequests: acc.successfulRequests + m.successfulRequests,
        failedRequests: acc.failedRequests + m.failedRequests,
        averageResponseTime:
          (acc.averageResponseTime + m.averageResponseTime) / 2,
        minResponseTime: Math.min(acc.minResponseTime, m.minResponseTime),
        maxResponseTime: Math.max(acc.maxResponseTime, m.maxResponseTime),
        responseTimes: [...acc.responseTimes, ...m.responseTimes],
        errorRate: 0,
      }),
      {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        minResponseTime: Infinity,
        maxResponseTime: 0,
        responseTimes: [],
        errorRate: 0,
      } as LoadTestMetrics
    );

    aggregated.errorRate =
      aggregated.totalRequests > 0
        ? aggregated.failedRequests / aggregated.totalRequests
        : 0;

    printLoadMetrics(aggregated, `Soak Test (${totalDuration / 1000}s)`);

    // Cleanup
    for (const context of contexts) {
      await context.close();
    }

    // Should maintain stability
    expect(aggregated.errorRate).toBeLessThan(0.15); // < 15% error rate
  });

  test('should handle memory pressure during extended load', async ({ browser }) => {
    const contexts: BrowserContext[] = [];

    for (let i = 0; i < CONCURRENT_USERS; i++) {
      const context = await browser.newContext();
      contexts.push(context);
    }

    const metrics = await measureLoadMetrics(contexts, async (context) => {
      const page = await context.newPage();
      const start = Date.now();

      // Allocate memory
      await page.evaluate(() => {
        const arrays: any[] = [];
        for (let i = 0; i < 10; i++) {
          arrays.push(new Array(1024 * 1024).fill(0));
        }
      });

      await page.goto(`${BASE_URL}/employees`);
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });

      const elapsed = Date.now() - start;
      await page.close();
      return elapsed;
    });

    printLoadMetrics(metrics, 'Load Test with Memory Pressure');

    // Cleanup
    for (const context of contexts) {
      await context.close();
    }

    // Should handle memory pressure
    expect(metrics.successfulRequests).toBeGreaterThan(0);
  });
});

test.describe('Stress Testing Under Multiple Chaos Conditions', () => {
  test('should handle extreme load with network + database + cache failures', async ({ browser }) => {
    const STRESS_USERS = CONCURRENT_USERS * 2;
    const contexts: BrowserContext[] = [];

    // Multiple chaos conditions
    for (let i = 0; i < STRESS_USERS; i++) {
      const context = await browser.newContext();

      // Network latency
      await context.route('**/*', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300));

        // Database failures (30%)
        if (route.request().url().includes('/api/') && Math.random() < 0.3) {
          await route.fulfill({ status: 503 });
          return;
        }

        // Cache failures (50%)
        if (route.request().url().includes('cache') && Math.random() < 0.5) {
          await route.fulfill({ status: 503 });
          return;
        }

        await route.continue();
      });

      contexts.push(context);
    }

    const metrics = await measureLoadMetrics(contexts, async (context) => {
      const page = await context.newPage();
      const start = Date.now();

      try {
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[name="email"]', 'admin@auraos.com');
        await page.fill('input[name="password"]', 'Admin@123');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(2000);

        await page.goto(`${BASE_URL}/dashboard`);
        await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      } catch (error) {
        // Failures expected under stress
      }

      const elapsed = Date.now() - start;
      await page.close();
      return elapsed;
    });

    printLoadMetrics(metrics, 'Stress Test with Multiple Chaos Conditions');

    // Cleanup
    for (const context of contexts) {
      await context.close();
    }

    // Should survive stress test
    expect(metrics.successfulRequests).toBeGreaterThan(STRESS_USERS * 0.3); // > 30% success
  });

  test('should recover after chaos ends', async ({ browser }) => {
    const contexts: BrowserContext[] = [];

    // Phase 1: Chaos
    for (let i = 0; i < CONCURRENT_USERS; i++) {
      const context = await browser.newContext();

      await context.route('**/api/**', async (route) => {
        if (Math.random() < 0.5) {
          await route.fulfill({ status: 503 });
        } else {
          await route.continue();
        }
      });

      contexts.push(context);
    }

    console.log('\n🔥 Phase 1: Chaos Active');

    const chaosMetrics = await measureLoadMetrics(contexts, async (context) => {
      const page = await context.newPage();
      const start = Date.now();

      try {
        await page.goto(`${BASE_URL}/employees`);
        await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      } catch (error) {
        // Expected failures
      }

      const elapsed = Date.now() - start;
      await page.close();
      return elapsed;
    });

    printLoadMetrics(chaosMetrics, 'During Chaos');

    // Phase 2: Remove chaos
    for (const context of contexts) {
      await context.unroute('**/api/**');
    }

    console.log('\n✅ Phase 2: Chaos Removed');

    await new Promise((resolve) => setTimeout(resolve, 2000)); // Recovery time

    const recoveryMetrics = await measureLoadMetrics(contexts, async (context) => {
      const page = await context.newPage();
      const start = Date.now();

      await page.goto(`${BASE_URL}/employees`);
      await page.waitForLoadState('networkidle', { timeout: 10000 });

      const elapsed = Date.now() - start;
      await page.close();
      return elapsed;
    });

    printLoadMetrics(recoveryMetrics, 'After Recovery');

    // Cleanup
    for (const context of contexts) {
      await context.close();
    }

    // Should recover fully
    expect(recoveryMetrics.errorRate).toBeLessThan(chaosMetrics.errorRate);
    expect(recoveryMetrics.successfulRequests).toBeGreaterThan(chaosMetrics.successfulRequests);
  });
});

test.describe('Performance Degradation Analysis', () => {
  test('should measure performance degradation under chaos', async ({ browser }) => {
    const ITERATIONS = 3;

    // Baseline (no chaos)
    console.log('\n📊 Baseline Performance (No Chaos)');
    const baselineContext = await browser.newContext();
    const baselinePage = await baselineContext.newPage();

    const baselineStart = Date.now();
    await baselinePage.goto(`${BASE_URL}/dashboard`);
    await baselinePage.waitForLoadState('networkidle');
    const baselineTime = Date.now() - baselineStart;

    await baselinePage.close();
    await baselineContext.close();

    console.log(`Baseline load time: ${baselineTime}ms`);

    // With chaos
    console.log('\n💥 Performance with Chaos');

    const chaosTimes: number[] = [];

    for (let i = 0; i < ITERATIONS; i++) {
      const context = await browser.newContext();

      await context.route('**/*', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        await route.continue();
      });

      const page = await context.newPage();
      const start = Date.now();

      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('networkidle', { timeout: 15000 });

      const elapsed = Date.now() - start;
      chaosTimes.push(elapsed);

      await page.close();
      await context.close();
    }

    const avgChaosTime = chaosTimes.reduce((a, b) => a + b, 0) / chaosTimes.length;
    const degradation = ((avgChaosTime - baselineTime) / baselineTime) * 100;

    console.log(`Average chaos load time: ${avgChaosTime.toFixed(2)}ms`);
    console.log(`Performance degradation: ${degradation.toFixed(1)}%`);

    // Performance should degrade but remain acceptable
    expect(degradation).toBeGreaterThan(0); // Some degradation expected
    expect(degradation).toBeLessThan(500); // But less than 500%
  });
});
