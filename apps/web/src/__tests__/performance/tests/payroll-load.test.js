/**
 * Payroll API Load Tests
 * Week 9-10: Performance Testing
 *
 * Comprehensive load tests for Payroll Management APIs:
 * - List payslips with filters (month, year, employee)
 * - Get single payslip details
 * - Download payslip PDF
 * - Process payroll (heavy operation)
 * - Batch payslip operations
 * - Statutory compliance operations
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
  generateQueryParams,
} from '../utils/helpers.js';

// Test configuration - using load profile
export const options = {
  ...getProfile('load'),

  thresholds: {
    ...thresholds,
    // Payroll-specific thresholds
    'http_req_duration{endpoint:payslips_list}': ['p(95)<500'],
    'http_req_duration{endpoint:payslips_get}': ['p(95)<400'],
    'http_req_duration{endpoint:payslips_download}': ['p(95)<2000'], // PDF generation
    'http_req_duration{endpoint:payroll_process}': ['p(95)<5000'], // Heavy operation
    'http_req_duration{endpoint:payroll_statutory}': ['p(95)<1000'],
  },
};

// Setup
export function setup() {
  setupScenario('Payroll API Load Test');

  const token = login('admin@e2etest.com', 'Test@1234');

  if (!token) {
    throw new Error('Failed to login');
  }

  // Get current month and year for testing
  const now = new Date();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentYear = String(now.getFullYear());

  // Get list of employees to use in tests
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
        console.log(`✅ Found ${employeeIds.length} employees for payroll testing`);
      }
    } catch (e) {
      console.error('Failed to parse employees:', e);
    }
  }

  // Try to get some existing payslips
  const payslipsResponse = authenticatedGet(
    `${apiURL}/payroll/payslips?limit=10`,
    token
  );

  let payslipIds = [];
  if (payslipsResponse.status === 200) {
    try {
      const body = JSON.parse(payslipsResponse.body);
      if (body.data && Array.isArray(body.data)) {
        payslipIds = body.data.map(ps => ps.id);
        console.log(`✅ Found ${payslipIds.length} existing payslips for testing`);
      }
    } catch (e) {
      console.error('Failed to parse payslips:', e);
    }
  }

  return {
    token,
    employeeIds,
    payslipIds,
    currentMonth,
    currentYear,
  };
}

// Main test
export default function (data) {
  const { token, employeeIds, payslipIds, currentMonth, currentYear } = data;

  // Group 1: List Payslips (Most common - Read-heavy scenario)
  group('List Payslips', () => {
    testPayslipList(token, currentMonth, currentYear);
  });

  thinkTime();

  // Group 2: Get Single Payslip (Common - Read scenario)
  group('Get Single Payslip', () => {
    if (payslipIds.length > 0) {
      const randomId = payslipIds[Math.floor(Math.random() * payslipIds.length)];
      testPayslipGet(token, randomId);
    }
  });

  thinkTime();

  // Group 3: Filter Payslips by Employee (Common scenario)
  group('Filter Payslips by Employee', () => {
    if (employeeIds.length > 0) {
      const randomEmployeeId = employeeIds[Math.floor(Math.random() * employeeIds.length)];
      testPayslipsByEmployee(token, randomEmployeeId);
    }
  });

  thinkTime();

  // Group 4: Download Payslip PDF (Occasional - 40% of iterations)
  if (Math.random() > 0.6 && payslipIds.length > 0) {
    group('Download Payslip PDF', () => {
      const randomId = payslipIds[Math.floor(Math.random() * payslipIds.length)];
      testPayslipDownload(token, randomId);
    });

    thinkTime();
  }

  // Group 5: Process Payroll (Rare - Only 10% of iterations, heavy operation)
  if (Math.random() > 0.9) {
    group('Process Payroll', () => {
      testPayrollProcess(token, currentMonth, currentYear);
    });

    thinkTime();
  }

  // Group 6: Statutory Compliance Operations (Occasional - 20% of iterations)
  if (Math.random() > 0.8) {
    group('Statutory Compliance', () => {
      testStatutoryCompliance(token, currentMonth, currentYear);
    });

    thinkTime();
  }

  // Group 7: Batch Payslip Requests (Rare - 10% of iterations)
  if (Math.random() > 0.9 && payslipIds.length > 0) {
    group('Batch Payslip Requests', () => {
      testBatchPayslipRequests(token, payslipIds);
    });
  }
}

// Teardown
export function teardown(data) {
  teardownScenario('Payroll API Load Test');
}

/**
 * Test Payslip List API with filters
 */
function testPayslipList(token, month, year) {
  const queryParams = generateQueryParams();
  const url = `${apiURL}/payroll/payslips${queryParams}`;

  const response = authenticatedGet(url, token, { endpoint: 'payslips_list' });

  check(response, {
    'payslips list status is 200': (r) => r.status === 200,
    'payslips list has data array': (r) => {
      const data = extractData(r);
      return Array.isArray(data);
    },
    'payslips list response time < 500ms': (r) => r.timings.duration < 500,
  });

  return response;
}

