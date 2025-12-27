/**
 * Leave Management API Load Tests
 * Week 9-10: Performance Testing
 *
 * Comprehensive load tests for Leave Management APIs:
 * - List leave applications with filters
 * - Get single leave application
 * - Apply for leave
 * - Approve/reject leave requests
 * - Leave balance queries
 * - Leave calendar operations
 */

import { check, group } from 'k6';
import { apiURL, thresholds, getProfile } from '../k6.config.js';
import {
  login,
  thinkTime,
  authenticatedGet,
  authenticatedPost,
  authenticatedPut,
  checkResponse,
  extractData,
  setupScenario,
  teardownScenario,
  generateQueryParams,
  randomDate,
} from '../utils/helpers.js';

// Test configuration - using load profile
export const options = {
  ...getProfile('load'),

  thresholds: {
    ...thresholds,
    // Leave-specific thresholds
    'http_req_duration{endpoint:leave_list}': ['p(95)<400'],
    'http_req_duration{endpoint:leave_get}': ['p(95)<300'],
    'http_req_duration{endpoint:leave_apply}': ['p(95)<600'],
    'http_req_duration{endpoint:leave_approve}': ['p(95)<500'],
    'http_req_duration{endpoint:leave_balance}': ['p(95)<300'],
    'http_req_duration{endpoint:leave_calendar}': ['p(95)<600'],
  },
};

// Setup
export function setup() {
  setupScenario('Leave Management API Load Test');

  const token = login('admin@e2etest.com', 'Test@1234');

  if (!token) {
    throw new Error('Failed to login');
  }

  // Get list of employees for testing
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
        console.log(`✅ Found ${employeeIds.length} employees for leave testing`);
      }
    } catch (e) {
      console.error('Failed to parse employees:', e);
    }
  }

  // Get existing leave applications
  const leaveResponse = authenticatedGet(
    `${apiURL}/leave/applications?limit=10`,
    token
  );

  let leaveIds = [];
  if (leaveResponse.status === 200) {
    try {
      const body = JSON.parse(leaveResponse.body);
      if (body.data && Array.isArray(body.data)) {
        leaveIds = body.data.map(leave => leave.id);
        console.log(`✅ Found ${leaveIds.length} existing leave applications`);
      }
    } catch (e) {
      console.error('Failed to parse leave applications:', e);
    }
  }

  // Get leave types
  const leaveTypesResponse = authenticatedGet(
    `${apiURL}/leave/types`,
    token
  );

  let leaveTypes = [];
  if (leaveTypesResponse.status === 200) {
    try {
      const body = JSON.parse(leaveTypesResponse.body);
      if (body.data && Array.isArray(body.data)) {
        leaveTypes = body.data.map(type => type.id);
        console.log(`✅ Found ${leaveTypes.length} leave types`);
      }
    } catch (e) {
      console.error('Failed to parse leave types:', e);
    }
  }

  return { token, employeeIds, leaveIds, leaveTypes };
}

// Main test
export default function (data) {
  const { token, employeeIds, leaveIds, leaveTypes } = data;

  // Group 1: List Leave Applications (Most common - Read-heavy)
  group('List Leave Applications', () => {
    testLeaveList(token);
  });

  thinkTime();

  // Group 2: Get Single Leave Application
  group('Get Single Leave Application', () => {
    if (leaveIds.length > 0) {
      const randomId = leaveIds[Math.floor(Math.random() * leaveIds.length)];
      testLeaveGet(token, randomId);
    }
  });

  thinkTime();

  // Group 3: Check Leave Balance (Common operation)
  group('Check Leave Balance', () => {
    if (employeeIds.length > 0) {
      const randomEmployeeId = employeeIds[Math.floor(Math.random() * employeeIds.length)];
      testLeaveBalance(token, randomEmployeeId);
    }
  });

  thinkTime();

  // Group 4: Apply for Leave (30% of iterations)
  if (Math.random() > 0.7 && employeeIds.length > 0 && leaveTypes.length > 0) {
    group('Apply for Leave', () => {
      const randomEmployeeId = employeeIds[Math.floor(Math.random() * employeeIds.length)];
      const randomLeaveType = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
      const newLeaveId = testLeaveApply(token, randomEmployeeId, randomLeaveType);
      if (newLeaveId) {
        leaveIds.push(newLeaveId);
      }
    });

    thinkTime();
  }

  // Group 5: Approve/Reject Leave (Manager operations - 15% of iterations)
  if (Math.random() > 0.85 && leaveIds.length > 0) {
    group('Approve/Reject Leave', () => {
      const randomId = leaveIds[Math.floor(Math.random() * leaveIds.length)];
      const action = Math.random() > 0.5 ? 'approve' : 'reject';
      testLeaveAction(token, randomId, action);
    });

    thinkTime();
  }

  // Group 6: Leave Calendar (20% of iterations)
  if (Math.random() > 0.8) {
    group('Leave Calendar', () => {
      testLeaveCalendar(token);
    });

    thinkTime();
  }

  // Group 7: Filter Leave by Employee (30% of iterations)
  if (Math.random() > 0.7 && employeeIds.length > 0) {
    group('Filter Leave by Employee', () => {
      const randomEmployeeId = employeeIds[Math.floor(Math.random() * employeeIds.length)];
      testLeaveByEmployee(token, randomEmployeeId);
    });
  }
}

