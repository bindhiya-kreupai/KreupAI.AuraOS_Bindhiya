/**
 * Baseline Performance Tests
 * Week 9-10: Performance Testing
 *
 * Tests baseline performance of all major API endpoints:
 * - Authentication
 * - Employee Management
 * - Payroll
 * - Reports
 * - Leave Management
 */

import { sleep } from 'k6';
import { apiURL, thresholds, getProfile } from '../k6.config.js';
import {
  login,
  thinkTime,
  authenticatedGet,
  checkResponse,
  setupScenario,
  teardownScenario,
  generateQueryParams,
} from '../utils/helpers.js';

// Test configuration
export const options = {
  // Use smoke profile for baseline tests
  ...getProfile('smoke'),

  // Thresholds
  thresholds,

  // Summary export
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

// Setup function - runs once before all iterations
export function setup() {
  setupScenario('Baseline Performance Test');

  // Login to get auth token
  const token = login('admin@e2etest.com', 'Test@1234');

  if (!token) {
    throw new Error('Failed to login - cannot proceed with baseline tests');
  }

  console.log('✅ Successfully authenticated');

  return { token };
}

// Main test function
export default function (data) {
  const { token } = data;

  // Test 1: Authentication endpoint
  testAuthentication();
  thinkTime();

  // Test 2: Employee List API
  testEmployeeList(token);
  thinkTime();

  // Test 3: Employee Get API
  testEmployeeGet(token);
  thinkTime();

  // Test 4: Payroll List API
  testPayrollList(token);
  thinkTime();

  // Test 5: Reports List API
  testReportsList(token);
  thinkTime();

  // Test 6: Leave List API
  testLeaveList(token);
  thinkTime();

  // Test 7: Dashboard API
  testDashboard(token);

  sleep(1);
}

// Teardown function - runs once after all iterations
export function teardown(data) {
  teardownScenario('Baseline Performance Test');
}

/**
 * Test Authentication Endpoint
 */
function testAuthentication() {
  const token = login('user@e2etest.com', 'Test@1234');

  if (token) {
    console.log('✅ Authentication endpoint working');
  } else {
    console.error('❌ Authentication endpoint failed');
  }
}

/**
 * Test Employee List API
 */
function testEmployeeList(token) {
  const queryParams = generateQueryParams();
  const url = `${apiURL}/employees${queryParams}`;

  const response = authenticatedGet(url, token, { endpoint: 'employees' });

  const success = checkResponse(response, 200, 'employee_list');

  if (!success) {
    console.error(`❌ Employee List API failed`);
  }
}

/**
 * Test Employee Get API
 */
function testEmployeeGet(token) {
  // First, get list to find an employee ID
  const listResponse = authenticatedGet(`${apiURL}/employees?limit=1`, token);

  if (listResponse.status === 200) {
    try {
      const body = JSON.parse(listResponse.body);
      if (body.data && body.data.length > 0) {
        const employeeId = body.data[0].id;

        // Now test GET single employee
        const response = authenticatedGet(
          `${apiURL}/employees/${employeeId}`,
          token,
          { endpoint: 'employees' }
        );

        const success = checkResponse(response, 200, 'employee_get');

        if (!success) {
          console.error(`❌ Employee Get API failed`);
        }
      }
    } catch (e) {
      console.error('Failed to parse employee list:', e);
    }
  }
}

/**
 * Test Payroll List API
 */
function testPayrollList(token) {
  const queryParams = generateQueryParams();
  const url = `${apiURL}/payroll/payslips${queryParams}`;

  const response = authenticatedGet(url, token, { endpoint: 'payroll' });

  const success = checkResponse(response, 200, 'payroll_list');

  if (!success) {
    console.error(`❌ Payroll List API failed`);
  }
}

/**
 * Test Reports List API
 */
function testReportsList(token) {
  const queryParams = generateQueryParams();
  const url = `${apiURL}/reports${queryParams}`;

  const response = authenticatedGet(url, token, { endpoint: 'reports' });

  const success = checkResponse(response, 200, 'reports_list');

  if (!success) {
    console.error(`❌ Reports List API failed`);
  }
}

/**
 * Test Leave List API
 */
function testLeaveList(token) {
  const queryParams = generateQueryParams();
  const url = `${apiURL}/leave/applications${queryParams}`;

  const response = authenticatedGet(url, token, { endpoint: 'leave' });

  const success = checkResponse(response, 200, 'leave_list');

  if (!success) {
    console.error(`❌ Leave List API failed`);
  }
}

/**
 * Test Dashboard API
 */
function testDashboard(token) {
  const url = `${apiURL}/dashboard`;

  const response = authenticatedGet(url, token, { endpoint: 'dashboard' });

  const success = checkResponse(response, 200, 'dashboard');

  if (!success) {
    console.error(`❌ Dashboard API failed`);
  }
}
