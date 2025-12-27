/**
 * Mixed Workload Test
 * Week 9-10: Performance Testing
 *
 * Realistic production workload simulation:
 * - Multiple user types (HR, Managers, Employees)
 * - Different usage patterns
 * - Read-heavy with occasional writes
 * - Concurrent operations
 *
 * Simulates real-world usage across all modules
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
  generateEmployeeData,
  generateQueryParams,
  randomDate,
} from '../utils/helpers.js';

// Test configuration - using load profile
export const options = {
  ...getProfile('load'),

  scenarios: {
    // Scenario 1: HR Admin users (20% of load)
    hr_admins: {
      executor: 'ramping-vus',
      exec: 'hrAdminWorkflow',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 10 },
        { duration: '5m', target: 10 },
        { duration: '2m', target: 0 },
      ],
    },

    // Scenario 2: Managers (30% of load)
    managers: {
      executor: 'ramping-vus',
      exec: 'managerWorkflow',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 15 },
        { duration: '5m', target: 15 },
        { duration: '2m', target: 0 },
      ],
    },

    // Scenario 3: Regular employees (50% of load)
    employees: {
      executor: 'ramping-vus',
      exec: 'employeeWorkflow',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 25 },
        { duration: '5m', target: 25 },
        { duration: '2m', target: 0 },
      ],
    },
  },

  thresholds: {
    ...thresholds,
    // Workload-specific thresholds
    'http_req_duration{user_type:hr_admin}': ['p(95)<600'],
    'http_req_duration{user_type:manager}': ['p(95)<500'],
    'http_req_duration{user_type:employee}': ['p(95)<400'],
  },
};

// Setup
export function setup() {
  setupScenario('Mixed Workload Test - Multi-User Simulation');

  // Login with different user types
  const adminToken = login('admin@e2etest.com', 'Test@1234');
  const managerToken = login('manager@e2etest.com', 'Test@1234');
  const employeeToken = login('user@e2etest.com', 'Test@1234');

  if (!adminToken || !managerToken || !employeeToken) {
    throw new Error('Failed to login with test users');
  }

  // Get baseline data
  const employeesResponse = authenticatedGet(
    `${apiURL}/employees?limit=20`,
    adminToken
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

  console.log('✅ Mixed workload test ready with 3 user types');

  return {
    tokens: {
      admin: adminToken,
      manager: managerToken,
      employee: employeeToken,
    },
    employeeIds,
  };
}

/**
 * HR Admin Workflow
 * - Manage employees
 * - Process payroll
 * - Generate reports
 * - View analytics
 */
export function hrAdminWorkflow(data) {
  const { tokens, employeeIds } = data;
  const token = tokens.admin;

  // Dashboard check
  group('HR Admin: Dashboard', () => {
    const response = authenticatedGet(`${apiURL}/dashboard`, token, {
      user_type: 'hr_admin',
    });

    check(response, {
      'HR dashboard loaded': (r) => r.status === 200,
    });
  });

  thinkTime();

  // Employee management (60% of time)
  if (Math.random() > 0.4) {
    group('HR Admin: Employee Management', () => {
      // List employees
      authenticatedGet(`${apiURL}/employees?limit=50`, token, {
        user_type: 'hr_admin',
      });

      thinkTime();

      // View employee details
      if (employeeIds.length > 0) {
        const randomId = employeeIds[Math.floor(Math.random() * employeeIds.length)];
        authenticatedGet(`${apiURL}/employees/${randomId}`, token, {
          user_type: 'hr_admin',
        });
      }
    });

    thinkTime();
  }

  // Payroll operations (30% of time)
  if (Math.random() > 0.7) {
    group('HR Admin: Payroll', () => {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear());

      // View payslips
      authenticatedGet(`${apiURL}/payroll/payslips?month=${month}&year=${year}`, token, {
        user_type: 'hr_admin',
      });

      thinkTime();

      // Payroll summary
      authenticatedGet(`${apiURL}/payroll/summary?month=${month}&year=${year}`, token, {
        user_type: 'hr_admin',
      });
    });

    thinkTime();
  }

  // Analytics and reports (40% of time)
  if (Math.random() > 0.6) {
    group('HR Admin: Analytics', () => {
      // Employee analytics
      authenticatedGet(`${apiURL}/analytics/employees`, token, {
        user_type: 'hr_admin',
      });

      thinkTime();

      // Attendance analytics
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear());
      authenticatedGet(`${apiURL}/analytics/attendance?month=${month}&year=${year}`, token, {
        user_type: 'hr_admin',
      });
    });

    thinkTime();
  }

  // Create/update operations (15% of time)
  if (Math.random() > 0.85) {
    group('HR Admin: Write Operations', () => {
      // Create employee
      const employeeData = generateEmployeeData();
      const response = authenticatedPost(`${apiURL}/employees`, employeeData, token, {
        user_type: 'hr_admin',
      });

      if (response.status === 201) {
        const data = extractData(response);
        if (data && data.id) {
          employeeIds.push(data.id);
        }
      }
    });

    thinkTime();
  }
}

