/**
 * k6 Performance Test Helpers
 * Week 9-10: Performance Testing
 *
 * Reusable utilities for k6 performance tests:
 * - Authentication helpers
 * - Request builders
 * - Response validators
 * - Data generators
 */

import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import http from 'k6/http';
import { config, apiURL } from '../k6.config.js';

// Custom metrics
export const loginDuration = new Trend('login_duration');
export const employeeAPIRate = new Rate('employee_api_success');
export const payrollAPIRate = new Rate('payroll_api_success');
export const reportsAPIRate = new Rate('reports_api_success');

/**
 * Perform login and return auth token
 */
export function login(email, password) {
  const loginStartTime = new Date();

  const payload = JSON.stringify({
    email,
    password,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { endpoint: 'login' },
  };

  const response = http.post(`${apiURL}/auth/login`, payload, params);

  // Record login duration
  loginDuration.add(new Date() - loginStartTime);

  // Validate response
  const success = check(response, {
    'login status is 200': (r) => r.status === 200,
    'login has token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && body.data.token;
      } catch {
        return false;
      }
    },
  });

  if (!success) {
    console.error(`Login failed for ${email}: ${response.status} ${response.body}`);
    return null;
  }

  const body = JSON.parse(response.body);
  return body.data.token;
}

/**
 * Get authorization headers
 */
export function getAuthHeaders(token) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * Random think time (simulated user delay)
 */
export function thinkTime() {
  const min = config.thinkTime.min;
  const max = config.thinkTime.max;
  const delay = Math.random() * (max - min) + min;
  sleep(delay);
}

/**
 * Generate unique employee data
 */
export function generateEmployeeData() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);

  return {
    employeeCode: `EMP-${timestamp}-${random}`,
    firstName: `TestFirst${random}`,
    lastName: `TestLast${random}`,
    email: `test.employee.${timestamp}.${random}@perftest.com`,
    phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    joiningDate: '2024-01-01',
  };
}

/**
 * Generate unique report configuration
 */
export function generateReportConfig() {
  const types = ['employee', 'payroll', 'attendance', 'leave'];
  const formats = ['PDF', 'Excel', 'CSV'];

  return {
    reportType: types[Math.floor(Math.random() * types.length)],
    format: formats[Math.floor(Math.random() * formats.length)],
    dateRange: {
      from: '2024-01-01',
      to: '2024-12-31',
    },
  };
}

/**
 * Check response status and structure
 */
export function checkResponse(response, expectedStatus, endpoint) {
  const checks = {
    [`${endpoint} status is ${expectedStatus}`]: (r) => r.status === expectedStatus,
    [`${endpoint} response time < 2000ms`]: (r) => r.timings.duration < 2000,
    [`${endpoint} has valid JSON`]: (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    },
  };

  const success = check(response, checks);

  // Record success rate
  switch (endpoint) {
    case 'employee':
      employeeAPIRate.add(success);
      break;
    case 'payroll':
      payrollAPIRate.add(success);
      break;
    case 'reports':
      reportsAPIRate.add(success);
      break;
  }

  return success;
}

/**
 * Perform GET request with auth
 */
export function authenticatedGet(url, token, tags = {}) {
  const params = {
    headers: getAuthHeaders(token),
    tags: { ...tags },
  };

  return http.get(url, params);
}

/**
 * Perform POST request with auth
 */
export function authenticatedPost(url, payload, token, tags = {}) {
  const params = {
    headers: getAuthHeaders(token),
    tags: { ...tags },
  };

  return http.post(url, JSON.stringify(payload), params);
}

/**
 * Perform PUT request with auth
 */
export function authenticatedPut(url, payload, token, tags = {}) {
  const params = {
    headers: getAuthHeaders(token),
    tags: { ...tags },
  };

  return http.put(url, JSON.stringify(payload), params);
}

/**
 * Perform DELETE request with auth
 */
export function authenticatedDelete(url, token, tags = {}) {
  const params = {
    headers: getAuthHeaders(token),
    tags: { ...tags },
  };

  return http.del(url, null, params);
}

