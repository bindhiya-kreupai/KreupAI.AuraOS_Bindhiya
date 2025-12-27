/**
 * Soak/Endurance Test
 * Week 9-10: Performance Testing
 *
 * Long-running test to detect:
 * - Memory leaks
 * - Resource exhaustion
 * - Performance degradation over time
 * - Connection pool issues
 * - Cache effectiveness
 *
 * Runs sustained load for extended period (1-2 hours)
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
  generateEmployeeData,
  generateQueryParams,
} from '../utils/helpers.js';

// Test configuration - using soak profile (1 hour sustained load)
export const options = {
  ...getProfile('soak'),

  thresholds: {
    ...thresholds,
    // Stricter thresholds for soak test
    http_req_duration: ['p(95)<600', 'p(99)<1000'],
    http_req_failed: ['rate<0.02'], // Allow slightly higher failure rate for long-running test

    // Monitor for performance degradation
    'http_req_duration{endpoint:employees}': ['p(95)<500'],
    'http_req_duration{endpoint:payroll}': ['p(95)<700'],
    'http_req_duration{endpoint:reports}': ['p(95)<1200'],

    // Check for consistent performance
    'http_req_duration{time:first_10min}': ['p(95)<500'],
    'http_req_duration{time:last_10min}': ['p(95)<500'], // Should be similar to first 10 min
  },
};

// Setup
export function setup() {
  setupScenario('Soak/Endurance Test - 1 Hour Sustained Load');

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
        console.log(`✅ Found ${employeeIds.length} employees`);
      }
    } catch (e) {
      console.error('Failed to parse employees:', e);
    }
  }

  console.log('✅ Soak test starting - will run for 1 hour');
  console.log('⏰ Start time:', new Date().toISOString());

  return {
    token,
    employeeIds,
    startTime: Date.now(),
  };
}

// Main test - simulates realistic user behavior over extended period
export default function (data) {
  const { token, employeeIds, startTime } = data;

  // Calculate elapsed time for time-based tagging
  const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
  let timeTag = 'middle';
  if (elapsedMinutes < 10) {
    timeTag = 'first_10min';
  } else if (elapsedMinutes > 50) {
    timeTag = 'last_10min';
  }

  // Realistic user workflow - browsing, reading, occasional writes

  // Scenario 1: Dashboard check (90% of iterations)
  if (Math.random() > 0.1) {
    group('Dashboard Browsing', () => {
      const response = authenticatedGet(`${apiURL}/dashboard`, token, {
        endpoint: 'dashboard',
        time: timeTag,
      });

      check(response, {
        'dashboard loaded': (r) => r.status === 200,
      });
    });

    thinkTime();
  }

  // Scenario 2: Employee browsing (80% of iterations)
  if (Math.random() > 0.2) {
    group('Employee Browsing', () => {
      const queryParams = generateQueryParams();
      const response = authenticatedGet(
        `${apiURL}/employees${queryParams}`,
        token,
        { endpoint: 'employees', time: timeTag }
      );

      check(response, {
        'employee list loaded': (r) => r.status === 200,
      });
    });

    thinkTime();
  }

  // Scenario 3: View employee details (60% of iterations)
  if (Math.random() > 0.4 && employeeIds.length > 0) {
    group('View Employee Details', () => {
      const randomId = employeeIds[Math.floor(Math.random() * employeeIds.length)];
      const response = authenticatedGet(
        `${apiURL}/employees/${randomId}`,
        token,
        { endpoint: 'employees', time: timeTag }
      );

      check(response, {
        'employee details loaded': (r) => r.status === 200,
      });
    });

    thinkTime();
  }

  // Scenario 4: Check attendance (50% of iterations)
  if (Math.random() > 0.5) {
    group('Check Attendance', () => {
      const response = authenticatedGet(
        `${apiURL}/attendance?limit=20`,
        token,
        { endpoint: 'attendance', time: timeTag }
      );

      check(response, {
        'attendance list loaded': (r) => r.status === 200,
      });
    });

    thinkTime();
  }

  // Scenario 5: Check leave applications (40% of iterations)
  if (Math.random() > 0.6) {
    group('Check Leave Applications', () => {
      const response = authenticatedGet(
        `${apiURL}/leave/applications?limit=20`,
        token,
        { endpoint: 'leave', time: timeTag }
      );

      check(response, {
        'leave applications loaded': (r) => r.status === 200,
      });
    });

    thinkTime();
  }

  // Scenario 6: Check payroll (30% of iterations)
  if (Math.random() > 0.7) {
    group('Check Payroll', () => {
      const response = authenticatedGet(
        `${apiURL}/payroll/payslips?limit=20`,
        token,
        { endpoint: 'payroll', time: timeTag }
      );

      check(response, {
        'payslips loaded': (r) => r.status === 200,
      });
    });

    thinkTime();
  }

  // Scenario 7: Generate report (10% of iterations - heavy operation)
  if (Math.random() > 0.9) {
    group('Generate Report', () => {
      const reportData = {
        reportType: 'employee',
        format: 'PDF',
        dateRange: {
          from: '2024-01-01',
          to: '2024-12-31',
        },
      };

      const response = authenticatedPost(
        `${apiURL}/reports/generate`,
        reportData,
        token,
        { endpoint: 'reports', time: timeTag }
      );

      check(response, {
        'report generation started': (r) => r.status === 200 || r.status === 202,
      });
    });

    thinkTime();
  }

  // Scenario 8: Search operations (20% of iterations)
  if (Math.random() > 0.8) {
    group('Search Operations', () => {
      const searchTerms = ['test', 'employee', 'manager', 'developer'];
      const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];

      const response = authenticatedGet(
        `${apiURL}/employees?search=${term}`,
        token,
        { endpoint: 'employees', time: timeTag }
      );

      check(response, {
        'search completed': (r) => r.status === 200,
      });
    });

    thinkTime();
  }

  // Scenario 9: Analytics check (15% of iterations)
  if (Math.random() > 0.85) {
    group('Analytics Check', () => {
      const response = authenticatedGet(
        `${apiURL}/analytics/employees`,
        token,
        { endpoint: 'analytics', time: timeTag }
      );

      check(response, {
        'analytics loaded': (r) => r.status === 200,
      });
    });

    thinkTime();
  }

  // Scenario 10: Create employee (5% of iterations - write operation)
  if (Math.random() > 0.95) {
    group('Create Employee', () => {
      const employeeData = generateEmployeeData();

      const response = authenticatedPost(
        `${apiURL}/employees`,
        employeeData,
        token,
        { endpoint: 'employees', time: timeTag }
      );

      if (response.status === 201) {
        try {
          const data = extractData(response);
          if (data && data.id) {
            employeeIds.push(data.id);
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }

      check(response, {
        'employee created': (r) => r.status === 201,
      });
    });

    thinkTime();
  }

  // Log progress every 100 iterations
  if (__ITER % 100 === 0) {
    const elapsed = (Date.now() - startTime) / 1000 / 60;
    console.log(`⏱️  ${elapsed.toFixed(1)} minutes elapsed, iteration ${__ITER}`);
  }
}

// Teardown
export function teardown(data) {
  const { startTime } = data;
  const duration = (Date.now() - startTime) / 1000 / 60;

  console.log('\n========================================');
  console.log('Soak Test Completed');
  console.log(`Duration: ${duration.toFixed(2)} minutes`);
  console.log(`End time: ${new Date().toISOString()}`);
  console.log('========================================\n');

  teardownScenario('Soak/Endurance Test');
}

/**
 * Custom Metrics Summary
 *
 * Monitor these metrics to detect issues:
 *
 * 1. Response Time Degradation:
 *    - Compare p95 of first 10 min vs last 10 min
 *    - Should be within 20% difference
 *
 * 2. Error Rate:
 *    - Should remain stable throughout test
 *    - Spike in errors indicates resource exhaustion
 *
 * 3. Request Duration Trend:
 *    - Should be relatively flat
 *    - Gradual increase indicates memory leak
 *
 * 4. Success Rate:
 *    - Should remain above 98%
 *    - Degradation indicates system instability
 */