/**
 * Manager Workflow
 * - View team members
 * - Approve leave requests
 * - Review attendance
 * - Check team performance
 */
export function managerWorkflow(data) {
  const { tokens, employeeIds } = data;
  const token = tokens.manager;

  // Dashboard check
  group('Manager: Dashboard', () => {
    authenticatedGet(`${apiURL}/dashboard`, token, {
      user_type: 'manager',
    });
  });

  thinkTime();

  // Team view (80% of time)
  if (Math.random() > 0.2) {
    group('Manager: Team View', () => {
      // View team members
      authenticatedGet(`${apiURL}/employees?manager=me&limit=20`, token, {
        user_type: 'manager',
      });

      thinkTime();

      // View team member details
      if (employeeIds.length > 0) {
        const randomId = employeeIds[Math.floor(Math.random() * employeeIds.length)];
        authenticatedGet(`${apiURL}/employees/${randomId}`, token, {
          user_type: 'manager',
        });
      }
    });

    thinkTime();
  }

  // Leave approvals (60% of time)
  if (Math.random() > 0.4) {
    group('Manager: Leave Management', () => {
      // View pending leave requests
      authenticatedGet(`${apiURL}/leave/applications?status=PENDING&manager=me`, token, {
        user_type: 'manager',
      });

      thinkTime();

      // Approve/reject leave (20% chance)
      if (Math.random() > 0.8) {
        // This would require actual pending leaves, skipping for load test
      }
    });

    thinkTime();
  }

  // Attendance review (40% of time)
  if (Math.random() > 0.6) {
    group('Manager: Attendance Review', () => {
      // Team attendance
      authenticatedGet(`${apiURL}/attendance?team=me&limit=50`, token, {
        user_type: 'manager',
      });

      thinkTime();

      // Late arrivals
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      authenticatedGet(
        `${apiURL}/attendance/late-arrivals?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}&team=me`,
        token,
        { user_type: 'manager' }
      );
    });

    thinkTime();
  }

  // Team performance (30% of time)
  if (Math.random() > 0.7) {
    group('Manager: Team Performance', () => {
      authenticatedGet(`${apiURL}/analytics/team-performance?manager=me`, token, {
        user_type: 'manager',
      });
    });
  }
}

/**
 * Employee Workflow
 * - View own information
 * - Clock in/out
 * - Apply for leave
 * - View payslips
 */
export function employeeWorkflow(data) {
  const { tokens } = data;
  const token = tokens.employee;

  // View own profile (70% of time)
  if (Math.random() > 0.3) {
    group('Employee: Profile', () => {
      authenticatedGet(`${apiURL}/employees/me`, token, {
        user_type: 'employee',
      });
    });

    thinkTime();
  }

  // Clock in/out (30% of time - simulates shift start/end)
  if (Math.random() > 0.7) {
    group('Employee: Attendance', () => {
      // Clock in
      const clockInData = {
        employeeId: 'me',
        clockInTime: new Date().toISOString(),
        location: {
          latitude: 25.2048,
          longitude: 55.2708,
        },
      };

      authenticatedPost(`${apiURL}/attendance/clock-in`, clockInData, token, {
        user_type: 'employee',
      });
    });

    thinkTime();
  }

  // Leave operations (40% of time)
  if (Math.random() > 0.6) {
    group('Employee: Leave', () => {
      // View leave balance
      authenticatedGet(`${apiURL}/leave/balance?employeeId=me`, token, {
        user_type: 'employee',
      });

      thinkTime();

      // View leave history
      authenticatedGet(`${apiURL}/leave/applications?employeeId=me`, token, {
        user_type: 'employee',
      });

      thinkTime();

      // Apply for leave (10% chance)
      if (Math.random() > 0.9) {
        const startDate = randomDate('2024-01-01', '2024-12-31');
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 2);

        const leaveData = {
          employeeId: 'me',
          leaveTypeId: 'annual-leave',
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          reason: 'Personal',
        };

        authenticatedPost(`${apiURL}/leave/applications`, leaveData, token, {
          user_type: 'employee',
        });
      }
    });

    thinkTime();
  }

  // View payslips (35% of time)
  if (Math.random() > 0.65) {
    group('Employee: Payroll', () => {
      // View payslips
      authenticatedGet(`${apiURL}/payroll/payslips?employeeId=me`, token, {
        user_type: 'employee',
      });

      thinkTime();

      // Download latest payslip (20% chance)
      if (Math.random() > 0.8) {
        // This would require actual payslip ID, skipping for load test
      }
    });
  }
}

// Teardown
export function teardown(data) {
  teardownScenario('Mixed Workload Test');
}

/**
 * Workload Distribution Analysis
 *
 * Expected distribution:
 * - Read operations: ~85%
 * - Write operations: ~10%
 * - Heavy operations (reports, analytics): ~5%
 *
 * User type distribution:
 * - Employees: 50% (mostly reads)
 * - Managers: 30% (reads + approvals)
 * - HR Admins: 20% (reads + writes + heavy ops)
 *
 * This simulates realistic production load patterns
 */
