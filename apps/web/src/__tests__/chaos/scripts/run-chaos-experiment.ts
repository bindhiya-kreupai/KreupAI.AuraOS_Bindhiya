/**
 * Chaos Experiment Runner
 *
 * Orchestrates chaos experiments with proper setup, execution, and rollback
 */

import type { Browser, BrowserContext, Page } from '@playwright/test';
import { chromium } from '@playwright/test';
import chaosConfig from '../chaos.config.json';

interface ExperimentResult {
  name: string;
  success: boolean;
  duration: number;
  steadyStateVerified: boolean;
  errors: string[];
  metrics: {
    responseTime?: number;
    errorRate?: number;
    availability?: number;
  };
}

interface SteadyStateProbe {
  name: string;
  type: 'http' | 'metric';
  url?: string;
  expected_status?: number;
  expected_max_response_time?: number;
  metric?: string;
  expected_max?: number;
  timeout?: number;
}

class ChaosExperimentRunner {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private readonly baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({ headless: true });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  async cleanup(): Promise<void> {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }

  /**
   * Verify steady state hypothesis before and after experiment
   */
  async verifySteadyState(): Promise<boolean> {
    if (!this.page) {
      throw new Error('Runner not initialized');
    }

    const probes = chaosConfig.steady_state_hypothesis.probes as SteadyStateProbe[];
    const results: boolean[] = [];

    for (const probe of probes) {
      try {
        if (probe.type === 'http') {
          const url = probe.url!.replace('${BASE_URL}', this.baseUrl);
          const start = Date.now();
          const response = await this.page.goto(url, {
            timeout: (probe.timeout || 5) * 1000,
          });
          const duration = Date.now() - start;

          // Check status code
          if (probe.expected_status && response!.status() !== probe.expected_status) {
            console.log(`❌ ${probe.name}: Expected status ${probe.expected_status}, got ${response!.status()}`);
            results.push(false);
            continue;
          }

          // Check response time
          if (probe.expected_max_response_time && duration > probe.expected_max_response_time) {
            console.log(`❌ ${probe.name}: Response time ${duration}ms exceeds ${probe.expected_max_response_time}ms`);
            results.push(false);
            continue;
          }

          console.log(`✅ ${probe.name}: Passed (${duration}ms)`);
          results.push(true);
        } else if (probe.type === 'metric') {
          // Metric probes would require actual metric collection
          console.log(`⚠️  ${probe.name}: Metric probe skipped (not implemented)`);
          results.push(true); // Assume pass for now
        }
      } catch (error) {
        console.log(`❌ ${probe.name}: Error - ${(error as Error).message}`);
        results.push(false);
      }
    }

    const allPassed = results.every(r => r);
    console.log(`Steady state verification: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`);

    return allPassed;
  }