// Teardown
export function teardown(data) {
  const { token, leaveIds } = data;

  // Cleanup: Cancel newly created leave applications
  console.log(`\nCleaning up ${leaveIds.length} test leave applications...`);

  let cancelled = 0;
  for (const id of leaveIds.slice(-10)) { // Only cleanup last 10 created
    const response = authenticatedPut(
      `${apiURL}/leave/applications/${id}/cancel`,
      {},
      token
    );
    if (response.status === 200) {
      cancelled++;
    }
  }

  console.log(`✅ Cleaned up ${cancelled} leave applications`);

  teardownScenario('Leave Management API Load Test');
}

/**
 * Test Leave List API
 */
function testLeaveList(token) {
  const queryParams = generateQueryParams();
  const url = `${apiURL}/leave/applications${queryParams}`;

  const response = authenticatedGet(url, token, { endpoint: 'leave_list' });

  check(response, {
    'leave list status is 200': (r) => r.status === 200,
    'leave list has data array': (r) => {
      const data = extractData(r);
      return Array.isArray(data);
    },
    'leave list response time < 400ms': (r) => r.timings.duration < 400,
  });

  return response;
}

/**
 * Test Get Single Leave Application
 */
function testLeaveGet(token, leaveId) {
  const url = `${apiURL}/leave/applications/${leaveId}`;

  const response = authenticatedGet(url, token, { endpoint: 'leave_get' });

  check(response, {
    'leave get status is 200': (r) => r.status === 200,
    'leave get has data': (r) => {
      const data = extractData(r);
      return data && data.id === leaveId;
    },
    'leave get has required fields': (r) => {
      const data = extractData(r);
      return (
        data &&
        data.employeeId &&
        data.leaveTypeId &&
        data.startDate &&
        data.endDate &&
        data.status
      );
    },
    'leave get response time < 300ms': (r) => r.timings.duration < 300,
  });

  return response;
}

/**
 * Test Leave Balance Query
 */
function testLeaveBalance(token, employeeId) {
  const url = `${apiURL}/leave/balance?employeeId=${employeeId}`;

  const response = authenticatedGet(url, token, { endpoint: 'leave_balance' });

  check(response, {
    'leave balance status is 200': (r) => r.status === 200,
    'leave balance has data': (r) => {
      const data = extractData(r);
      return Array.isArray(data) && data.length >= 0;
    },
    'leave balance has required fields': (r) => {
      const data = extractData(r);
      if (!Array.isArray(data) || data.length === 0) return true;
      return data.every(
        balance =>
          balance.leaveTypeId &&
          typeof balance.available === 'number' &&
          typeof balance.used === 'number'
      );
    },
    'leave balance response time < 300ms': (r) => r.timings.duration < 300,
  });

  return response;
}

/**
 * Test Apply for Leave
 */
function testLeaveApply(token, employeeId, leaveTypeId) {
  const startDate = randomDate('2024-01-01', '2024-12-31');
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 5) + 1);

  const leaveData = {
    employeeId,
    leaveTypeId,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    reason: 'Load test - leave application',
  };

  const url = `${apiURL}/leave/applications`;

  const response = authenticatedPost(url, leaveData, token, {
    endpoint: 'leave_apply',
  });

  const success = check(response, {
    'leave apply status is 201': (r) => r.status === 201,
    'leave apply has id': (r) => {
      const data = extractData(r);
      return data && data.id;
    },
    'leave apply has pending status': (r) => {
      const data = extractData(r);
      return data && data.status === 'PENDING';
    },
    'leave apply response time < 600ms': (r) => r.timings.duration < 600,
  });

  if (success) {
    const data = extractData(response);
    return data ? data.id : null;
  }

  return null;
}

/**
 * Test Approve/Reject Leave
 */
