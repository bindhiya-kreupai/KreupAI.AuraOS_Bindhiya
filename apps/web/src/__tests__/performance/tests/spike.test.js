/**
 * Spike Test Suite
 * Week 9-10: Performance Testing
 *
 * Tests system behavior under sudden traffic spikes:
 * - Rapid increase from baseline to peak load
 * - Monitor system response to sudden spike
 * - Test auto-scaling effectiveness
 * - Verify graceful degradation
 *
 * Profile: Sudden spike from 10 to 100 users, then back down
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

// Custom metrics for spike testing
const spikeErrors = new Counter('spike_errors');
const spikeSuccessRate = new Rate('spike_success_rate');
const spikePeakResponseTime = new Trend('spike_peak_response_time');
const spikeRecoveryResponseTime = new Trend('spike_recovery_response_time');

// Test configuration - using spike profile
export const options = {
  ...getProfile('spike'),

  // Thresholds for spike testing
  thresholds: {
    http_req_duration: ['p(95)<1500'], // Allow higher response times during spike
    http_req_failed: ['rate<0.03'], // Allow 3% failure rate during spike
    spike_success_rate: ['rate>0.95'], // 95% success rate minimum
    spike_errors: ['count<200'], // Max 200 errors during spike
    spike_peak_response_time: ['p(95)<2000'], // Peak response time
    spike_recovery_response_time: ['p(95)<600'], // Recovery response time
  },
};

// Setup
export function setup() {
  setupScenario('Spike Test');

  console.log('================================================');
  console.log('  SPIKE TEST');
  console.log('  Sudden traffic spike: 10 → 100 users');
  console.log('  Testing auto-scaling and recovery');
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

  const payslipsResponse = authenticatedGet(`${apiURL}/payroll/payslips?limit=10`, token);
  let payslipIds = [];

  if (payslipsResponse.status === 200) {
    const data = extractData(payslipsResponse);
    if (Array.isArray(data)) {
      payslipIds = data.map(ps => ps.id);
    }
  }

  console.log(`✅ Setup complete. Found ${employeeIds.length} employees, ${payslipIds.length} payslips\n`);

  return { token, employeeIds, payslipIds };
}

// Main spike test
export default function (data) {
  const { token, employeeIds, payslipIds } = data;

  const currentVUs = __VU;
  const iterationStartTime = Date.now();

  // Determine if we're in spike period (based on VU count)
  const isSpikePeriod = currentVUs > 50;

  // Scenario selection based on spike period
  if (isSpikePeriod) {
    // During spike: More varied operations to stress different parts
    group('Spike: Peak Load Operations', () => {
      testPeakLoadOperations(token, employeeIds, payslipIds);
    });
  } else {
    // Before/after spike: Normal operations
    group('Spike: Normal Load Operations', () => {
      testNormalLoadOperations(token, employeeIds, payslipIds);
    });
  }

  // Minimal think time during spike
  if (isSpikePeriod) {
    sleep(0.1);
  } else {
    thinkTime(1);
  }
}

// Teardown
export function teardown(data) {
  console.log('\n================================================');
  console.log('  SPIKE TEST COMPLETE');
  console.log('  Review metrics for spike impact and recovery');
  console.log('================================================\n');

  teardownScenario('Spike Test');
}

/**
 * Test operations during peak spike period
 */
function testPeakLoadOperations(token, employeeIds, payslipIds) {
  const operations = [
    () => testEmployeeList(token, true),
    () => testEmployeeGet(token, employeeIds, true),
    () => testPayslipList(token, true),
    () => testPayslipGet(token, payslipIds, true),
    () => testDashboard(token, true),
  ];

  // Execute random operation
  const operation = operations[Math.floor(Math.random() * operations.length)];
  operation();
}

/**
 * Test operations during normal load periods
 */
function testNormalLoadOperations(token, employeeIds, payslipIds) {
  // More comprehensive testing during normal load
  testEmployeeList(token, false);
  sleep(0.5);

  if (employeeIds.length > 0) {
    testEmployeeGet(token, employeeIds, false);
    sleep(0.5);
  }

  if (Math.random() > 0.7) {
    testPayslipList(token, false);
  }
}

/**
 * Test Employee List
 */
function testEmployeeList(token, isSpike) {
  const response = authenticatedGet(`${apiURL}/employees?limit=20`, token, {
    endpoint: 'spike_employee_list',
  });

  trackSpikeMetrics(response, 'employee_list', isSpike);
}

/**
 * Test Employee Get
 */
function testEmployeeGet(token, employeeIds, isSpike) {
  if (employeeIds.length === 0) return;

  const randomId = employeeIds[Math.floor(Math.random() * employeeIds.length)];
  const response = authenticatedGet(`${apiURL}/employees/${randomId}`, token, {
    endpoint: 'spike_employee_get',
  });

  trackSpikeMetrics(response, 'employee_get', isSpike);
}

/**
 * Test Payslip List
 */
function testPayslipList(token, isSpike) {
  const response = authenticatedGet(`${apiURL}/payroll/payslips?limit=10`, token, {
    endpoint: 'spike_payslip_list',
  });

  trackSpikeMetrics(response, 'payslip_list', isSpike);
}

/**
 * Test Payslip Get
 */
function testPayslipGet(token, payslipIds, isSpike) {
  if (payslipIds.length === 0) return;

  const randomId = payslipIds[Math.floor(Math.random() * payslipIds.length)];
  const response = authenticatedGet(`${apiURL}/payroll/payslips/${randomId}`, token, {
    endpoint: 'spike_payslip_get',
  });

  trackSpikeMetrics(response, 'payslip_get', isSpike);
}

