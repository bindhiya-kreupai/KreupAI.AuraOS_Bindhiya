/**
 * Reports API Load Tests
 * Week 9-10: Performance Testing
 *
 * Comprehensive load tests for Reports & Analytics APIs:
 * - List reports with filters
 * - Generate reports (PDF, Excel, CSV)
 * - Download reports
 * - Scheduled reports
 * - Report templates
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
  generateReportConfig,
} from '../utils/helpers.js';

// Test configuration - using load profile
export const options = {
  ...getProfile('load'),

  thresholds: {
    ...thresholds,
    // Reports-specific thresholds
    'http_req_duration{endpoint:reports_list}': ['p(95)<400'],
    'http_req_duration{endpoint:reports_get}': ['p(95)<300'],
    'http_req_duration{endpoint:reports_generate_pdf}': ['p(95)<3000'],
    'http_req_duration{endpoint:reports_generate_excel}': ['p(95)<2500'],
    'http_req_duration{endpoint:reports_generate_csv}': ['p(95)<1500'],
    'http_req_duration{endpoint:reports_download}': ['p(95)<2000'],
    'http_req_duration{endpoint:reports_templates}': ['p(95)<300'],
  },
};

// Setup
export function setup() {
  setupScenario('Reports API Load Test');

  const token = login('admin@e2etest.com', 'Test@1234');

  if (!token) {
    throw new Error('Failed to login');
  }

  // Get existing reports
  const reportsResponse = authenticatedGet(
    `${apiURL}/reports?limit=10`,
    token
  );

  let reportIds = [];
  if (reportsResponse.status === 200) {
    try {
      const body = JSON.parse(reportsResponse.body);
      if (body.data && Array.isArray(body.data)) {
        reportIds = body.data.map(report => report.id);
        console.log(`✅ Found ${reportIds.length} existing reports`);
      }
    } catch (e) {
      console.error('Failed to parse reports:', e);
    }
  }

  // Get report templates
  const templatesResponse = authenticatedGet(
    `${apiURL}/reports/templates`,
    token
  );

  let templateIds = [];
  if (templatesResponse.status === 200) {
    try {
      const body = JSON.parse(templatesResponse.body);
      if (body.data && Array.isArray(body.data)) {
        templateIds = body.data.map(template => template.id);
        console.log(`✅ Found ${templateIds.length} report templates`);
      }
    } catch (e) {
      console.error('Failed to parse templates:', e);
    }
  }

  return { token, reportIds, templateIds };
}

// Main test
export default function (data) {
  const { token, reportIds, templateIds } = data;

  // Group 1: List Reports (Most common - Read-heavy)
  group('List Reports', () => {
    testReportsList(token);
  });

  thinkTime();

  // Group 2: Get Single Report
  group('Get Single Report', () => {
    if (reportIds.length > 0) {
      const randomId = reportIds[Math.floor(Math.random() * reportIds.length)];
      testReportGet(token, randomId);
    }
  });

  thinkTime();

  // Group 3: Get Report Templates (Common)
  group('Get Report Templates', () => {
    testReportTemplates(token);
  });

  thinkTime();

  // Group 4: Generate PDF Report (20% of iterations - heavy operation)
  if (Math.random() > 0.8 && templateIds.length > 0) {
    group('Generate PDF Report', () => {
      const randomTemplateId = templateIds[Math.floor(Math.random() * templateIds.length)];
      const reportId = testGenerateReport(token, randomTemplateId, 'PDF');
      if (reportId) {
        reportIds.push(reportId);
      }
    });

    thinkTime();
  }

  // Group 5: Generate Excel Report (15% of iterations)
  if (Math.random() > 0.85 && templateIds.length > 0) {
    group('Generate Excel Report', () => {
      const randomTemplateId = templateIds[Math.floor(Math.random() * templateIds.length)];
      const reportId = testGenerateReport(token, randomTemplateId, 'Excel');
      if (reportId) {
        reportIds.push(reportId);
      }
    });

    thinkTime();
  }

  // Group 6: Generate CSV Report (10% of iterations)
  if (Math.random() > 0.9 && templateIds.length > 0) {
    group('Generate CSV Report', () => {
      const randomTemplateId = templateIds[Math.floor(Math.random() * templateIds.length)];
      testGenerateReport(token, randomTemplateId, 'CSV');
    });

    thinkTime();
  }

  // Group 7: Download Report (25% of iterations)
  if (Math.random() > 0.75 && reportIds.length > 0) {
    group('Download Report', () => {
      const randomId = reportIds[Math.floor(Math.random() * reportIds.length)];
      testReportDownload(token, randomId);
    });
  }
}

// Teardown
export function teardown(data) {
  teardownScenario('Reports API Load Test');
}

/**
 * Test Reports List API
 */
