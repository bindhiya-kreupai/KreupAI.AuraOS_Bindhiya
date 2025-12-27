/**
 * Database Performance Test
 * Week 9-10: Performance Testing
 *
 * Tests database-intensive operations:
 * - Complex queries with joins
 * - Aggregations and grouping
 * - Full-text search
 * - Large result sets
 * - Pagination performance
 * - Index effectiveness
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

// Test configuration - using load profile with stricter DB thresholds
export const options = {
  ...getProfile('load'),

  thresholds: {
    ...thresholds,
    // Database operation thresholds
    'http_req_duration{operation:simple_query}': ['p(95)<200'],
    'http_req_duration{operation:complex_query}': ['p(95)<500'],
    'http_req_duration{operation:aggregation}': ['p(95)<800'],
    'http_req_duration{operation:search}': ['p(95)<600'],
    'http_req_duration{operation:large_result}': ['p(95)<1000'],
    'http_req_duration{operation:pagination}': ['p(95)<300'],
  },
};

// Setup
export function setup() {
  setupScenario('Database Performance Test');

  const token = login('admin@e2etest.com', 'Test@1234');

  if (!token) {
    throw new Error('Failed to login');
  }

  console.log('✅ Database performance testing ready');

  return { token };
}

// Main test
export default function (data) {
  const { token } = data;

  // Test 1: Simple queries (most common)
  group('Simple Queries', () => {
    testSimpleQueries(token);
  });

  thinkTime();

  // Test 2: Complex queries with joins
  group('Complex Queries with Joins', () => {
    testComplexQueries(token);
  });

  thinkTime();

  // Test 3: Aggregation queries
  group('Aggregation Queries', () => {
    testAggregationQueries(token);
  });

  thinkTime();

  // Test 4: Full-text search
  group('Full-Text Search', () => {
    testFullTextSearch(token);
  });

  thinkTime();

  // Test 5: Large result sets
  if (Math.random() > 0.7) {
    group('Large Result Sets', () => {
      testLargeResultSets(token);
    });

    thinkTime();
  }

  // Test 6: Pagination performance
  group('Pagination Performance', () => {
    testPaginationPerformance(token);
  });

  thinkTime();

  // Test 7: Sorting and ordering
  if (Math.random() > 0.8) {
    group('Sorting and Ordering', () => {
      testSortingPerformance(token);
    });

    thinkTime();
  }

  // Test 8: Filtering operations
  group('Filtering Operations', () => {
    testFilteringPerformance(token);
  });
}

// Teardown
export function teardown(data) {
  teardownScenario('Database Performance Test');
}

/**
 * Test Simple Queries
 * - Single table SELECT
 * - Primary key lookups
 * - Should use indexes effectively
 */
function testSimpleQueries(token) {
  // Test 1: Get by ID (primary key lookup)
  const getByIdResponse = authenticatedGet(
    `${apiURL}/employees/1`,
    token,
    { operation: 'simple_query' }
  );

  check(getByIdResponse, {
    'simple: get by ID status 200': (r) => r.status === 200,
    'simple: get by ID < 200ms': (r) => r.timings.duration < 200,
  });

  // Test 2: List with limit (indexed query)
  const listResponse = authenticatedGet(
    `${apiURL}/employees?limit=10`,
    token,
    { operation: 'simple_query' }
  );

  check(listResponse, {
    'simple: list with limit status 200': (r) => r.status === 200,
    'simple: list with limit < 200ms': (r) => r.timings.duration < 200,
  });

  // Test 3: Count query
  const countResponse = authenticatedGet(
    `${apiURL}/employees/count`,
    token,
    { operation: 'simple_query' }
  );

  check(countResponse, {
    'simple: count query status 200': (r) => r.status === 200,
    'simple: count query < 200ms': (r) => r.timings.duration < 200,
  });
}

/**
 * Test Complex Queries with Joins
 * - Multi-table joins
 * - Nested relationships
 * - Should test query optimization
 */