/**
 * Test Get Single Payslip
 */
function testPayslipGet(token, payslipId) {
  const url = `${apiURL}/payroll/payslips/${payslipId}`;

  const response = authenticatedGet(url, token, { endpoint: 'payslips_get' });

  check(response, {
    'payslip get status is 200': (r) => r.status === 200,
    'payslip get has data': (r) => {
      const data = extractData(r);
      return data && data.id === payslipId;
    },
    'payslip get has required fields': (r) => {
      const data = extractData(r);
      return (
        data &&
        data.employeeId &&
        data.month &&
        data.year &&
        typeof data.netSalary === 'number'
      );
    },
    'payslip get response time < 400ms': (r) => r.timings.duration < 400,
  });

  return response;
}

/**
 * Test Payslips by Employee Filter
 */
function testPayslipsByEmployee(token, employeeId) {
  const url = `${apiURL}/payroll/payslips?employeeId=${employeeId}`;

  const response = authenticatedGet(url, token, { endpoint: 'payslips_filter' });

  check(response, {
    'filtered payslips status is 200': (r) => r.status === 200,
    'filtered payslips has results': (r) => {
      const data = extractData(r);
      return Array.isArray(data);
    },
    'all payslips belong to employee': (r) => {
      const data = extractData(r);
      if (!Array.isArray(data)) return false;
      return data.every(ps => ps.employeeId === employeeId);
    },
    'filtered payslips response time < 500ms': (r) => r.timings.duration < 500,
  });

  return response;
}

/**
 * Test Download Payslip PDF
 */
