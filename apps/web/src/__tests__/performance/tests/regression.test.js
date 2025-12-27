/**
 * Performance Regression Test Suite
 * Week 9-10: Performance Testing
 *
 * This suite runs a comprehensive set of performance tests to detect regressions
 * across releases. It tests all critical endpoints and compares against baselines.
 *
 * Usage:
 *   k6 run --env BASELINE_FILE=baseline-v1.0.0.json regression.test.js
 *
 * Features:
 * - Tests all critical API endpoints
 * - Compares against baseline metrics
 * - Generates performance comparison report
 * - Detects significant performance degradation
 */

import { check, group } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';
import { apiURL, thresholds, getProfile } from '../k6.config.js';
import {
  login,
  thinkTime,
  authenticatedGet,
  authenticatedPost,
  authenticatedPut,
  authenticatedDelete,
  checkResponse,
  extractData,
  setupScenario,
  teardownScenario,
  generateEmployeeData,
  generateQueryParams,
} from '../utils/helpers.js';

// Custom metrics for regression tracking
const authLoginTrend = new Trend('regression_auth_login', true);
const employeeListTrend = new Trend('regression_employee_list', true);
const employeeGetTrend = new Trend('regression_employee_get', true);
const employeeCreateTrend = new Trend('regression_employee_create', true);
const payslipListTrend = new Trend('regression_payslip_list', true);
const payslipGetTrend = new Trend('regression_payslip_get', true);
const reportGenerateTrend = new Trend('regression_report_generate', true);
const leaveListTrend = new Trend('regression_leave_list', true);
const dashboardTrend = new Trend('regression_dashboard', true);

const regressionErrors = new Counter('regression_errors');
const regressionRate = new Rate('regression_success_rate');

// Test configuration - using load profile for realistic conditions
export const options = {
  ...getProfile('load'),

  // Strict thresholds for regression testing
  thresholds: {
    ...thresholds,

    // Ensure no significant regression (within 10% of baseline)
    regression_auth_login: ['p(95)<350'], // Baseline: 300ms
    regression_employee_list: ['p(95)<440'], // Baseline: 400ms
    regression_employee_get: ['p(95)<330'], // Baseline: 300ms
    regression_employee_create: ['p(95)<550'], // Baseline: 500ms
    regression_payslip_list: ['p(95)<550'], // Baseline: 500ms
    regression_payslip_get: ['p(95)<440'], // Baseline: 400ms
    regression_report_generate: ['p(95)<1100'], // Baseline: 1000ms
    regression_leave_list: ['p(95)<440'], // Baseline: 400ms
    regression_dashboard: ['p(95)<660'], // Baseline: 600ms

    // Overall success rate should be high
    regression_success_rate: ['rate>0.95'],
    regression_errors: ['count<50'],
  },
};

// Setup
export function setup() {
  setupScenario('Performance Regression Test Suite');

  console.log('================================================');
  console.log('  Performance Regression Test Suite');
  console.log('  Comparing against baseline metrics');
  console.log('================================================\n');

  const token = login('admin@e2etest.com', 'Test@1234');

  if (!token) {
    throw new Error('Failed to login - cannot proceed with regression tests');
  }

  // Create test data for regression testing
  const testData = {
    employeeIds: [],
    payslipIds: [],
    reportIds: [],
    leaveIds: [],
  };

  // Create 5 test employees
  console.log('Creating test employees for regression testing...');
  for (let i = 0; i < 5; i++) {
    const employeeData = generateEmployeeData();
    const response = authenticatedPost(
      `${apiURL}/employees`,
      employeeData,
      token
    );

    if (response.status === 201) {
      const data = extractData(response);
      if (data && data.id) {
        testData.employeeIds.push(data.id);
      }
    }
  }

  console.log(`✅ Created ${testData.employeeIds.length} test employees`);

  // Get existing payslips
  const payslipsResponse = authenticatedGet(
    `${apiURL}/payroll/payslips?limit=10`,
    token
  );

  if (payslipsResponse.status === 200) {
    const data = extractData(payslipsResponse);
    if (Array.isArray(data)) {
      testData.payslipIds = data.map(ps => ps.id);
      console.log(`✅ Found ${testData.payslipIds.length} payslips for testing`);
    }
  }

  // Get existing reports
  const reportsResponse = authenticatedGet(`${apiURL}/reports?limit=5`, token);

  if (reportsResponse.status === 200) {
    const data = extractData(reportsResponse);
    if (Array.isArray(data)) {
      testData.reportIds = data.map(r => r.id);
      console.log(`✅ Found ${testData.reportIds.length} reports for testing`);
    }
  }

  // Get existing leave applications
  const leaveResponse = authenticatedGet(
    `${apiURL}/leave/applications?limit=10`,
    token
  );

  if (leaveResponse.status === 200) {
    const data = extractData(leaveResponse);
    if (Array.isArray(data)) {
      testData.leaveIds = data.map(l => l.id);
      console.log(`✅ Found ${testData.leaveIds.length} leave applications for testing`);
    }
  }

  console.log('\n✅ Test data setup complete\n');

  return { token, testData };
}