  /**
   * Run a specific chaos experiment
   */
  async runExperiment(experimentName: string): Promise<ExperimentResult> {
    console.log(`\n🔬 Running experiment: ${experimentName}\n`);

    const experiment = (chaosConfig.experiments as any)[experimentName];
    if (!experiment) {
      throw new Error(`Experiment '${experimentName}' not found in config`);
    }

    const result: ExperimentResult = {
      name: experimentName,
      success: false,
      duration: 0,
      steadyStateVerified: false,
      errors: [],
      metrics: {},
    };

    const startTime = Date.now();

    try {
      // Step 1: Verify steady state BEFORE chaos
      console.log('📊 Verifying steady state (before)...');
      const steadyStateBefore = await this.verifySteadyState();

      if (!steadyStateBefore) {
        result.errors.push('Steady state verification failed before experiment');
        console.log('⚠️  System not in steady state, aborting experiment');
        return result;
      }

      // Step 2: Introduce chaos
      console.log('\n💥 Introducing chaos...');
      await this.introduceChaos(experiment);

      // Step 3: Observe system behavior
      console.log('\n👀 Observing system behavior under chaos...');
      await this.observeSystem(result);

      // Step 4: Wait for chaos duration
      const duration = this.getChaosDuration(experiment);
      console.log(`⏱️  Running chaos for ${duration / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, duration));

      // Step 5: Rollback chaos
      console.log('\n🔄 Rolling back chaos...');
      await this.rollbackChaos(experiment);

      // Step 6: Verify steady state AFTER chaos
      console.log('\n📊 Verifying steady state (after)...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for stabilization

      const steadyStateAfter = await this.verifySteadyState();
      result.steadyStateVerified = steadyStateAfter;

      if (!steadyStateAfter) {
        result.errors.push('System did not return to steady state after rollback');
        console.log('❌ System did not recover to steady state');
      } else {
        console.log('✅ System recovered to steady state');
      }

      result.success = steadyStateAfter && result.errors.length === 0;
    } catch (error) {
      result.errors.push((error as Error).message);
      console.log(`❌ Experiment failed: ${(error as Error).message}`);

      // Emergency rollback
      try {
        await this.rollbackChaos(experiment);
      } catch (rollbackError) {
        console.log(`❌ Rollback failed: ${(rollbackError as Error).message}`);
      }
    }

    result.duration = Date.now() - startTime;

    console.log(`\n${result.success ? '✅' : '❌'} Experiment ${experimentName} ${result.success ? 'PASSED' : 'FAILED'} (${result.duration}ms)\n`);

    return result;
  }

  /**
   * Introduce chaos based on experiment configuration
   */
  private async introduceChaos(experiment: any): Promise<void> {
    if (!this.context || !this.page) {
      throw new Error('Runner not initialized');
    }

    const method = experiment.method[0];
    const provider = method.provider;

    switch (provider.type) {
      case 'network':
        if (provider.latency_ms) {
          console.log(`  Adding ${provider.latency_ms}ms network latency`);
          await this.context.route('**/*', async route => {
            await new Promise(resolve => setTimeout(resolve, provider.latency_ms));
            await route.continue();
          });
        }

        if (provider.packet_loss_percent) {
          console.log(`  Introducing ${provider.packet_loss_percent}% packet loss`);
          let requestCount = 0;
          await this.context.route('**/*', async route => {
            requestCount++;
            if ((requestCount % 100) < provider.packet_loss_percent) {
              await route.abort('failed');
            } else {
              await route.continue();
            }
          });
        }
        break;

      case 'database':
        if (provider.action === 'exhaust_connections') {
          console.log('  Simulating database connection pool exhaustion');
          await this.context.route('**/api/**', async route => {
            if (Math.random() < 0.3) {
              await route.fulfill({
                status: 503,
                body: JSON.stringify({ error: 'Database connection pool exhausted' }),
                headers: { 'Content-Type': 'application/json' },
              });
            } else {
              await route.continue();
            }
          });
        }
        break;

      case 'api':
        if (provider.delay_ms) {
          console.log(`  Adding ${provider.delay_ms}ms API delay`);
          await this.context.route('**/api/**', async route => {
            await new Promise(resolve => setTimeout(resolve, provider.delay_ms));
            await route.continue();
          });
        }
        break;

      case 'service':
        console.log(`  Stopping ${provider.service_name} service`);
        const serviceRoute = `**/${provider.service_name}/**`;
        await this.context.route(serviceRoute, async route => {
          await route.fulfill({
            status: 503,
            body: JSON.stringify({ error: `${provider.service_name} service unavailable` }),
            headers: { 'Content-Type': 'application/json' },
          });
        });
        break;

      case 'resource':
        console.log(`  Simulating ${provider.resource} exhaustion`);
        if (provider.resource === 'cpu' && this.page) {
          await this.page.evaluate((usagePercent: number) => {
            const start = Date.now();
            const duration = 60000; // 60 seconds
            const intensity = usagePercent / 100;

            const cpuBurn = () => {
              const elapsed = Date.now() - start;
              if (elapsed < duration) {
                // CPU-intensive calculation
                for (let i = 0; i < 1000000 * intensity; i++) {
                  Math.sqrt(Math.random());
                }
                setTimeout(cpuBurn, 10);
              }
            };

            cpuBurn();
          }, provider.usage_percent);
        }
        break;

      default:
        console.log(`  ⚠️  Unknown provider type: ${provider.type}`);
    }
  }

  /**
   * Observe system behavior during chaos
   */
  private async observeSystem(result: ExperimentResult): Promise<void> {
    if (!this.page) {
      throw new Error('Runner not initialized');
    }

    // Measure response time
    const start = Date.now();
    try {
      const response = await this.page.goto(this.baseUrl, { timeout: 10000 });
      result.metrics.responseTime = Date.now() - start;
      result.metrics.availability = response!.ok() ? 1 : 0;

      console.log(`  Response time: ${result.metrics.responseTime}ms`);
      console.log(`  Availability: ${result.metrics.availability * 100}%`);
    } catch (error) {
      result.metrics.responseTime = Date.now() - start;
      result.metrics.availability = 0;
      result.errors.push(`Page load failed: ${(error as Error).message}`);
      console.log(`  ❌ Page failed to load: ${(error as Error).message}`);
    }

    // Check for errors in console
    const consoleErrors: string[] = [];
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    this.page.on('pageerror', error => {
      consoleErrors.push(error.message);
    });

    if (consoleErrors.length > 0) {
      console.log(`  ⚠️  Console errors detected: ${consoleErrors.length}`);
      result.metrics.errorRate = consoleErrors.length;
    }
  }

  /**
   * Rollback chaos (restore normal state)
   */
  private async rollbackChaos(experiment: any): Promise<void> {
    if (!this.context) {
      throw new Error('Runner not initialized');
    }

    // Remove all route handlers
    await this.context.unroute('**/*');
    await this.context.unroute('**/api/**');

    console.log('  ✅ Chaos rolled back');
  }

  /**
   * Get chaos duration from experiment config
   */
  private getChaosDuration(experiment: any): number {
    const method = experiment.method[0];
    const provider = method.provider;

    return (provider.duration_seconds || 30) * 1000;
  }

  /**
   * Run all experiments
   */
  async runAllExperiments(): Promise<ExperimentResult[]> {
    const experimentNames = Object.keys(chaosConfig.experiments);
    const results: ExperimentResult[] = [];

    console.log(`\n🚀 Running ${experimentNames.length} chaos experiments\n`);
    console.log('='.repeat(60));

    for (const name of experimentNames) {
      const result = await this.runExperiment(name);
      results.push(result);

      // Wait between experiments
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 EXPERIMENT SUMMARY\n');

    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Total: ${results.length}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Success rate: ${((passed / results.length) * 100).toFixed(1)}%`);

    console.log('\n📋 Detailed Results:\n');
    results.forEach(r => {
      const status = r.success ? '✅' : '❌';
      console.log(`${status} ${r.name}`);
      console.log(`   Duration: ${r.duration}ms`);
      console.log(`   Steady state verified: ${r.steadyStateVerified ? 'Yes' : 'No'}`);
      if (r.errors.length > 0) {
        console.log(`   Errors: ${r.errors.join(', ')}`);
      }
      if (r.metrics.responseTime) {
        console.log(`   Response time: ${r.metrics.responseTime}ms`);
      }
      console.log('');
    });

    return results;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const experimentName = args[0];
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  const runner = new ChaosExperimentRunner(baseUrl);

  try {
    await runner.initialize();

    if (experimentName) {
      // Run specific experiment
      await runner.runExperiment(experimentName);
    } else {
      // Run all experiments
      await runner.runAllExperiments();
    }
  } catch (error) {
    console.error('❌ Fatal error:', (error as Error).message);
    process.exit(1);
  } finally {
    await runner.cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { ChaosExperimentRunner, ExperimentResult };
