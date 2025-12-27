/**
 * Attendance API Load Tests
 * Week 9-10: Performance Testing
 *
 * Comprehensive load tests for Attendance Management APIs:
 * - Clock in/out operations
 * - Attendance list with filters
 * - Attendance summary and statistics
 * - Regularization requests
 * - Overtime tracking
 * - Shift assignment
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
    // Attendance-specific thresholds
    'http_req_duration{endpoint:attendance_list}': ['p(95)<400'],
    'http_req_duration{endpoint:attendance_clock_in}': ['p(95)<300'],
    'http_req_duration{endpoint:attendance_clock_out}': ['p(95)<300'],
    'http_req_duration{endpoint:attendance_summary}': ['p(95)<600'],
    'http_req_duration{endpoint:attendance_regularize}': ['p(95)<500'],
    'http_req_duration{endpoint:overtime_list}': ['p(95)<400'],
  },
};

// Setup
export function setup() {
  setupScenario('Attendance API Load Test');

  const token = login('admin@e2etest.com', 'Test@1234');

  if (!token) {
    throw new Error('Failed to login');
  }

  // Get list of employees
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
        console.log(`✅ Found ${employeeIds.length} employees for attendance testing`);
      }
    } catch (e) {
      console.error('Failed to parse employees:', e);
    }
  }

  // Get existing attendance records
  const attendanceResponse = authenticatedGet(
    `${apiURL}/attendance?limit=10`,
    token
  );

  let attendanceIds = [];
  if (attendanceResponse.status === 200) {
    try {
      const body = JSON.parse(attendanceResponse.body);
      if (body.data && Array.isArray(body.data)) {
        attendanceIds = body.data.map(att => att.id);
        console.log(`✅ Found ${attendanceIds.length} existing attendance records`);
      }
    } catch (e) {
      console.error('Failed to parse attendance records:', e);
    }
  }

  return { token, employeeIds, attendanceIds };
}

// Main test
export default function (data) {
  const { token, employeeIds, attendanceIds } = data;

  // Group 1: List Attendance Records (Most common - Read-heavy)
  group('List Attendance Records', () => {
    testAttendanceList(token);
  });

  thinkTime();

  // Group 2: Get Attendance Summary (Common)
  group('Get Attendance Summary', () => {
    if (employeeIds.length > 0) {
      const randomEmployeeId = employeeIds[Math.floor(Math.random() * employeeIds.length)];
      testAttendanceSummary(token, randomEmployeeId);
    }
  });

  thinkTime();

  // Group 3: Clock In (20% of iterations - simulating employee check-in)
  if (Math.random() > 0.8 && employeeIds.length > 0) {
    group('Clock In', () => {
      const randomEmployeeId = employeeIds[Math.floor(Math.random() * employeeIds.length)];
      testClockIn(token, randomEmployeeId);
    });

    thinkTime();
  }

  // Group 4: Clock Out (18% of iterations - slightly less than clock in)
  if (Math.random() > 0.82 && attendanceIds.length > 0) {
    group('Clock Out', () => {
      const randomId = attendanceIds[Math.floor(Math.random() * attendanceIds.length)];
      testClockOut(token, randomId);
    });

    thinkTime();
  }

  // Group 5: Filter Attendance by Employee (25% of iterations)
  if (Math.random() > 0.75 && employeeIds.length > 0) {
    group('Filter Attendance by Employee', () => {
      const randomEmployeeId = employeeIds[Math.floor(Math.random() * employeeIds.length)];
      testAttendanceByEmployee(token, randomEmployeeId);
    });

    thinkTime();
  }

  // Group 6: Regularization Request (10% of iterations)
  if (Math.random() > 0.9 && attendanceIds.length > 0) {
    group('Regularization Request', () => {
      const randomId = attendanceIds[Math.floor(Math.random() * attendanceIds.length)];
      testRegularizationRequest(token, randomId);
    });

    thinkTime();
  }

  // Group 7: Overtime Tracking (15% of iterations)
  if (Math.random() > 0.85) {
    group('Overtime Tracking', () => {
      testOvertimeList(token);
    });
  }
}

// Teardown
export function teardown(data) {
  teardownScenario('Attendance API Load Test');
}

/**
 * Test Attendance List API
 */