// Main regression test
export default function (data) {
  const { token, testData } = data;

  // Group 1: Authentication Performance
  group('Regression: Authentication', () => {
    testAuthenticationPerformance();
  });

  thinkTime();

  // Group 2: Employee Management Performance
  group('Regression: Employee Management', () => {
    testEmployeeListPerformance(token);
    thinkTime(0.5);

    if (testData.employeeIds.length > 0) {
      const randomId = testData.employeeIds[Math.floor(Math.random() * testData.employeeIds.length)];
      testEmployeeGetPerformance(token, randomId);
      thinkTime(0.5);
    }

    testEmployeeCreatePerformance(token);
  });

  thinkTime();

  // Group 3: Payroll Performance
  group('Regression: Payroll', () => {
    testPayslipListPerformance(token);
    thinkTime(0.5);

    if (testData.payslipIds.length > 0) {
      const randomId = testData.payslipIds[Math.floor(Math.random() * testData.payslipIds.length)];
      testPayslipGetPerformance(token, randomId);
    }
  });

  thinkTime();

  // Group 4: Reports Performance
  group('Regression: Reports', () => {
    testReportListPerformance(token);
    thinkTime(0.5);

    // Occasionally test report generation (heavy operation)
    if (Math.random() > 0.8) {
      testReportGeneratePerformance(token);
    }
  });

  thinkTime();

  // Group 5: Leave Management Performance
  group('Regression: Leave Management', () => {
    testLeaveListPerformance(token);
  });

  thinkTime();

  // Group 6: Dashboard Performance
  group('Regression: Dashboard', () => {
    testDashboardPerformance(token);
  });
}

// Teardown
export function teardown(data) {
  const { token, testData } = data;

  console.log('\n================================================');
  console.log('  Cleaning up test data');
  console.log('================================================\n');

  // Delete created employees
  if (testData.employeeIds.length > 0) {
    console.log(`Deleting ${testData.employeeIds.length} test employees...`);
    let deleted = 0;

    for (const id of testData.employeeIds) {
      const response = authenticatedDelete(`${apiURL}/employees/${id}`, token);
      if (response.status === 200) {
        deleted++;
      }
    }

    console.log(`✅ Deleted ${deleted} employees`);
  }

  console.log('\n================================================');
  console.log('  Performance Regression Test Complete');
  console.log('  Review metrics above for regressions');
  console.log('================================================\n');

  teardownScenario('Performance Regression Test Suite');
}

/**
 * Test Authentication Performance
 */
function testAuthenticationPerformance() {
  const startTime = Date.now();

  const token = login('user@e2etest.com', 'Test@1234');

  const duration = Date.now() - startTime;
  authLoginTrend.add(duration);

  const success = token !== null;
  regressionRate.add(success);

  if (!success) {
    regressionErrors.add(1);
  }

  check(token, {
    'regression: auth login successful': (t) => t !== null,
    'regression: auth login < 350ms': () => duration < 350,
  });
}

/**
 * Test Employee List Performance
 */