/**
 * Batch requests for better performance
 */
export function batchRequests(requests, token) {
  const batchParams = requests.map(req => {
    return {
      method: req.method || 'GET',
      url: req.url,
      body: req.body ? JSON.stringify(req.body) : null,
      params: {
        headers: getAuthHeaders(token),
        tags: req.tags || {},
      },
    };
  });

  return http.batch(batchParams);
}

/**
 * Extract pagination info from response
 */
export function extractPaginationInfo(response) {
  try {
    const body = JSON.parse(response.body);
    if (body.meta && body.meta.pagination) {
      return body.meta.pagination;
    }
  } catch (e) {
    console.error('Failed to extract pagination info:', e);
  }
  return null;
}

/**
 * Extract data from response
 */
export function extractData(response) {
  try {
    const body = JSON.parse(response.body);
    return body.data || null;
  } catch (e) {
    console.error('Failed to extract data:', e);
    return null;
  }
}

/**
 * Generate random query parameters
 */
export function generateQueryParams() {
  const params = [];

  // Random page
  if (Math.random() > 0.5) {
    params.push(`page=${Math.floor(Math.random() * 5) + 1}`);
  }

  // Random limit
  if (Math.random() > 0.5) {
    const limits = [10, 25, 50, 100];
    params.push(`limit=${limits[Math.floor(Math.random() * limits.length)]}`);
  }

  // Random sort
  if (Math.random() > 0.5) {
    const fields = ['firstName', 'lastName', 'email', 'joiningDate'];
    const orders = ['asc', 'desc'];
    params.push(`sort=${fields[Math.floor(Math.random() * fields.length)]}`);
    params.push(`order=${orders[Math.floor(Math.random() * orders.length)]}`);
  }

  return params.length > 0 ? '?' + params.join('&') : '';
}

/**
 * Log error details
 */
export function logError(endpoint, response) {
  console.error(`[ERROR] ${endpoint}`);
  console.error(`  Status: ${response.status}`);
  console.error(`  Duration: ${response.timings.duration}ms`);
  console.error(`  Body: ${response.body.substring(0, 200)}`);
}

/**
 * Validate response structure
 */
export function validateResponseStructure(response, expectedFields = []) {
  try {
    const body = JSON.parse(response.body);

    const checks = {
      'has success field': () => typeof body.success === 'boolean',
      'has data field': () => body.data !== undefined,
      'has meta field': () => body.meta !== undefined,
    };

    // Check for expected fields in data
    if (expectedFields.length > 0 && body.data) {
      expectedFields.forEach(field => {
        checks[`has ${field} field`] = () => body.data[field] !== undefined;
      });
    }

    return check(response, checks);
  } catch (e) {
    console.error('Response validation failed:', e);
    return false;
  }
}

/**
 * Calculate percentile from array
 */
export function calculatePercentile(arr, percentile) {
  if (arr.length === 0) return 0;

  const sorted = arr.slice().sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
}

/**
 * Format duration for logging
 */
export function formatDuration(ms) {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  } else {
    return `${(ms / 60000).toFixed(2)}m`;
  }
}

/**
 * Check if response is cached
 */
export function isCached(response) {
  return response.headers['X-Cache-Status'] === 'HIT' ||
         response.headers['x-cache-status'] === 'HIT';
}

/**
 * Setup test scenario
 */
export function setupScenario(scenarioName) {
  console.log(`\n========================================`);
  console.log(`Starting scenario: ${scenarioName}`);
  console.log(`========================================\n`);
}

/**
 * Teardown test scenario
 */
export function teardownScenario(scenarioName) {
  console.log(`\n========================================`);
  console.log(`Completed scenario: ${scenarioName}`);
  console.log(`========================================\n`);
}

/**
 * Generate random date in range
 */
export function randomDate(start, end) {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime).toISOString().split('T')[0];
}

/**
 * Generate test session data
 */
export function generateSessionData() {
  return {
    startTime: new Date(),
    vusActive: __VU,
    iteration: __ITER,
  };
}