function testReportsList(token) {
  const queryParams = generateQueryParams();
  const url = `${apiURL}/reports${queryParams}`;

  const response = authenticatedGet(url, token, { endpoint: 'reports_list' });

  check(response, {
    'reports list status is 200': (r) => r.status === 200,
    'reports list has data array': (r) => {
      const data = extractData(r);
      return Array.isArray(data);
    },
    'reports list response time < 400ms': (r) => r.timings.duration < 400,
  });

  return response;
}

/**
 * Test Get Single Report
 */
function testReportGet(token, reportId) {
  const url = `${apiURL}/reports/${reportId}`;

  const response = authenticatedGet(url, token, { endpoint: 'reports_get' });

  check(response, {
    'report get status is 200': (r) => r.status === 200,
    'report get has data': (r) => {
      const data = extractData(r);
      return data && data.id === reportId;
    },
    'report get has required fields': (r) => {
      const data = extractData(r);
      return (
        data &&
        data.name &&
        data.format &&
        data.status
      );
    },
    'report get response time < 300ms': (r) => r.timings.duration < 300,
  });

  return response;
}

/**
 * Test Get Report Templates
 */
function testReportTemplates(token) {
  const url = `${apiURL}/reports/templates`;

  const response = authenticatedGet(url, token, { endpoint: 'reports_templates' });

  check(response, {
    'report templates status is 200': (r) => r.status === 200,
    'report templates has data': (r) => {
      const data = extractData(r);
      return Array.isArray(data);
    },
    'report templates response time < 300ms': (r) => r.timings.duration < 300,
  });

  return response;
}

/**
 * Test Generate Report
 */
function testGenerateReport(token, templateId, format) {
  const reportConfig = generateReportConfig();
  const reportData = {
    templateId,
    format,
    ...reportConfig,
  };

  const url = `${apiURL}/reports/generate`;

  const endpointTag = `reports_generate_${format.toLowerCase()}`;
  const response = authenticatedPost(url, reportData, token, {
    endpoint: endpointTag,
  });

  const maxDuration = format === 'PDF' ? 3000 : format === 'Excel' ? 2500 : 1500;

  const success = check(response, {
    [`generate ${format} report status is 200 or 202`]: (r) => r.status === 200 || r.status === 202,
    [`generate ${format} report has id or job id`]: (r) => {
      const data = extractData(r);
      return data && (data.id || data.jobId);
    },
    [`generate ${format} report response time < ${maxDuration}ms`]: (r) => r.timings.duration < maxDuration,
  });

  if (success) {
    const data = extractData(response);
    return data ? (data.id || data.jobId) : null;
  }

  return null;
}

/**
 * Test Download Report
 */