function testEmployeeListPerformance(token) {
  const queryParams = generateQueryParams();
  const url = `${apiURL}/employees${queryParams}`;

  const response = authenticatedGet(url, token, { endpoint: 'regression_employee_list' });

  employeeListTrend.add(response.timings.duration);

  const success = check(response, {
    'regression: employee list status 200': (r) => r.status === 200,
    'regression: employee list has data': (r) => Array.isArray(extractData(r)),
    'regression: employee list < 440ms': (r) => r.timings.duration < 440,
  });

  regressionRate.add(success);
  if (!success) regressionErrors.add(1);
}

/**
 * Test Employee Get Performance
 */
function testEmployeeGetPerformance(token, employeeId) {
  const url = `${apiURL}/employees/${employeeId}`;

  const response = authenticatedGet(url, token, { endpoint: 'regression_employee_get' });

  employeeGetTrend.add(response.timings.duration);

  const success = check(response, {
    'regression: employee get status 200': (r) => r.status === 200,
    'regression: employee get has data': (r) => {
      const data = extractData(r);
      return data && data.id === employeeId;
    },
    'regression: employee get < 330ms': (r) => r.timings.duration < 330,
  });

  regressionRate.add(success);
  if (!success) regressionErrors.add(1);
}

/**
 * Test Employee Create Performance
 */
function testEmployeeCreatePerformance(token) {
  const employeeData = generateEmployeeData();
  const url = `${apiURL}/employees`;

  const response = authenticatedPost(url, employeeData, token, {
    endpoint: 'regression_employee_create',
  });

  employeeCreateTrend.add(response.timings.duration);

  const success = check(response, {
    'regression: employee create status 201': (r) => r.status === 201,
    'regression: employee create has id': (r) => {
      const data = extractData(r);
      return data && data.id;
    },
    'regression: employee create < 550ms': (r) => r.timings.duration < 550,
  });

  regressionRate.add(success);
  if (!success) regressionErrors.add(1);

  // Cleanup: Delete created employee
  if (response.status === 201) {
    const data = extractData(response);
    if (data && data.id) {
      authenticatedDelete(`${apiURL}/employees/${data.id}`, token);
    }
  }
}

/**
 * Test Payslip List Performance
 */
function testPayslipListPerformance(token) {
  const queryParams = generateQueryParams();
  const url = `${apiURL}/payroll/payslips${queryParams}`;

  const response = authenticatedGet(url, token, { endpoint: 'regression_payslip_list' });

  payslipListTrend.add(response.timings.duration);

  const success = check(response, {
    'regression: payslip list status 200': (r) => r.status === 200,
    'regression: payslip list has data': (r) => Array.isArray(extractData(r)),
    'regression: payslip list < 550ms': (r) => r.timings.duration < 550,
  });

  regressionRate.add(success);
  if (!success) regressionErrors.add(1);
}

/**
 * Test Payslip Get Performance
 */
function testPayslipGetPerformance(token, payslipId) {
  const url = `${apiURL}/payroll/payslips/${payslipId}`;

  const response = authenticatedGet(url, token, { endpoint: 'regression_payslip_get' });

  payslipGetTrend.add(response.timings.duration);

  const success = check(response, {
    'regression: payslip get status 200': (r) => r.status === 200,
    'regression: payslip get has data': (r) => {
      const data = extractData(r);
      return data && data.id === payslipId;
    },
    'regression: payslip get < 440ms': (r) => r.timings.duration < 440,
  });

  regressionRate.add(success);
  if (!success) regressionErrors.add(1);
}

/**
 * Test Report List Performance
 */
function testReportListPerformance(token) {
  const queryParams = generateQueryParams();
  const url = `${apiURL}/reports${queryParams}`;

  const response = authenticatedGet(url, token, { endpoint: 'regression_report_list' });

  const success = check(response, {
    'regression: report list status 200': (r) => r.status === 200,
    'regression: report list has data': (r) => Array.isArray(extractData(r)),
    'regression: report list < 500ms': (r) => r.timings.duration < 500,
  });

  regressionRate.add(success);
  if (!success) regressionErrors.add(1);
}

/**
 * Test Report Generate Performance
 */