function testPayslipDownload(token, payslipId) {
  const url = `${apiURL}/payroll/payslips/${payslipId}/download`;

  const response = authenticatedGet(url, token, { endpoint: 'payslips_download' });

  check(response, {
    'payslip download status is 200': (r) => r.status === 200,
    'payslip download has PDF content-type': (r) => {
      const contentType = r.headers['Content-Type'] || r.headers['content-type'];
      return contentType && contentType.includes('application/pdf');
    },
    'payslip download has content': (r) => r.body && r.body.length > 0,
    'payslip download response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  return response;
}

/**
 * Test Process Payroll (Heavy Operation)
 */
function testPayrollProcess(token, month, year) {
  const processData = {
    month: month,
    year: year,
    processType: 'full', // or 'incremental'
  };

  const url = `${apiURL}/payroll/process`;

  const response = authenticatedPost(url, processData, token, {
    endpoint: 'payroll_process',
  });

  check(response, {
    'payroll process status is 200 or 202': (r) => r.status === 200 || r.status === 202,
    'payroll process has job id or confirmation': (r) => {
      const data = extractData(r);
      return data && (data.jobId || data.processedCount !== undefined);
    },
    'payroll process response time < 5000ms': (r) => r.timings.duration < 5000,
  });

  return response;
}

/**
 * Test Statutory Compliance Operations
 */
function testStatutoryCompliance(token, month, year) {
  // Test PF (Provident Fund) return
  const pfUrl = `${apiURL}/payroll/statutory/pf?month=${month}&year=${year}`;

  const pfResponse = authenticatedGet(pfUrl, token, {
    endpoint: 'payroll_statutory',
  });

  check(pfResponse, {
    'PF return status is 200': (r) => r.status === 200,
    'PF return has data': (r) => {
      const data = extractData(r);
      return data !== null;
    },
    'PF return response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  thinkTime(0.5); // Short think time between related operations

  // Test ESI (Employee State Insurance) return
  const esiUrl = `${apiURL}/payroll/statutory/esi?month=${month}&year=${year}`;

  const esiResponse = authenticatedGet(esiUrl, token, {
    endpoint: 'payroll_statutory',
  });

  check(esiResponse, {
    'ESI return status is 200': (r) => r.status === 200,
    'ESI return has data': (r) => {
      const data = extractData(r);
      return data !== null;
    },
    'ESI return response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  return { pfResponse, esiResponse };
}

/**
 * Test Batch Payslip Requests
 */
function testBatchPayslipRequests(token, payslipIds) {
  const batchSize = Math.min(5, payslipIds.length);
  let successCount = 0;

  for (let i = 0; i < batchSize; i++) {
    const randomId = payslipIds[Math.floor(Math.random() * payslipIds.length)];
    const url = `${apiURL}/payroll/payslips/${randomId}`;

    const response = authenticatedGet(url, token, { endpoint: 'payslips_batch' });

    const success = check(response, {
      [`batch payslip ${i} status is 200`]: (r) => r.status === 200,
      [`batch payslip ${i} response time < 600ms`]: (r) => r.timings.duration < 600,
    });

    if (success) {
      successCount++;
    }
  }

  check(null, {
    'batch payslip requests all successful': () => successCount === batchSize,
  });
}

/**
 * Test Payslip List with Month/Year Filter
 */
export function testPayslipListByPeriod(token, month, year) {
  const url = `${apiURL}/payroll/payslips?month=${month}&year=${year}`;

  const response = authenticatedGet(url, token, { endpoint: 'payslips_filter' });

  check(response, {
    'period payslips status is 200': (r) => r.status === 200,
    'period payslips has data': (r) => {
      const data = extractData(r);
      return Array.isArray(data);
    },
    'all payslips match period': (r) => {
      const data = extractData(r);
      if (!Array.isArray(data)) return false;
      return data.every(ps => ps.month === month && ps.year === year);
    },
    'period payslips response time < 500ms': (r) => r.timings.duration < 500,
  });

  return response;
}

/**
 * Test Payroll Summary/Dashboard
 */
export function testPayrollSummary(token, month, year) {
  const url = `${apiURL}/payroll/summary?month=${month}&year=${year}`;

  const response = authenticatedGet(url, token, { endpoint: 'payroll_summary' });

  check(response, {
    'payroll summary status is 200': (r) => r.status === 200,
    'payroll summary has metrics': (r) => {
      const data = extractData(r);
      return (
        data &&
        typeof data.totalEmployees === 'number' &&
        typeof data.totalPayroll === 'number'
      );
    },
    'payroll summary response time < 800ms': (r) => r.timings.duration < 800,
  });

  return response;
}

/**
 * Test Payroll Process Status Check
 */
export function testPayrollProcessStatus(token, jobId) {
  const url = `${apiURL}/payroll/process/status/${jobId}`;

  const response = authenticatedGet(url, token, { endpoint: 'payroll_status' });

  check(response, {
    'process status is 200': (r) => r.status === 200,
    'process status has state': (r) => {
      const data = extractData(r);
      return data && (data.status || data.state);
    },
    'process status response time < 300ms': (r) => r.timings.duration < 300,
  });

  return response;
}

/**
 * Test Payslip Regeneration
 */
export function testPayslipRegenerate(token, payslipId) {
  const url = `${apiURL}/payroll/payslips/${payslipId}/regenerate`;

  const response = authenticatedPost(url, {}, token, {
    endpoint: 'payslips_regenerate',
  });

  check(response, {
    'payslip regenerate status is 200': (r) => r.status === 200,
    'payslip regenerate has updated data': (r) => {
      const data = extractData(r);
      return data && data.id === payslipId;
    },
    'payslip regenerate response time < 1500ms': (r) => r.timings.duration < 1500,
  });

  return response;
}

/**
 * Test Bulk Payslip Download
 */
export function testBulkPayslipDownload(token, month, year) {
  const url = `${apiURL}/payroll/payslips/download/bulk?month=${month}&year=${year}`;

  const response = authenticatedGet(url, token, { endpoint: 'payslips_bulk_download' });

  check(response, {
    'bulk download status is 200 or 202': (r) => r.status === 200 || r.status === 202,
    'bulk download has zip content-type or job id': (r) => {
      const contentType = r.headers['Content-Type'] || r.headers['content-type'];
      const data = extractData(r);
      return (
        (contentType && contentType.includes('application/zip')) ||
        (data && data.jobId)
      );
    },
    'bulk download response time < 3000ms': (r) => r.timings.duration < 3000,
  });

  return response;
}

/**
 * Test Payroll Revert Operation
 */
export function testPayrollRevert(token, month, year) {
  const revertData = {
    month: month,
    year: year,
    reason: 'Load test - revert operation',
  };

  const url = `${apiURL}/payroll/revert`;

  const response = authenticatedPost(url, revertData, token, {
    endpoint: 'payroll_revert',
  });

  check(response, {
    'payroll revert status is 200': (r) => r.status === 200,
    'payroll revert has confirmation': (r) => {
      const data = extractData(r);
      return data && data.revertedCount !== undefined;
    },
    'payroll revert response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  return response;
}

/**
 * Test Payroll Corrections/Adjustments
 */
export function testPayrollAdjustment(token, payslipId) {
  const adjustmentData = {
    adjustmentType: 'allowance',
    amount: 500,
    reason: 'Performance bonus - load test',
  };

  const url = `${apiURL}/payroll/payslips/${payslipId}/adjust`;

  const response = authenticatedPost(url, adjustmentData, token, {
    endpoint: 'payroll_adjustment',
  });

  check(response, {
    'adjustment status is 200': (r) => r.status === 200,
    'adjustment has updated payslip': (r) => {
      const data = extractData(r);
      return data && data.id === payslipId;
    },
    'adjustment response time < 800ms': (r) => r.timings.duration < 800,
  });

  return response;
}
