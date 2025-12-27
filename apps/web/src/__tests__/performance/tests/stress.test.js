/**
 * Stress Test Suite
 * Week 9-10: Performance Testing
 *
 * Tests system behavior under extreme load conditions:
 * - Gradually increase load beyond normal capacity
 * - Identify breaking point
 * - Monitor system recovery
 * - Test error handling under stress
 *
 * Profile: Ramps from 0 to 200 users over 20 minutes
 */

import { check, group, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { apiURL, getProfile } from '../k6.config.js';
import {
  login,
  thinkTime,
  authenticatedGet,
  authenticatedPost,
  generateEmployeeData,
  extractData,
  setupScenario,
  teardownScenario,
} from '../utils/helpers.js';

// Custom metrics for stress testing
const stressErrors = new Counter('stress_errors');
const stressSuccessRate = new Rate('stress_success_rate');
const stressResponseTime = new Trend('stress_response_time');

// Test configuration - using stress profile
export const options = {
  ...getProfile('stress'),

  // Relaxed thresholds for stress testing
  thresholds: {
    http_req_duration: ['p(95)<2000'], // Expect slower responses under stress
    http_req_failed: ['rate<0.05'], // Allow 5% failure rate
    stress_success_rate: ['rate>0.90'], // 90% success rate minimum
    stress_errors: ['count<500'], // Max 500 errors
  },
};

// Setup
export function setup() {
  setupScenario('Stress Test');

  console.log('================================================');
  console.log('  STRESS TEST');
  console.log('  Ramping to 200 concurrent users');
  console.log('  Identifying system breaking point');
  console.log('================================================\n');

  const token = login('admin@e2etest.com', 'Test@1234');

  if (!token) {
    throw new Error('Failed to login');
  }

  // Get baseline data
  const employeesResponse = authenticatedGet(`${apiURL}/employees?limit=10`, token);
  let employeeIds = [];

  if (employeesResponse.status === 200) {
    const data = extractData(employeesResponse);
    if (Array.isArray(data)) {
      employeeIds = data.map(e => e.id);
    }
  }

  console.log(`✅ Setup complete. Found ${employeeIds.length} employees for testing\n`);

  return { token, employeeIds };
}

// Main stress test
export default function (data) {
  const { token, employeeIds } = data;

  // Simulate realistic user behavior under stress
  const scenario = Math.random();

  if (scenario < 0.4) {
    // 40% - Read-heavy operations
    group('Stress: Read Operations', () => {
      const response = authenticatedGet(`${apiURL}/employees?limit=20`, token);
      trackStressMetrics(response, 'employee_list');
      thinkTime(0.5);

      if (employeeIds.length > 0) {
        const randomId = employeeIds[Math.floor(Math.random() * employeeIds.length)];
        const detailResponse = authenticatedGet(`${apiURL}/employees/${randomId}`, token);
        trackStressMetrics(detailResponse, 'employee_get');
      }
    });
  } else if (scenario < 0.7) {
    // 30% - Payroll operations
    group('Stress: Payroll Operations', () => {
      const response = authenticatedGet(`${apiURL}/payroll/payslips?limit=10`, token);
      trackStressMetrics(response, 'payslip_list');
    });
  } else if (scenario < 0.85) {
    // 15% - Dashboard/Reports
    group('Stress: Dashboard Operations', () => {
      const response = authenticatedGet(`${apiURL}/dashboard`, token);
      trackStressMetrics(response, 'dashboard');
    });
  } else {
    // 15% - Write operations
    group('Stress: Write Operations', () => {
      const employeeData = generateEmployeeData();
      const response = authenticatedPost(`${apiURL}/employees`, employeeData, token);
      trackStressMetrics(response, 'employee_create');

      // Cleanup if successful
      if (response.status === 201) {
        const data = extractData(response);
        if (data && data.id) {
          employeeIds.push(data.id);
        }
      }
    });
  }

  // Variable think time based on load
  const vus = __VU; // Current number of VUs
  if (vus > 150) {
    sleep(0.1); // Minimal delay under extreme stress
  } else if (vus > 100) {
    sleep(0.5);
  } else {
    thinkTime(1);
  }
}

// Teardown
export function teardown(data) {
  console.log('\n================================================');
  console.log('  STRESS TEST COMPLETE');
  console.log('  Review metrics to identify breaking point');
  console.log('================================================\n');

  teardownScenario('Stress Test');
}

/**
 * Track stress test metrics
 */
function trackStressMetrics(response, operation) {
  stressResponseTime.add(response.timings.duration);

  const success = check(response, {
    [`stress ${operation}: status is success`]: (r) =>
      r.status >= 200 && r.status < 300,
    [`stress ${operation}: response time < 3000ms`]: (r) =>
      r.timings.duration < 3000,
  });

  stressSuccessRate.add(success);

  if (!success) {
    stressErrors.add(1);
    console.log(`❌ Stress test failure: ${operation} - Status: ${response.status}, Time: ${response.timings.duration}ms`);
  }
}

/**
 * Handle summary - Analyze stress test results
 */
export function handleSummary(data) {
  const timestamp = new Date().toISOString();

  // Analyze at what VU level failures started occurring
  const errorRate = data.metrics.http_req_failed?.values?.rate || 0;
  const p95ResponseTime = data.metrics.http_req_duration?.values?.['p(95)'] || 0;

  const analysis = {
    timestamp,
    test: 'stress',
    results: {
      max_vus: 200,
      error_rate: errorRate,
      p95_response_time: p95ResponseTime,
      total_requests: data.metrics.http_reqs?.values?.count || 0,
      failed_requests: data.metrics.http_req_failed?.values?.count || 0,
      success_rate: data.metrics.stress_success_rate?.values?.rate || 0,
      stress_errors: data.metrics.stress_errors?.values?.count || 0,
    },
    recommendation: getStressRecommendation(errorRate, p95ResponseTime),
  };

  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    [`stress-test-${timestamp}.json`]: JSON.stringify(analysis, null, 2),
  };
}

/**
 * Generate recommendation based on stress test results
 */
function getStressRecommendation(errorRate, p95ResponseTime) {
  const recommendations = [];

  if (errorRate > 0.10) {
    recommendations.push('❌ CRITICAL: Error rate > 10%. System unable to handle peak load.');
    recommendations.push('   - Consider horizontal scaling');
    recommendations.push('   - Review database connection pooling');
    recommendations.push('   - Implement rate limiting');
  } else if (errorRate > 0.05) {
    recommendations.push('⚠️  WARNING: Error rate between 5-10%. System approaching limits.');
    recommendations.push('   - Monitor resource utilization');
    recommendations.push('   - Consider adding cache layers');
  } else {
    recommendations.push('✅ GOOD: Error rate < 5%. System handles stress well.');
  }

  if (p95ResponseTime > 2000) {
    recommendations.push('❌ CRITICAL: P95 response time > 2000ms under stress.');
    recommendations.push('   - Optimize database queries');
    recommendations.push('   - Review API endpoint performance');
    recommendations.push('   - Consider CDN for static assets');
  } else if (p95ResponseTime > 1000) {
    recommendations.push('⚠️  WARNING: P95 response time between 1-2 seconds.');
    recommendations.push('   - Monitor slow queries');
    recommendations.push('   - Review caching strategy');
  } else {
    recommendations.push('✅ GOOD: P95 response time < 1000ms. Good performance under stress.');
  }

  return recommendations.join('\n');
}

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