function testComplexQueries(token) {
  // Test 1: Employee with department and position (2 joins)
  const employeeWithRelationsResponse = authenticatedGet(
    `${apiURL}/employees?include=department,position`,
    token,
    { operation: 'complex_query' }
  );

  check(employeeWithRelationsResponse, {
    'complex: employee with relations status 200': (r) => r.status === 200,
    'complex: employee with relations < 500ms': (r) => r.timings.duration < 500,
  });

  // Test 2: Payslip with employee and components (3+ joins)
  const payslipWithDetailsResponse = authenticatedGet(
    `${apiURL}/payroll/payslips?include=employee,components,deductions`,
    token,
    { operation: 'complex_query' }
  );

  check(payslipWithDetailsResponse, {
    'complex: payslip with details status 200': (r) => r.status === 200,
    'complex: payslip with details < 500ms': (r) => r.timings.duration < 500,
  });

  // Test 3: Org chart query (recursive/hierarchical)
  const orgChartResponse = authenticatedGet(
    `${apiURL}/organization/chart`,
    token,
    { operation: 'complex_query' }
  );

  check(orgChartResponse, {
    'complex: org chart status 200': (r) => r.status === 200,
    'complex: org chart < 500ms': (r) => r.timings.duration < 500,
  });
}

/**
 * Test Aggregation Queries
 * - GROUP BY operations
 * - SUM, AVG, COUNT aggregates
 * - Should test aggregation performance
 */
function testAggregationQueries(token) {
  // Test 1: Employee count by department
  const deptCountResponse = authenticatedGet(
    `${apiURL}/analytics/employees/by-department`,
    token,
    { operation: 'aggregation' }
  );

  check(deptCountResponse, {
    'aggregation: dept count status 200': (r) => r.status === 200,
    'aggregation: dept count < 800ms': (r) => r.timings.duration < 800,
  });

  // Test 2: Payroll summary (SUM, AVG)
  const payrollSummaryResponse = authenticatedGet(
    `${apiURL}/payroll/summary?month=01&year=2024`,
    token,
    { operation: 'aggregation' }
  );

  check(payrollSummaryResponse, {
    'aggregation: payroll summary status 200': (r) => r.status === 200,
    'aggregation: payroll summary < 800ms': (r) => r.timings.duration < 800,
  });

  // Test 3: Attendance statistics
  const attendanceStatsResponse = authenticatedGet(
    `${apiURL}/attendance/statistics?month=01&year=2024`,
    token,
    { operation: 'aggregation' }
  );

  check(attendanceStatsResponse, {
    'aggregation: attendance stats status 200': (r) => r.status === 200,
    'aggregation: attendance stats < 800ms': (r) => r.timings.duration < 800,
  });
}

/**
 * Test Full-Text Search
 * - Text search across multiple fields
 * - Should use full-text indexes or search engine
 */
function testFullTextSearch(token) {
  const searchTerms = ['john', 'manager', 'engineering', 'developer', 'test'];

  for (const term of searchTerms.slice(0, 3)) {
    const searchResponse = authenticatedGet(
      `${apiURL}/employees?search=${term}`,
      token,
      { operation: 'search' }
    );

    check(searchResponse, {
      [`search: '${term}' status 200`]: (r) => r.status === 200,
      [`search: '${term}' < 600ms`]: (r) => r.timings.duration < 600,
      [`search: '${term}' has results`]: (r) => {
        const data = extractData(r);
        return Array.isArray(data);
      },
    });
  }
}

/**
 * Test Large Result Sets
 * - Queries returning many rows
 * - Should test memory and network handling
 */
function testLargeResultSets(token) {
  // Test 1: Large limit (100 rows)
  const largeResponse = authenticatedGet(
    `${apiURL}/employees?limit=100`,
    token,
    { operation: 'large_result' }
  );

  check(largeResponse, {
    'large result: 100 rows status 200': (r) => r.status === 200,
    'large result: 100 rows < 1000ms': (r) => r.timings.duration < 1000,
    'large result: 100 rows has data': (r) => {
      const data = extractData(r);
      return Array.isArray(data);
    },
  });

  // Test 2: Attendance for full month (potentially hundreds of records)
  const monthAttendanceResponse = authenticatedGet(
    `${apiURL}/attendance?startDate=2024-01-01&endDate=2024-01-31&limit=500`,
    token,
    { operation: 'large_result' }
  );

  check(monthAttendanceResponse, {
    'large result: month attendance status 200': (r) => r.status === 200,
    'large result: month attendance < 1000ms': (r) => r.timings.duration < 1000,
  });
}

/**
 * Test Pagination Performance
 * - Different page sizes
 * - Deep pagination
 * - Should test OFFSET performance
 */