function testAttendanceList(token) {
  const queryParams = generateQueryParams();
  const url = `${apiURL}/attendance${queryParams}`;

  const response = authenticatedGet(url, token, { endpoint: 'attendance_list' });

  check(response, {
    'attendance list status is 200': (r) => r.status === 200,
    'attendance list has data array': (r) => {
      const data = extractData(r);
      return Array.isArray(data);
    },
    'attendance list response time < 400ms': (r) => r.timings.duration < 400,
  });

  return response;
}

/**
 * Test Attendance Summary
 */
function testAttendanceSummary(token, employeeId) {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const url = `${apiURL}/attendance/summary?employeeId=${employeeId}&startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`;

  const response = authenticatedGet(url, token, { endpoint: 'attendance_summary' });

  check(response, {
    'attendance summary status is 200': (r) => r.status === 200,
    'attendance summary has data': (r) => {
      const data = extractData(r);
      return data !== null && typeof data === 'object';
    },
    'attendance summary has metrics': (r) => {
      const data = extractData(r);
      return (
        data &&
        typeof data.totalDays === 'number' &&
        typeof data.presentDays === 'number'
      );
    },
    'attendance summary response time < 600ms': (r) => r.timings.duration < 600,
  });

  return response;
}

/**
 * Test Clock In
 */
function testClockIn(token, employeeId) {
  const clockInData = {
    employeeId,
    clockInTime: new Date().toISOString(),
    location: {
      latitude: 25.2048 + (Math.random() - 0.5) * 0.01,
      longitude: 55.2708 + (Math.random() - 0.5) * 0.01,
    },
  };

  const url = `${apiURL}/attendance/clock-in`;

  const response = authenticatedPost(url, clockInData, token, {
    endpoint: 'attendance_clock_in',
  });

  check(response, {
    'clock in status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'clock in has id': (r) => {
      const data = extractData(r);
      return data && data.id;
    },
    'clock in has clock in time': (r) => {
      const data = extractData(r);
      return data && data.clockInTime;
    },
    'clock in response time < 300ms': (r) => r.timings.duration < 300,
  });

  return response;
}

/**
 * Test Clock Out
 */
function testClockOut(token, attendanceId) {
  const clockOutData = {
    clockOutTime: new Date().toISOString(),
    location: {
      latitude: 25.2048 + (Math.random() - 0.5) * 0.01,
      longitude: 55.2708 + (Math.random() - 0.5) * 0.01,
    },
  };

  const url = `${apiURL}/attendance/${attendanceId}/clock-out`;

  const response = authenticatedPut(url, clockOutData, token, {
    endpoint: 'attendance_clock_out',
  });

  check(response, {
    'clock out status is 200': (r) => r.status === 200,
    'clock out has clock out time': (r) => {
      const data = extractData(r);
      return data && data.clockOutTime;
    },
    'clock out has working hours': (r) => {
      const data = extractData(r);
      return data && typeof data.workingHours === 'number';
    },
    'clock out response time < 300ms': (r) => r.timings.duration < 300,
  });

  return response;
}

/**
 * Test Filter Attendance by Employee
 */
function testAttendanceByEmployee(token, employeeId) {
  const url = `${apiURL}/attendance?employeeId=${employeeId}`;

  const response = authenticatedGet(url, token, { endpoint: 'attendance_filter' });

  check(response, {
    'filtered attendance status is 200': (r) => r.status === 200,
    'filtered attendance has results': (r) => {
      const data = extractData(r);
      return Array.isArray(data);
    },
    'all attendance belong to employee': (r) => {
      const data = extractData(r);
      if (!Array.isArray(data)) return true;
      return data.every(att => att.employeeId === employeeId);
    },
    'filtered attendance response time < 400ms': (r) => r.timings.duration < 400,
  });

  return response;
}

/**
 * Test Regularization Request
 */
function testRegularizationRequest(token, attendanceId) {
  const regularizationData = {
    requestedClockIn: '09:00:00',
    requestedClockOut: '18:00:00',
    reason: 'Load test - forgot to clock in/out',
  };

  const url = `${apiURL}/attendance/${attendanceId}/regularize`;

  const response = authenticatedPost(url, regularizationData, token, {
    endpoint: 'attendance_regularize',
  });

  check(response, {
    'regularization status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'regularization has request data': (r) => {
      const data = extractData(r);
      return data !== null;
    },
    'regularization response time < 500ms': (r) => r.timings.duration < 500,
  });

  return response;
}

/**
 * Test Overtime List
 */
