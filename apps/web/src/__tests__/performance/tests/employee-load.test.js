/**
 * Employee API Load Tests
 * Week 9-10: Performance Testing
 *
 * Comprehensive load tests for Employee Management APIs:
 * - List employees with various filters and pagination
 * - Get single employee
 * - Create employee
 * - Update employee
 * - Delete employee
 * - Search employees
 */

import { check, group } from 'k6';
import { apiURL, thresholds, getProfile } from '../k6.config.js';
import {
  login,
  thinkTime,
  authenticatedGet,
  authenticatedPost,
  authenticatedPut,
  authenticatedDelete,
  checkResponse,
  generateEmployeeData,
  generateQueryParams,
  extractData,
  setupScenario,
  teardownScenario,
  batchRequests,
} from '../utils/helpers.js';

// Test configuration - using load profile
export const options = {
  ...getProfile('load'),

  thresholds: {
    ...thresholds,
    // Employee-specific thresholds
    'http_req_duration{endpoint:employees_list}': ['p(95)<400'],
    'http_req_duration{endpoint:employees_get}': ['p(95)<300'],
    'http_req_duration{endpoint:employees_create}': ['p(95)<500'],
    'http_req_duration{endpoint:employees_update}': ['p(95)<500'],
    'http_req_duration{endpoint:employees_delete}': ['p(95)<400'],
    'http_req_duration{endpoint:employees_search}': ['p(95)<600'],
  },
};

// Setup
export function setup() {
  setupScenario('Employee API Load Test');

  const token = login('admin@e2etest.com', 'Test@1234');

  if (!token) {
    throw new Error('Failed to login');
  }

  // Pre-create some employees for testing
  const employeeIds = [];
  for (let i = 0; i < 10; i++) {
    const employeeData = generateEmployeeData();
    const response = authenticatedPost(
      `${apiURL}/employees`,
      employeeData,
      token
    );

    if (response.status === 201) {
      const data = extractData(response);
      if (data && data.id) {
        employeeIds.push(data.id);
      }
    }
  }

  console.log(`✅ Pre-created ${employeeIds.length} employees for testing`);

  return { token, employeeIds };
}

// Main test
export default function (data) {
  const { token, employeeIds } = data;

  // Group 1: List Employees (Read-heavy scenario)
  group('List Employees', () => {
    testEmployeeList(token);
  });

  thinkTime();

  // Group 2: Get Employee (Read scenario)
  group('Get Single Employee', () => {
    if (employeeIds.length > 0) {
      const randomId = employeeIds[Math.floor(Math.random() * employeeIds.length)];
      testEmployeeGet(token, randomId);
    }
  });

  thinkTime();

  // Group 3: Search Employees (Search scenario)
  group('Search Employees', () => {
    testEmployeeSearch(token);
  });

  thinkTime();

  // Group 4: Create Employee (Write scenario - less frequent)
  if (Math.random() > 0.7) { // 30% of iterations create
    group('Create Employee', () => {
      const createdId = testEmployeeCreate(token);
      if (createdId) {
        employeeIds.push(createdId);
      }
    });

    thinkTime();
  }

  // Group 5: Update Employee (Write scenario - less frequent)
  if (Math.random() > 0.8 && employeeIds.length > 0) { // 20% of iterations update
    group('Update Employee', () => {
      const randomId = employeeIds[Math.floor(Math.random() * employeeIds.length)];
      testEmployeeUpdate(token, randomId);
    });

    thinkTime();
  }

  // Group 6: Batch Operations
  if (Math.random() > 0.9) { // 10% of iterations do batch
    group('Batch Employee Requests', () => {
      testBatchEmployeeRequests(token, employeeIds);
    });
  }
}

// Teardown
export function teardown(data) {
  const { token, employeeIds } = data;

  // Cleanup: Delete created employees
  console.log(`\nCleaning up ${employeeIds.length} test employees...`);

  let deleted = 0;
  for (const id of employeeIds) {
    const response = authenticatedDelete(`${apiURL}/employees/${id}`, token);
    if (response.status === 200) {
      deleted++;
    }
  }

  console.log(`✅ Cleaned up ${deleted} employees`);

  teardownScenario('Employee API Load Test');
}

/**
 * Test Employee List API with various filters
 */
function testEmployeeList(token) {
  const queryParams = generateQueryParams();
  const url = `${apiURL}/employees${queryParams}`;

  const response = authenticatedGet(url, token, { endpoint: 'employees_list' });

  check(response, {
    'employees list status is 200': (r) => r.status === 200,
    'employees list has data array': (r) => {
      const data = extractData(r);
      return Array.isArray(data);
    },
    'employees list response time < 400ms': (r) => r.timings.duration < 400,
  });

  return response;
}

/**
 * Test Get Single Employee
 */