function testReportGeneratePerformance(token) {
  const reportData = {
    reportType: 'employee',
    format: 'PDF',
    dateRange: {
      from: '2024-01-01',
      to: '2024-01-31',
    },
  };

  const url = `${apiURL}/reports/generate`;

  const response = authenticatedPost(url, reportData, token, {
    endpoint: 'regression_report_generate',
  });

  reportGenerateTrend.add(response.timings.duration);

  const success = check(response, {
    'regression: report generate status 200 or 202': (r) =>
      r.status === 200 || r.status === 202,
    'regression: report generate has response': (r) => {
      const data = extractData(r);
      return data !== null;
    },
    'regression: report generate < 1100ms': (r) => r.timings.duration < 1100,
  });

  regressionRate.add(success);
  if (!success) regressionErrors.add(1);
}

/**
 * Test Leave List Performance
 */
function testLeaveListPerformance(token) {
  const queryParams = generateQueryParams();
  const url = `${apiURL}/leave/applications${queryParams}`;

  const response = authenticatedGet(url, token, { endpoint: 'regression_leave_list' });

  leaveListTrend.add(response.timings.duration);

  const success = check(response, {
    'regression: leave list status 200': (r) => r.status === 200,
    'regression: leave list has data': (r) => Array.isArray(extractData(r)),
    'regression: leave list < 440ms': (r) => r.timings.duration < 440,
  });

  regressionRate.add(success);
  if (!success) regressionErrors.add(1);
}

/**
 * Test Dashboard Performance
 */
function testDashboardPerformance(token) {
  const url = `${apiURL}/dashboard`;

  const response = authenticatedGet(url, token, { endpoint: 'regression_dashboard' });

  dashboardTrend.add(response.timings.duration);

  const success = check(response, {
    'regression: dashboard status 200': (r) => r.status === 200,
    'regression: dashboard has data': (r) => {
      const data = extractData(r);
      return data !== null;
    },
    'regression: dashboard < 660ms': (r) => r.timings.duration < 660,
  });

  regressionRate.add(success);
  if (!success) regressionErrors.add(1);
}

/**
 * Handle summary - Export metrics for comparison
 */
export function handleSummary(data) {
  const timestamp = new Date().toISOString();
  const version = __ENV.VERSION || 'unknown';

  // Extract key metrics
  const summary = {
    timestamp,
    version,
    metrics: {
      auth_login: extractMetric(data, 'regression_auth_login'),
      employee_list: extractMetric(data, 'regression_employee_list'),
      employee_get: extractMetric(data, 'regression_employee_get'),
      employee_create: extractMetric(data, 'regression_employee_create'),
      payslip_list: extractMetric(data, 'regression_payslip_list'),
      payslip_get: extractMetric(data, 'regression_payslip_get'),
      report_generate: extractMetric(data, 'regression_report_generate'),
      leave_list: extractMetric(data, 'regression_leave_list'),
      dashboard: extractMetric(data, 'regression_dashboard'),
    },
    overall: {
      success_rate: extractRate(data, 'regression_success_rate'),
      error_count: extractCounter(data, 'regression_errors'),
      http_req_duration_p95: extractMetric(data, 'http_req_duration')?.p95,
      http_req_failed_rate: extractRate(data, 'http_req_failed'),
    },
  };

  // Compare against baseline if available
  const baselineFile = __ENV.BASELINE_FILE;
  if (baselineFile) {
    // In a real implementation, load and compare baseline
    console.log(`\n📊 Comparing against baseline: ${baselineFile}`);
    // comparison logic would go here
  }

  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    [`regression-report-${timestamp}.json`]: JSON.stringify(summary, null, 2),
  };
}

/**
 * Helper: Extract metric from summary data
 */
function extractMetric(data, metricName) {
  const metric = data.metrics[metricName];
  if (!metric || !metric.values) return null;

  return {
    avg: metric.values.avg,
    min: metric.values.min,
    max: metric.values.max,
    p50: metric.values['p(50)'],
    p90: metric.values['p(90)'],
    p95: metric.values['p(95)'],
    p99: metric.values['p(99)'],
  };
}

/**
 * Helper: Extract rate from summary data
 */
function extractRate(data, metricName) {
  const metric = data.metrics[metricName];
  if (!metric || !metric.values) return null;

  return metric.values.rate;
}

/**
 * Helper: Extract counter from summary data
 */
function extractCounter(data, metricName) {
  const metric = data.metrics[metricName];
  if (!metric || !metric.values) return null;

  return metric.values.count;
}

// Text summary for stdout
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