function testOvertimeList(token) {
  const queryParams = generateQueryParams();
  const url = `${apiURL}/attendance/overtime${queryParams}`;

  const response = authenticatedGet(url, token, { endpoint: 'overtime_list' });

  check(response, {
    'overtime list status is 200': (r) => r.status === 200,
    'overtime list has data': (r) => {
      const data = extractData(r);
      return Array.isArray(data);
    },
    'overtime list response time < 400ms': (r) => r.timings.duration < 400,
  });

  return response;
}

/**
 * Test Attendance by Date Range
 */
export function testAttendanceByDateRange(token, startDate, endDate) {
  const url = `${apiURL}/attendance?startDate=${startDate}&endDate=${endDate}`;

  const response = authenticatedGet(url, token, { endpoint: 'attendance_filter' });

  check(response, {
    'date range attendance status is 200': (r) => r.status === 200,
    'date range attendance has data': (r) => {
      const data = extractData(r);
      return Array.isArray(data);
    },
    'date range attendance response time < 500ms': (r) => r.timings.duration < 500,
  });

  return response;
}

/**
 * Test Shift Assignment List
 */
export function testShiftAssignments(token) {
  const url = `${apiURL}/attendance/shifts/assignments`;

  const response = authenticatedGet(url, token, { endpoint: 'shift_assignments' });

  check(response, {
    'shift assignments status is 200': (r) => r.status === 200,
    'shift assignments has data': (r) => {
      const data = extractData(r);
      return Array.isArray(data);
    },
    'shift assignments response time < 400ms': (r) => r.timings.duration < 400,
  });

  return response;
}

/**
 * Test Late Arrivals Report
 */
export function testLateArrivals(token) {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const url = `${apiURL}/attendance/late-arrivals?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`;

  const response = authenticatedGet(url, token, { endpoint: 'late_arrivals' });

  check(response, {
    'late arrivals status is 200': (r) => r.status === 200,
    'late arrivals has data': (r) => {
      const data = extractData(r);
      return Array.isArray(data);
    },
    'late arrivals response time < 500ms': (r) => r.timings.duration < 500,
  });

  return response;
}

/**
 * Test Early Departures Report
 */
export function testEarlyDepartures(token) {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const url = `${apiURL}/attendance/early-departures?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`;

  const response = authenticatedGet(url, token, { endpoint: 'early_departures' });

  check(response, {
    'early departures status is 200': (r) => r.status === 200,
    'early departures has data': (r) => {
      const data = extractData(r);
      return Array.isArray(data);
    },
    'early departures response time < 500ms': (r) => r.timings.duration < 500,
  });

  return response;
}

/**
 * Test Absenteeism Report
 */
export function testAbsenteeism(token) {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const url = `${apiURL}/attendance/absenteeism?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`;

  const response = authenticatedGet(url, token, { endpoint: 'absenteeism' });

  check(response, {
    'absenteeism status is 200': (r) => r.status === 200,
    'absenteeism has data': (r) => {
      const data = extractData(r);
      return Array.isArray(data);
    },
    'absenteeism response time < 600ms': (r) => r.timings.duration < 600,
  });

  return response;
}

/**
 * Test Attendance Statistics
 */
export function testAttendanceStatistics(token) {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear());

  const url = `${apiURL}/attendance/statistics?month=${month}&year=${year}`;

  const response = authenticatedGet(url, token, { endpoint: 'attendance_stats' });

  check(response, {
    'attendance statistics status is 200': (r) => r.status === 200,
    'attendance statistics has data': (r) => {
      const data = extractData(r);
      return data !== null && typeof data === 'object';
    },
    'attendance statistics has metrics': (r) => {
      const data = extractData(r);
      return (
        data &&
        typeof data.totalEmployees === 'number' &&
        typeof data.attendanceRate === 'number'
      );
    },
    'attendance statistics response time < 700ms': (r) => r.timings.duration < 700,
  });

  return response;
}

/**
 * Test Regularization Approval
 */
export function testRegularizationApproval(token, regularizationId) {
  const approvalData = {
    status: 'APPROVED',
    comments: 'Load test - approved',
  };

  const url = `${apiURL}/attendance/regularizations/${regularizationId}/approve`;

  const response = authenticatedPut(url, approvalData, token, {
    endpoint: 'regularization_approve',
  });

  check(response, {
    'regularization approval status is 200': (r) => r.status === 200,
    'regularization approval updated status': (r) => {
      const data = extractData(r);
      return data && data.status === 'APPROVED';
    },
    'regularization approval response time < 400ms': (r) => r.timings.duration < 400,
  });

  return response;
}