function testEmployeeGet(token, employeeId) {
  const url = `${apiURL}/employees/${employeeId}`;

  const response = authenticatedGet(url, token, { endpoint: 'employees_get' });

  check(response, {
    'employee get status is 200': (r) => r.status === 200,
    'employee get has data': (r) => {
      const data = extractData(r);
      return data && data.id === employeeId;
    },
    'employee get response time < 300ms': (r) => r.timings.duration < 300,
  });

  return response;
}

/**
 * Test Employee Search
 */
function testEmployeeSearch(token) {
  const searchTerms = ['test', 'john', 'employee', 'manager', 'developer'];
  const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];

  const url = `${apiURL}/employees?search=${randomTerm}`;

  const response = authenticatedGet(url, token, { endpoint: 'employees_search' });

  check(response, {
    'employee search status is 200': (r) => r.status === 200,
    'employee search has results': (r) => {
      const data = extractData(r);
      return Array.isArray(data);
    },
    'employee search response time < 600ms': (r) => r.timings.duration < 600,
  });

  return response;
}

/**
 * Test Create Employee
 */
function testEmployeeCreate(token) {
  const employeeData = generateEmployeeData();
  const url = `${apiURL}/employees`;

  const response = authenticatedPost(url, employeeData, token, { endpoint: 'employees_create' });

  const success = check(response, {
    'employee create status is 201': (r) => r.status === 201,
    'employee create has id': (r) => {
      const data = extractData(r);
      return data && data.id;
    },
    'employee create response time < 500ms': (r) => r.timings.duration < 500,
  });

  if (success) {
    const data = extractData(response);
    return data ? data.id : null;
  }

  return null;
}

/**
 * Test Update Employee
 */
function testEmployeeUpdate(token, employeeId) {
  const updateData = {
    phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    firstName: `UpdatedFirst${Date.now()}`,
  };

  const url = `${apiURL}/employees/${employeeId}`;

  const response = authenticatedPut(url, updateData, token, { endpoint: 'employees_update' });

  check(response, {
    'employee update status is 200': (r) => r.status === 200,
    'employee update has updated data': (r) => {
      const data = extractData(r);
      return data && data.id === employeeId;
    },
    'employee update response time < 500ms': (r) => r.timings.duration < 500,
  });

  return response;
}

/**
 * Test Delete Employee
 */
function testEmployeeDelete(token, employeeId) {
  const url = `${apiURL}/employees/${employeeId}`;

  const response = authenticatedDelete(url, token, { endpoint: 'employees_delete' });

  check(response, {
    'employee delete status is 200': (r) => r.status === 200,
    'employee delete response time < 400ms': (r) => r.timings.duration < 400,
  });

  return response;
}

/**
 * Test Batch Employee Requests
 */
function testBatchEmployeeRequests(token, employeeIds) {
  // Get multiple employees in batch
  const requests = [];

  for (let i = 0; i < Math.min(5, employeeIds.length); i++) {
    const randomId = employeeIds[Math.floor(Math.random() * employeeIds.length)];
    requests.push({
      method: 'GET',
      url: `${apiURL}/employees/${randomId}`,
      tags: { endpoint: 'employees_batch' },
    });
  }

  const responses = batchRequests(requests, token);

  let successCount = 0;
  responses.forEach((response, index) => {
    const success = check(response, {
      [`batch request ${index} status is 200`]: (r) => r.status === 200,
      [`batch request ${index} response time < 500ms`]: (r) => r.timings.duration < 500,
    });

    if (success) {
      successCount++;
    }
  });

  check(null, {
    'batch requests all successful': () => successCount === responses.length,
  });
}

/**
 * Test Employee List with Filtering
 */
export function testEmployeeListWithFilters(token) {
  const filters = [
    '?department=Engineering',
    '?location=New York',
    '?status=active',
    '?manager=true',
    '?joiningDate[gte]=2024-01-01',
  ];

  const randomFilter = filters[Math.floor(Math.random() * filters.length)];
  const url = `${apiURL}/employees${randomFilter}`;

  const response = authenticatedGet(url, token, { endpoint: 'employees_filter' });

  check(response, {
    'filtered employees list status is 200': (r) => r.status === 200,
    'filtered employees list has data': (r) => {
      const data = extractData(r);
      return Array.isArray(data);
    },
    'filtered employees list response time < 500ms': (r) => r.timings.duration < 500,
  });

  return response;
}

/**
 * Test Employee List Pagination
 */
export function testEmployeeListPagination(token) {
  const pages = [1, 2, 3];
  const limits = [10, 25, 50];

  const randomPage = pages[Math.floor(Math.random() * pages.length)];
  const randomLimit = limits[Math.floor(Math.random() * limits.length)];

  const url = `${apiURL}/employees?page=${randomPage}&limit=${randomLimit}`;

  const response = authenticatedGet(url, token, { endpoint: 'employees_pagination' });

  check(response, {
    'paginated employees list status is 200': (r) => r.status === 200,
    'paginated employees list has pagination meta': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.meta && body.meta.pagination;
      } catch {
        return false;
      }
    },
    'paginated employees list response time < 400ms': (r) => r.timings.duration < 400,
  });

  return response;
}
