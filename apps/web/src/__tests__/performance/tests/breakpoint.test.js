/**
 * Breakpoint Test
 * Week 9-10: Performance Testing
 *
 * Incrementally increase load until system breaks:
 * - Finds maximum capacity
 * - Identifies breaking point
 * - Discovers bottlenecks
 * - Tests auto-scaling limits
 *
 * Gradually increases load from 10 to 1000+ RPS
 */

import { check, group } from 'k6';
import { apiURL, thresholds, getProfile } from '../k6.config.js';
import {
  login,
  thinkTime,
  authenticatedGet,
  authenticatedPost,
  checkResponse,
  extractData,
  setupScenario,
  teardownScenario,
  generateQueryParams,
} from '../utils/helpers.js';

// Test configuration - using breakpoint profile
export const options = {
  ...getProfile('breakpoint'),

  thresholds: {
    // Relaxed thresholds - we expect system to degrade and fail
    http_req_duration: ['p(95)<2000'], // Allow longer response times
    http_req_failed: ['rate<0.20'], // Allow up to 20% failures as we push limits
  },
};

// Setup
export function setup() {
  setupScenario('Breakpoint Test - Finding System Limits');

  const token = login('admin@e2etest.com', 'Test@1234');

  if (!token) {
    throw new Error('Failed to login');
  }

  // Get baseline data
  const employeesResponse = authenticatedGet(
    `${apiURL}/employees?limit=20`,
    token
  );

  let employeeIds = [];
  if (employeesResponse.status === 200) {
    try {
      const body = JSON.parse(employeesResponse.body);
      if (body.data && Array.isArray(body.data)) {
        employeeIds = body.data.map(emp => emp.id);
      }
    } catch (e) {
      console.error('Failed to parse employees:', e);
    }
  }

  console.log('✅ Breakpoint test starting');
  console.log('⚠️  WARNING: This test will push the system to failure');
  console.log('📊 Monitoring response times and error rates');

  return { token, employeeIds, startTime: Date.now() };
}

// Main test - realistic but aggressive user workflow
export default function (data) {
  const { token, employeeIds, startTime } = data;

  // Calculate current load stage based on elapsed time
  const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
  let loadStage = 'low';

  if (elapsedMinutes < 5) {
    loadStage = 'low'; // 10 RPS
  } else if (elapsedMinutes < 10) {
    loadStage = 'medium'; // 50 RPS
  } else if (elapsedMinutes < 15) {
    loadStage = 'high'; // 100 RPS
  } else if (elapsedMinutes < 20) {
    loadStage = 'very_high'; // 200 RPS
  } else if (elapsedMinutes < 25) {
    loadStage = 'extreme'; // 300 RPS
  } else {
    loadStage = 'breaking'; // 400+ RPS
  }

  // Test 1: Dashboard (lightest operation)
  group('Dashboard Load', () => {
    const response = authenticatedGet(`${apiURL}/dashboard`, token, {
      load_stage: loadStage,
    });

    check(response, {
      'dashboard status is 200': (r) => r.status === 200,
      'dashboard response time < 2000ms': (r) => r.timings.duration < 2000,
    });
  });

  // Test 2: Employee List (medium operation)
  group('Employee List Load', () => {
    const queryParams = generateQueryParams();
    const response = authenticatedGet(`${apiURL}/employees${queryParams}`, token, {
      load_stage: loadStage,
    });

    check(response, {
      'employee list status is 200': (r) => r.status === 200,
      'employee list response time < 2000ms': (r) => r.timings.duration < 2000,
    });
  });

  // Test 3: Employee Details (includes joins)
  if (employeeIds.length > 0) {
    group('Employee Details Load', () => {
      const randomId = employeeIds[Math.floor(Math.random() * employeeIds.length)];
      const response = authenticatedGet(`${apiURL}/employees/${randomId}`, token, {
        load_stage: loadStage,
      });

      check(response, {
        'employee details status is 200': (r) => r.status === 200,
        'employee details response time < 2000ms': (r) => r.timings.duration < 2000,
      });
    });
  }

  // Test 4: Attendance List (medium-heavy operation)
  if (Math.random() > 0.3) {
    group('Attendance Load', () => {
      const response = authenticatedGet(`${apiURL}/attendance?limit=50`, token, {
        load_stage: loadStage,
      });

      check(response, {
        'attendance status is 200': (r) => r.status === 200,
        'attendance response time < 2000ms': (r) => r.timings.duration < 2000,
      });
    });
  }

  // Test 5: Payroll List (heavy operation with calculations)
  if (Math.random() > 0.5) {
    group('Payroll Load', () => {
      const response = authenticatedGet(`${apiURL}/payroll/payslips?limit=20`, token, {
        load_stage: loadStage,
      });

      check(response, {
        'payroll status is 200': (r) => r.status === 200,
        'payroll response time < 2000ms': (r) => r.timings.duration < 2000,
      });
    });
  }

  // Test 6: Analytics (very heavy operation)
  if (Math.random() > 0.7) {
    group('Analytics Load', () => {
      const response = authenticatedGet(`${apiURL}/analytics/employees`, token, {
        load_stage: loadStage,
      });

      check(response, {
        'analytics status is 200': (r) => r.status === 200,
        'analytics response time < 3000ms': (r) => r.timings.duration < 3000,
      });
    });
  }

  // Test 7: Search (database-intensive)
  if (Math.random() > 0.6) {
    group('Search Load', () => {
      const searchTerms = ['test', 'employee', 'manager'];
      const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];

      const response = authenticatedGet(`${apiURL}/employees?search=${term}`, token, {
        load_stage: loadStage,
      });

      check(response, {
        'search status is 200': (r) => r.status === 200,
        'search response time < 2000ms': (r) => r.timings.duration < 2000,
      });
    });
  }

  // Log current stage every 50 iterations
  if (__ITER % 50 === 0) {
    console.log(
      `🔥 Load stage: ${loadStage}, Elapsed: ${elapsedMinutes.toFixed(1)}min, Iteration: ${__ITER}`
    );
  }

  // Monitor for system degradation
  const currentRPS = __VU; // Approximate RPS based on VUs

  // Warning thresholds
  if (currentRPS > 100 && __ITER % 100 === 0) {
    console.log(`⚠️  High load: ${currentRPS} concurrent VUs`);
  }

  if (currentRPS > 200 && __ITER % 50 === 0) {
    console.log(`🔴 Extreme load: ${currentRPS} concurrent VUs`);
  }

  if (currentRPS > 300 && __ITER % 20 === 0) {
    console.log(`💥 Breaking point territory: ${currentRPS} concurrent VUs`);
  }

  // No think time - aggressive load
}

