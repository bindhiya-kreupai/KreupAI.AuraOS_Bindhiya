/**
 * Dashboard & Analytics API Load Tests
 * Week 9-10: Performance Testing
 *
 * Comprehensive load tests for Dashboard & Analytics APIs:
 * - Dashboard data retrieval
 * - Widget data loading
 * - Analytics metrics
 * - Real-time statistics
 * - KPI tracking
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
} from '../utils/helpers.js';

// Test configuration - using load profile
export const options = {
  ...getProfile('load'),

  thresholds: {
    ...thresholds,
    // Dashboard-specific thresholds
    'http_req_duration{endpoint:dashboard_main}': ['p(95)<800'],
    'http_req_duration{endpoint:dashboard_widgets}': ['p(95)<600'],
    'http_req_duration{endpoint:analytics_metrics}': ['p(95)<700'],
    'http_req_duration{endpoint:analytics_trends}': ['p(95)<900'],
    'http_req_duration{endpoint:kpi_dashboard}': ['p(95)<600'],
  },
};

// Setup
export function setup() {
  setupScenario('Dashboard & Analytics API Load Test');

  const token = login('admin@e2etest.com', 'Test@1234');

  if (!token) {
    throw new Error('Failed to login');
  }

  console.log('✅ Setup complete for Dashboard & Analytics testing');

  return { token };
}

// Main test
export default function (data) {
  const { token } = data;

  // Group 1: Main Dashboard (Most common - heavy aggregation)
  group('Main Dashboard', () => {
    testMainDashboard(token);
  });

  thinkTime();

  // Group 2: Dashboard Widgets (Common - multiple concurrent requests)
  group('Dashboard Widgets', () => {
    testDashboardWidgets(token);
  });

  thinkTime();

  // Group 3: Employee Analytics (30% of iterations)
  if (Math.random() > 0.7) {
    group('Employee Analytics', () => {
      testEmployeeAnalytics(token);
    });

    thinkTime();
  }

  // Group 4: Attendance Analytics (25% of iterations)
  if (Math.random() > 0.75) {
    group('Attendance Analytics', () => {
      testAttendanceAnalytics(token);
    });

    thinkTime();
  }

  // Group 5: Payroll Analytics (20% of iterations)
  if (Math.random() > 0.8) {
    group('Payroll Analytics', () => {
      testPayrollAnalytics(token);
    });

    thinkTime();
  }

  // Group 6: Leave Analytics (20% of iterations)
  if (Math.random() > 0.8) {
    group('Leave Analytics', () => {
      testLeaveAnalytics(token);
    });

    thinkTime();
  }

  // Group 7: KPI Dashboard (15% of iterations)
  if (Math.random() > 0.85) {
    group('KPI Dashboard', () => {
      testKPIDashboard(token);
    });

    thinkTime();
  }

  // Group 8: Trend Analysis (10% of iterations)
  if (Math.random() > 0.9) {
    group('Trend Analysis', () => {
      testTrendAnalysis(token);
    });
  }
}

// Teardown
export function teardown(data) {
  teardownScenario('Dashboard & Analytics API Load Test');
}

/**
 * Test Main Dashboard
 */
function testMainDashboard(token) {
  const url = `${apiURL}/dashboard`;

  const response = authenticatedGet(url, token, { endpoint: 'dashboard_main' });

  check(response, {
    'main dashboard status is 200': (r) => r.status === 200,
    'main dashboard has data': (r) => {
      const data = extractData(r);
      return data !== null && typeof data === 'object';
    },
    'main dashboard has metrics': (r) => {
      const data = extractData(r);
      return data && (data.totalEmployees !== undefined || data.widgets !== undefined);
    },
    'main dashboard response time < 800ms': (r) => r.timings.duration < 800,
  });

  return response;
}

/**
 * Test Dashboard Widgets
 */
function testDashboardWidgets(token) {
  const widgetTypes = [
    'employee-count',
    'new-hires',
    'attendance-rate',
    'pending-leaves',
    'payroll-summary',
  ];

  let successCount = 0;

  for (const widgetType of widgetTypes) {
    const url = `${apiURL}/dashboard/widgets/${widgetType}`;
    const response = authenticatedGet(url, token, { endpoint: 'dashboard_widgets' });

    const success = check(response, {
      [`widget ${widgetType} status is 200`]: (r) => r.status === 200,
      [`widget ${widgetType} has data`]: (r) => {
        const data = extractData(r);
        return data !== null;
      },
      [`widget ${widgetType} response time < 600ms`]: (r) => r.timings.duration < 600,
    });

    if (success) {
      successCount++;
    }
  }

  check(null, {
    'all widgets loaded successfully': () => successCount === widgetTypes.length,
  });
}

/**
 * Test Employee Analytics
 */
function testEmployeeAnalytics(token) {
  const url = `${apiURL}/analytics/employees`;

  const response = authenticatedGet(url, token, { endpoint: 'analytics_metrics' });

  check(response, {
    'employee analytics status is 200': (r) => r.status === 200,
    'employee analytics has data': (r) => {
      const data = extractData(r);
      return data !== null && typeof data === 'object';
    },
    'employee analytics has metrics': (r) => {
      const data = extractData(r);
      return (
        data &&
        typeof data.totalCount === 'number' &&
        (data.departmentDistribution !== undefined || data.demographics !== undefined)
      );
    },
    'employee analytics response time < 700ms': (r) => r.timings.duration < 700,
  });

  return response;
}

/**
 * Test Attendance Analytics
 */