function testReportDownload(token, reportId) {
  const url = `${apiURL}/reports/${reportId}/download`;

  const response = authenticatedGet(url, token, { endpoint: 'reports_download' });

  check(response, {
    'report download status is 200': (r) => r.status === 200,
    'report download has content': (r) => r.body && r.body.length > 0,
    'report download response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  return response;
}

/**
 * Test Filter Reports by Type
 */
export function testReportsByType(token, reportType) {
  const url = `${apiURL}/reports?type=${reportType}`;

  const response = authenticatedGet(url, token, { endpoint: 'reports_filter' });

  check(response, {
    [`reports filter ${reportType} status is 200`]: (r) => r.status === 200,
    [`reports filter ${reportType} has data`]: (r) => {
      const data = extractData(r);
      return Array.isArray(data);
    },
    [`all reports are type ${reportType}`]: (r) => {
      const data = extractData(r);
      if (!Array.isArray(data)) return true;
      return data.every(report => report.reportType === reportType);
    },
    [`reports filter ${reportType} response time < 400ms`]: (r) => r.timings.duration < 400,
  });

  return response;
}

/**
 * Test Scheduled Reports
 */
export function testScheduledReports(token) {
  const url = `${apiURL}/reports/scheduled`;

  const response = authenticatedGet(url, token, { endpoint: 'reports_scheduled' });

  check(response, {
    'scheduled reports status is 200': (r) => r.status === 200,
    'scheduled reports has data': (r) => {
      const data = extractData(r);
      return Array.isArray(data);
    },
    'scheduled reports response time < 400ms': (r) => r.timings.duration < 400,
  });

  return response;
}

/**
 * Test Report Generation Status
 */
export function testReportGenerationStatus(token, jobId) {
  const url = `${apiURL}/reports/status/${jobId}`;

  const response = authenticatedGet(url, token, { endpoint: 'reports_status' });

  check(response, {
    'report status is 200': (r) => r.status === 200,
    'report status has state': (r) => {
      const data = extractData(r);
      return data && (data.status || data.state);
    },
    'report status response time < 200ms': (r) => r.timings.duration < 200,
  });

  return response;
}

/**
 * Test Custom Report Generation
 */
export function testCustomReport(token) {
  const customReportData = {
    name: 'Load Test Custom Report',
    type: 'custom',
    format: 'Excel',
    query: {
      table: 'employees',
      columns: ['firstName', 'lastName', 'department', 'salary'],
      filters: {
        status: 'ACTIVE',
      },
    },
  };

  const url = `${apiURL}/reports/custom`;

  const response = authenticatedPost(url, customReportData, token, {
    endpoint: 'reports_custom',
  });

  check(response, {
    'custom report status is 200 or 202': (r) => r.status === 200 || r.status === 202,
    'custom report has id': (r) => {
      const data = extractData(r);
      return data && (data.id || data.jobId);
    },
    'custom report response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  return response;
}

/**
 * Test Schedule Report
 */
export function testScheduleReport(token, templateId) {
  const scheduleData = {
    templateId,
    format: 'PDF',
    frequency: 'MONTHLY',
    dayOfMonth: 1,
    recipients: ['test@example.com'],
  };

  const url = `${apiURL}/reports/schedule`;

  const response = authenticatedPost(url, scheduleData, token, {
    endpoint: 'reports_schedule',
  });

  check(response, {
    'schedule report status is 201': (r) => r.status === 201,
    'schedule report has id': (r) => {
      const data = extractData(r);
      return data && data.id;
    },
    'schedule report response time < 500ms': (r) => r.timings.duration < 500,
  });

  return response;
}

/**
 * Test Report Preview
 */
export function testReportPreview(token, templateId) {
  const previewData = {
    templateId,
    limit: 10, // Preview first 10 rows
  };

  const url = `${apiURL}/reports/preview`;

  const response = authenticatedPost(url, previewData, token, {
    endpoint: 'reports_preview',
  });

  check(response, {
    'report preview status is 200': (r) => r.status === 200,
    'report preview has data': (r) => {
      const data = extractData(r);
      return data !== null;
    },
    'report preview response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  return response;
}

/**
 * Test Batch Report Generation
 */
export function testBatchReportGeneration(token, templateIds) {
  const batchData = {
    reports: templateIds.slice(0, 3).map(templateId => ({
      templateId,
      format: 'PDF',
      dateRange: {
        from: '2024-01-01',
        to: '2024-12-31',
      },
    })),
  };

  const url = `${apiURL}/reports/batch/generate`;

  const response = authenticatedPost(url, batchData, token, {
    endpoint: 'reports_batch',
  });

  check(response, {
    'batch report status is 202': (r) => r.status === 202,
    'batch report has job id': (r) => {
      const data = extractData(r);
      return data && data.jobId;
    },
    'batch report response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  return response;
}

/**
 * Test Report Export Formats
 */
export function testReportExportFormats(token) {
  const url = `${apiURL}/reports/formats`;

  const response = authenticatedGet(url, token, { endpoint: 'reports_formats' });

  check(response, {
    'export formats status is 200': (r) => r.status === 200,
    'export formats has data': (r) => {
      const data = extractData(r);
      return Array.isArray(data) && data.length > 0;
    },
    'export formats response time < 200ms': (r) => r.timings.duration < 200,
  });

  return response;
}