// Teardown
export function teardown(data) {
  const { startTime } = data;
  const duration = (Date.now() - startTime) / 1000 / 60;

  console.log('\n========================================');
  console.log('Breakpoint Test Completed');
  console.log(`Duration: ${duration.toFixed(2)} minutes`);
  console.log('========================================');
  console.log('\n📊 Analysis:');
  console.log('1. Review p95 and p99 response times by load stage');
  console.log('2. Identify when error rate exceeded 5%');
  console.log('3. Check system resource utilization (CPU, memory, DB)');
  console.log('4. Determine maximum sustainable RPS');
  console.log('5. Identify primary bottleneck (app server, DB, network)');
  console.log('\n🎯 Recommendations:');
  console.log('- Maximum RPS before degradation: [TO BE DETERMINED]');
  console.log('- Primary bottleneck: [TO BE IDENTIFIED]');
  console.log('- Scaling strategy: [TO BE RECOMMENDED]');
  console.log('========================================\n');

  teardownScenario('Breakpoint Test');
}

/**
 * Breakpoint Test Analysis Guide
 *
 * Monitor these indicators for system breaking point:
 *
 * 1. Response Time Degradation:
 *    - Normal: p95 < 500ms
 *    - Degraded: p95 500-1000ms
 *    - Critical: p95 > 1000ms
 *    - Breaking: p95 > 2000ms or timeouts
 *
 * 2. Error Rate:
 *    - Healthy: < 1%
 *    - Warning: 1-5%
 *    - Critical: 5-10%
 *    - Breaking: > 10%
 *
 * 3. System Resources:
 *    - CPU utilization
 *    - Memory usage
 *    - Database connections
 *    - Network bandwidth
 *
 * 4. Breaking Point Indicators:
 *    - Connection timeouts
 *    - 503 Service Unavailable errors
 *    - Database connection pool exhaustion
 *    - Memory errors (OOM)
 *    - Cascading failures
 *
 * 5. Capacity Planning:
 *    - Comfortable max: 70% of breaking point
 *    - Auto-scale trigger: 60% of breaking point
 *    - Alert threshold: 80% of breaking point
 */