function testLeaveAction(token, leaveId, action) {
  const actionData = {
    comments: `Load test - ${action} action`,
  };

  const url = `${apiURL}/leave/applications/${leaveId}/${action}`;

  const response = authenticatedPut(url, actionData, token, {
    endpoint: `leave_${action}`,
  });

  check(response, {
    [`leave ${action} status is 200`]: (r) => r.status === 200,
    [`leave ${action} has updated status`]: (r) => {
      const data = extractData(r);
      const expectedStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
      return data && data.status === expectedStatus;
    },
    [`leave ${action} response time < 500ms`]: (r) => r.timings.duration < 500,
  });

  return response;
}

/**
 * Test Leave Calendar
 */
function testLeaveCalendar(token) {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const url = `${apiURL}/leave/calendar?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`;

  const response = authenticatedGet(url, token, { endpoint: 'leave_calendar' });

  check(response, {
    'leave calendar status is 200': (r) => r.status === 200,
    'leave calendar has data': (r) => {
      const data = extractData(r);
      return Array.isArray(data) || (data && typeof data === 'object');
    },
    'leave calendar response time < 600ms': (r) => r.timings.duration < 600,
  });

  return response;
}

/**
 * Test Filter Leave by Employee
 */
function testLeaveByEmployee(token, employeeId) {
  const url = `${apiURL}/leave/applications?employeeId=${employeeId}`;

  const response = authenticatedGet(url, token, { endpoint: 'leave_filter' });

  check(response, {
    'filtered leave status is 200': (r) => r.status === 200,
    'filtered leave has results': (r) => {
      const data = extractData(r);
      return Array.isArray(data);
    },
    'all leave belong to employee': (r) => {
      const data = extractData(r);
      if (!Array.isArray(data)) return true;
      return data.every(leave => leave.employeeId === employeeId);
    },
    'filtered leave response time < 400ms': (r) => r.timings.duration < 400,
  });

  return response;
}

/**
 * Test Leave by Status Filter
 */
export function testLeaveByStatus(token, status) {
  const url = `${apiURL}/leave/applications?status=${status}`;

  const response = authenticatedGet(url, token, { endpoint: 'leave_filter' });

  check(response, {
    [`leave filter ${status} status is 200`]: (r) => r.status === 200,
    [`leave filter ${status} has results`]: (r) => {
      const data = extractData(r);
      return Array.isArray(data);
    },
    [`all leave have ${status} status`]: (r) => {
      const data = extractData(r);
      if (!Array.isArray(data)) return true;
      return data.every(leave => leave.status === status);
    },
    [`leave filter ${status} response time < 400ms`]: (r) => r.timings.duration < 400,
  });

  return response;
}

/**
 * Test Leave Types Listing
 */
export function testLeaveTypes(token) {
  const url = `${apiURL}/leave/types`;

  const response = authenticatedGet(url, token, { endpoint: 'leave_types' });

  check(response, {
    'leave types status is 200': (r) => r.status === 200,
    'leave types has data': (r) => {
      const data = extractData(r);
      return Array.isArray(data) && data.length > 0;
    },
    'leave types have required fields': (r) => {
      const data = extractData(r);
      if (!Array.isArray(data)) return false;
      return data.every(
        type => type.id && type.name && typeof type.maxDays === 'number'
      );
    },
    'leave types response time < 200ms': (r) => r.timings.duration < 200,
  });

  return response;
}

/**
 * Test Leave Policies Listing
 */
export function testLeavePolicies(token) {
  const url = `${apiURL}/leave/policies`;

  const response = authenticatedGet(url, token, { endpoint: 'leave_policies' });

  check(response, {
    'leave policies status is 200': (r) => r.status === 200,
    'leave policies has data': (r) => {
      const data = extractData(r);
      return Array.isArray(data);
    },
    'leave policies response time < 300ms': (r) => r.timings.duration < 300,
  });

  return response;
}

/**
 * Test Cancel Leave Application
 */
export function testLeaveCancel(token, leaveId) {
  const url = `${apiURL}/leave/applications/${leaveId}/cancel`;

  const response = authenticatedPut(url, {}, token, {
    endpoint: 'leave_cancel',
  });

  check(response, {
    'leave cancel status is 200': (r) => r.status === 200,
    'leave cancel has cancelled status': (r) => {
      const data = extractData(r);
      return data && data.status === 'CANCELLED';
    },
    'leave cancel response time < 400ms': (r) => r.timings.duration < 400,
  });

  return response;
}

/**
 * Test Leave History
 */
export function testLeaveHistory(token, employeeId) {
  const url = `${apiURL}/leave/history?employeeId=${employeeId}`;

  const response = authenticatedGet(url, token, { endpoint: 'leave_history' });

  check(response, {
    'leave history status is 200': (r) => r.status === 200,
    'leave history has data': (r) => {
      const data = extractData(r);
      return Array.isArray(data);
    },
    'leave history response time < 500ms': (r) => r.timings.duration < 500,
  });

  return response;
}