function testAttendanceAnalytics(token) {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear());

  const url = `${apiURL}/analytics/attendance?month=${month}&year=${year}`;

  const response = authenticatedGet(url, token, { endpoint: 'analytics_metrics' });

  check(response, {
    'attendance analytics status is 200': (r) => r.status === 200,
    'attendance analytics has data': (r) => {
      const data = extractData(r);
      return data !== null && typeof data === 'object';
    },
    'attendance analytics has metrics': (r) => {
      const data = extractData(r);
      return (
        data &&
        (typeof data.attendanceRate === 'number' ||
          typeof data.averageWorkingHours === 'number')
      );
    },
    'attendance analytics response time < 700ms': (r) => r.timings.duration < 700,
  });

  return response;
}

/**
 * Test Payroll Analytics
 */
function testPayrollAnalytics(token) {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear());

  const url = `${apiURL}/analytics/payroll?month=${month}&year=${year}`;

  const response = authenticatedGet(url, token, { endpoint: 'analytics_metrics' });

  check(response, {
    'payroll analytics status is 200': (r) => r.status === 200,
    'payroll analytics has data': (r) => {
      const data = extractData(r);
      return data !== null && typeof data === 'object';
    },
    'payroll analytics has metrics': (r) => {
      const data = extractData(r);
      return (
        data &&
        (typeof data.totalPayroll === 'number' ||
          typeof data.averageSalary === 'number')
      );
    },
    'payroll analytics response time < 700ms': (r) => r.timings.duration < 700,
  });

  return response;
}

/**
 * Test Leave Analytics
 */
function testLeaveAnalytics(token) {
  const url = `${apiURL}/analytics/leave`;

  const response = authenticatedGet(url, token, { endpoint: 'analytics_metrics' });

  check(response, {
    'leave analytics status is 200': (r) => r.status === 200,
    'leave analytics has data': (r) => {
      const data = extractData(r);
      return data !== null && typeof data === 'object';
    },
    'leave analytics has metrics': (r) => {
      const data = extractData(r);
      return data && (data.pendingCount !== undefined || data.leaveUtilization !== undefined);
    },
    'leave analytics response time < 700ms': (r) => r.timings.duration < 700,
  });

  return response;
}

/**
 * Test KPI Dashboard
 */
function testKPIDashboard(token) {
  const url = `${apiURL}/dashboard/kpi`;

  const response = authenticatedGet(url, token, { endpoint: 'kpi_dashboard' });

  check(response, {
    'KPI dashboard status is 200': (r) => r.status === 200,
    'KPI dashboard has data': (r) => {
      const data = extractData(r);
      return data !== null && typeof data === 'object';
    },
    'KPI dashboard has metrics': (r) => {
      const data = extractData(r);
      return data && (data.kpis !== undefined || Array.isArray(data));
    },
    'KPI dashboard response time < 600ms': (r) => r.timings.duration < 600,
  });

  return response;
}

/**
 * Test Trend Analysis
 */
function testTrendAnalysis(token) {
  const metric = ['employee-count', 'attendance-rate', 'payroll-cost'][
    Math.floor(Math.random() * 3)
  ];

  const url = `${apiURL}/analytics/trends/${metric}?period=6months`;

  const response = authenticatedGet(url, token, { endpoint: 'analytics_trends' });

  check(response, {
    [`trend analysis ${metric} status is 200`]: (r) => r.status === 200,
    [`trend analysis ${metric} has data`]: (r) => {
      const data = extractData(r);
      return Array.isArray(data) || (data && data.dataPoints);
    },
    [`trend analysis ${metric} response time < 900ms`]: (r) => r.timings.duration < 900,
  });

  return response;
}

/**
 * Test Department Analytics
 */
export function testDepartmentAnalytics(token) {
  const url = `${apiURL}/analytics/departments`;

  const response = authenticatedGet(url, token, { endpoint: 'analytics_departments' });

  check(response, {
    'department analytics status is 200': (r) => r.status === 200,
    'department analytics has data': (r) => {
      const data = extractData(r);
      return Array.isArray(data);
    },
    'department analytics response time < 700ms': (r) => r.timings.duration < 700,
  });

  return response;
}

/**
 * Test Headcount Forecast
 */
export function testHeadcountForecast(token) {
  const url = `${apiURL}/analytics/forecast/headcount?months=6`;

  const response = authenticatedGet(url, token, { endpoint: 'analytics_forecast' });

  check(response, {
    'headcount forecast status is 200': (r) => r.status === 200,
    'headcount forecast has data': (r) => {
      const data = extractData(r);
      return data && (data.forecast !== undefined || Array.isArray(data));
    },
    'headcount forecast response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  return response;
}

/**
 * Test Turnover Analysis
 */
export function testTurnoverAnalysis(token) {
  const url = `${apiURL}/analytics/turnover?period=12months`;

  const response = authenticatedGet(url, token, { endpoint: 'analytics_turnover' });

  check(response, {
    'turnover analysis status is 200': (r) => r.status === 200,
    'turnover analysis has data': (r) => {
      const data = extractData(r);
      return data !== null;
    },
    'turnover analysis response time < 800ms': (r) => r.timings.duration < 800,
  });

  return response;
}

/**
 * Test Real-time Statistics
 */
export function testRealTimeStatistics(token) {
  const url = `${apiURL}/dashboard/realtime`;

  const response = authenticatedGet(url, token, { endpoint: 'realtime_stats' });

  check(response, {
    'realtime stats status is 200': (r) => r.status === 200,
    'realtime stats has data': (r) => {
      const data = extractData(r);
      return data !== null;
    },
    'realtime stats response time < 400ms': (r) => r.timings.duration < 400,
  });

  return response;
}