function testPaginationPerformance(token) {
  const pageSizes = [10, 25, 50];
  const pageNumbers = [1, 2, 5, 10];

  const randomPageSize = pageSizes[Math.floor(Math.random() * pageSizes.length)];
  const randomPage = pageNumbers[Math.floor(Math.random() * pageNumbers.length)];

  const paginationResponse = authenticatedGet(
    `${apiURL}/employees?page=${randomPage}&limit=${randomPageSize}`,
    token,
    { operation: 'pagination' }
  );

  check(paginationResponse, {
    [`pagination: page ${randomPage} limit ${randomPageSize} status 200`]: (r) =>
      r.status === 200,
    [`pagination: page ${randomPage} limit ${randomPageSize} < 300ms`]: (r) =>
      r.timings.duration < 300,
    'pagination: has pagination meta': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.meta && body.meta.pagination;
      } catch {
        return false;
      }
    },
  });

  // Test deep pagination (potential performance issue)
  if (randomPage === 10) {
    const deepPageResponse = authenticatedGet(
      `${apiURL}/employees?page=50&limit=10`,
      token,
      { operation: 'pagination' }
    );

    check(deepPageResponse, {
      'deep pagination: page 50 status 200': (r) => r.status === 200,
      'deep pagination: page 50 < 500ms': (r) => r.timings.duration < 500,
    });
  }
}

/**
 * Test Sorting Performance
 * - Different sort fields
 * - Ascending/descending
 * - Should test index usage for sorting
 */
function testSortingPerformance(token) {
  const sortFields = ['firstName', 'lastName', 'joiningDate', 'salary'];
  const sortOrders = ['asc', 'desc'];

  const randomField = sortFields[Math.floor(Math.random() * sortFields.length)];
  const randomOrder = sortOrders[Math.floor(Math.random() * sortOrders.length)];

  const sortResponse = authenticatedGet(
    `${apiURL}/employees?sort=${randomField}&order=${randomOrder}&limit=50`,
    token,
    { operation: 'complex_query' }
  );

  check(sortResponse, {
    [`sorting: ${randomField} ${randomOrder} status 200`]: (r) => r.status === 200,
    [`sorting: ${randomField} ${randomOrder} < 400ms`]: (r) => r.timings.duration < 400,
  });
}

/**
 * Test Filtering Performance
 * - Single and multiple filters
 * - Range filters
 * - Should test WHERE clause optimization
 */
function testFilteringPerformance(token) {
  // Test 1: Single filter
  const singleFilterResponse = authenticatedGet(
    `${apiURL}/employees?status=ACTIVE`,
    token,
    { operation: 'simple_query' }
  );

  check(singleFilterResponse, {
    'filter: single status 200': (r) => r.status === 200,
    'filter: single < 300ms': (r) => r.timings.duration < 300,
  });

  // Test 2: Multiple filters
  const multiFilterResponse = authenticatedGet(
    `${apiURL}/employees?status=ACTIVE&department=Engineering&location=Dubai`,
    token,
    { operation: 'complex_query' }
  );

  check(multiFilterResponse, {
    'filter: multiple status 200': (r) => r.status === 200,
    'filter: multiple < 400ms': (r) => r.timings.duration < 400,
  });

  // Test 3: Range filter
  const rangeFilterResponse = authenticatedGet(
    `${apiURL}/employees?joiningDate[gte]=2024-01-01&joiningDate[lte]=2024-12-31`,
    token,
    { operation: 'complex_query' }
  );

  check(rangeFilterResponse, {
    'filter: date range status 200': (r) => r.status === 200,
    'filter: date range < 400ms': (r) => r.timings.duration < 400,
  });

  // Test 4: Numeric range filter
  const salaryFilterResponse = authenticatedGet(
    `${apiURL}/employees?salary[gte]=5000&salary[lte]=20000`,
    token,
    { operation: 'complex_query' }
  );

  check(salaryFilterResponse, {
    'filter: salary range status 200': (r) => r.status === 200,
    'filter: salary range < 400ms': (r) => r.timings.duration < 400,
  });
}

/**
 * Performance Analysis Notes
 *
 * Monitor these DB performance indicators:
 *
 * 1. Query Execution Time:
 *    - Simple queries: < 200ms
 *    - Complex queries: < 500ms
 *    - Aggregations: < 800ms
 *
 * 2. Index Usage:
 *    - Check database query plans
 *    - Ensure indexes are used for filters, sorts
 *
 * 3. N+1 Query Problems:
 *    - Watch for multiple sequential queries
 *    - Use eager loading/joins instead
 *
 * 4. Connection Pooling:
 *    - Monitor connection pool saturation
 *    - Ensure connections are released properly
 *
 * 5. Query Optimization:
 *    - Review slow query log
 *    - Optimize queries > 500ms
 */