/**
 * Test Dashboard
 */
function testDashboard(token, isSpike) {
  const response = authenticatedGet(`${apiURL}/dashboard`, token, {
    endpoint: 'spike_dashboard',
  });

  trackSpikeMetrics(response, 'dashboard', isSpike);
}

/**
 * Track spike test metrics
 */
function trackSpikeMetrics(response, operation, isSpike) {
  // Track different metrics for spike vs recovery periods
  if (isSpike) {
    spikePeakResponseTime.add(response.timings.duration);
  } else {
    spikeRecoveryResponseTime.add(response.timings.duration);
  }

  const expectedThreshold = isSpike ? 2000 : 600;

  const success = check(response, {
    [`spike ${operation}: status is success`]: (r) =>
      r.status >= 200 && r.status < 300,
    [`spike ${operation}: response time < ${expectedThreshold}ms`]: (r) =>
      r.timings.duration < expectedThreshold,
  });

  spikeSuccessRate.add(success);

  if (!success) {
    spikeErrors.add(1);

    // Log failures during spike for analysis
    const phase = isSpike ? 'PEAK' : 'RECOVERY';
    console.log(
      `❌ Spike test failure [${phase}]: ${operation} - ` +
      `Status: ${response.status}, Time: ${response.timings.duration.toFixed(0)}ms`
    );
  }
}

/**
 * Handle summary - Analyze spike test results
 */
export function handleSummary(data) {
  const timestamp = new Date().toISOString();

  // Extract key metrics
  const peakP95 = data.metrics.spike_peak_response_time?.values?.['p(95)'] || 0;
  const recoveryP95 = data.metrics.spike_recovery_response_time?.values?.['p(95)'] || 0;
  const errorRate = data.metrics.http_req_failed?.values?.rate || 0;
  const successRate = data.metrics.spike_success_rate?.values?.rate || 0;

  const analysis = {
    timestamp,
    test: 'spike',
    results: {
      spike_vus: 100,
      baseline_vus: 10,
      peak_p95_response_time: peakP95,
      recovery_p95_response_time: recoveryP95,
      degradation_factor: (peakP95 / recoveryP95).toFixed(2),
      error_rate: errorRate,
      success_rate: successRate,
      total_requests: data.metrics.http_reqs?.values?.count || 0,
      spike_errors: data.metrics.spike_errors?.values?.count || 0,
    },
    assessment: getSpikeAssessment(peakP95, recoveryP95, errorRate, successRate),
  };

  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    [`spike-test-${timestamp}.json`]: JSON.stringify(analysis, null, 2),
  };
}

/**
 * Generate assessment based on spike test results
 */
function getSpikeAssessment(peakP95, recoveryP95, errorRate, successRate) {
  const assessment = {
    overall: 'UNKNOWN',
    details: [],
  };

  // Assess spike handling
  if (errorRate < 0.01 && successRate > 0.98) {
    assessment.overall = 'EXCELLENT';
    assessment.details.push('✅ System handled spike exceptionally well');
    assessment.details.push('✅ Error rate < 1%, success rate > 98%');
  } else if (errorRate < 0.03 && successRate > 0.95) {
    assessment.overall = 'GOOD';
    assessment.details.push('✅ System handled spike well');
    assessment.details.push('✅ Error rate < 3%, success rate > 95%');
  } else if (errorRate < 0.05 && successRate > 0.90) {
    assessment.overall = 'ACCEPTABLE';
    assessment.details.push('⚠️  System handled spike with some degradation');
    assessment.details.push('⚠️  Error rate between 3-5%, consider improvements');
  } else {
    assessment.overall = 'POOR';
    assessment.details.push('❌ System struggled with spike');
    assessment.details.push('❌ High error rate or low success rate');
    assessment.details.push('   ACTION: Implement auto-scaling or rate limiting');
  }

  // Assess recovery
  const degradationFactor = peakP95 / recoveryP95;

  if (degradationFactor < 2) {
    assessment.details.push('✅ Minimal performance degradation during spike (<2x)');
  } else if (degradationFactor < 3) {
    assessment.details.push('⚠️  Moderate performance degradation during spike (2-3x)');
    assessment.details.push('   RECOMMENDATION: Optimize caching and connection pooling');
  } else {
    assessment.details.push('❌ Significant performance degradation during spike (>3x)');
    assessment.details.push('   ACTION: Review bottlenecks and scaling strategy');
  }

  // Response time assessment
  if (peakP95 < 1000) {
    assessment.details.push(`✅ Peak P95 response time excellent: ${peakP95.toFixed(0)}ms`);
  } else if (peakP95 < 2000) {
    assessment.details.push(`⚠️  Peak P95 response time acceptable: ${peakP95.toFixed(0)}ms`);
  } else {
    assessment.details.push(`❌ Peak P95 response time high: ${peakP95.toFixed(0)}ms`);
  }

  if (recoveryP95 < 500) {
    assessment.details.push(`✅ Recovery P95 response time excellent: ${recoveryP95.toFixed(0)}ms`);
  } else if (recoveryP95 < 800) {
    assessment.details.push(`⚠️  Recovery P95 response time acceptable: ${recoveryP95.toFixed(0)}ms`);
  } else {
    assessment.details.push(`❌ Recovery P95 response time high: ${recoveryP95.toFixed(0)}ms`);
  }

  return assessment;
}

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
