/**
 * API Testing Utilities and Helpers
 * Week 3: API Testing Foundation
 * Reusable utilities for API integration testing
 */

import { NextRequest } from 'next/server';
import { generateAccessToken } from '@/lib/auth/jwt';
import type { PrismaClient } from '@prisma/client';

/**
 * HTTP Method Types
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * API Request Builder Options
 */
interface ApiRequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
  query?: Record<string, string>;
  token?: string;
}

/**
 * Create an authenticated API request
 */
export function createApiRequest(
  url: string,
  options: ApiRequestOptions = {}
): NextRequest {
  const {
    method = 'GET',
    headers = {},
    body,
    params = {},
    query = {},
    token,
  } = options;

  // Build URL with query parameters
  const queryString = new URLSearchParams(query).toString();
  const fullUrl = queryString ? `${url}?${queryString}` : url;

  // Build headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  // Create request configuration
  const requestConfig: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== 'GET') {
    requestConfig.body = JSON.stringify(body);
  }

  return new NextRequest(fullUrl, requestConfig);
}

/**
 * Create a test auth token
 */
export function createTestAuthToken(userOverrides: {
  userId?: string;
  email?: string;
  tenantId?: string;
  sessionId?: string;
} = {}): string {
  return generateAccessToken({
    userId: userOverrides.userId || 'test-user-id',
    email: userOverrides.email || 'test@example.com',
    tenantId: userOverrides.tenantId || 'test-tenant-id',
    sessionId: userOverrides.sessionId || `session-${crypto.randomUUID()}`,
  });
}

/**
 * Extract JSON from response
 */
export async function extractJsonResponse(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${error}`);
  }
}

/**
 * Assert successful API response
 */
export function assertSuccessResponse(
  response: Response,
  data: any,
  expectedStatus = 200
) {
  expect(response.status).toBe(expectedStatus);
  expect(data.success).toBe(true);
  expect(data.data).toBeDefined();
}

/**
 * Assert error API response
 */
export function assertErrorResponse(
  response: Response,
  data: any,
  expectedStatus: number,
  errorMessageContains?: string
) {
  expect(response.status).toBe(expectedStatus);
  expect(data.success).toBe(false);
  expect(data.error).toBeDefined();

  if (errorMessageContains) {
    expect(data.error.message.toLowerCase()).toContain(
      errorMessageContains.toLowerCase()
    );
  }
}

/**
 * Assert pagination metadata
 */
export function assertPaginationMeta(
  data: any,
  expectedPage: number,
  expectedLimit: number
) {
  expect(data.meta).toBeDefined();
  expect(data.meta.pagination).toMatchObject({
    page: expectedPage,
    limit: expectedLimit,
    total: expect.any(Number),
    totalPages: expect.any(Number),
  });
}

/**
 * Assert response has standard meta fields
 */
export function assertStandardMeta(data: any, apiVersion = 'v1') {
  expect(data.meta).toBeDefined();
  expect(data.meta.timestamp).toBeDefined();
  expect(data.meta.requestId).toBeDefined();
  expect(data.meta.apiVersion).toBe(apiVersion);
}

/**
 * Assert audit log was created
 */
export async function assertAuditLogCreated(
  prisma: PrismaClient,
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  module: string,
  resourceId?: string
) {
  const auditLog = await prisma.auditLog.findFirst({
    where: {
      action,
      module,
      ...(resourceId && { resourceId }),
    },
    orderBy: { createdAt: 'desc' },
  });

  expect(auditLog).toBeDefined();
  expect(auditLog?.action).toBe(action);
  expect(auditLog?.module).toBe(module);

  return auditLog;
}

/**
 * Assert tenant isolation
 */
export function assertTenantIsolation(data: any[], tenantId: string) {
  if (data.length > 0) {
    expect(data.every((item: any) => item.tenantId === tenantId)).toBe(true);
  }
}

/**
 * Create test employee data
 */
export function createTestEmployeeData(overrides: any = {}) {
  return {
    employeeCode: `EMP-${crypto.randomUUID().substring(0, 8)}`,
    firstName: 'Test',
    lastName: 'Employee',
    email: `test-${crypto.randomUUID()}@example.com`,
    joiningDate: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create test company data
 */
export function createTestCompanyData(tenantId: string, overrides: any = {}) {
  return {
    name: 'Test Company',
    code: `TC-${crypto.randomUUID().substring(0, 8)}`,
    tenantId,
    ...overrides,
  };
}

/**
 * Create test department data
 */
export function createTestDepartmentData(
  companyId: string,
  tenantId: string,
  overrides: any = {}
) {
  return {
    name: 'Test Department',
    code: `TD-${crypto.randomUUID().substring(0, 8)}`,
    companyId,
    tenantId,
    ...overrides,
  };
}

/**
 * Wait for async operations (useful for rate limiting tests)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate random IP for rate limiting tests
 */
export function generateRandomIP(): string {
  return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

/**
 * Create request with custom IP
 */
export function createRequestWithIP(
  url: string,
  ip: string,
  options: ApiRequestOptions = {}
): NextRequest {
  const headers = {
    ...options.headers,
    'x-forwarded-for': ip,
  };

  return createApiRequest(url, { ...options, headers });
}

/**
 * Measure API response time
 */
export async function measureResponseTime(
  apiCall: () => Promise<Response>
): Promise<{ response: Response; executionTime: number }> {
  const start = performance.now();
  const response = await apiCall();
  const end = performance.now();

  return {
    response,
    executionTime: end - start,
  };
}

/**
 * Assert response time is acceptable
 */
export function assertResponseTime(
  executionTime: number,
  maxTime: number,
  description = 'API response'
) {
  expect(executionTime).toBeLessThan(maxTime);
  console.log(`${description} took ${executionTime.toFixed(2)}ms`);
}

/**
 * Create bulk test data
 */
export async function createBulkTestEmployees(
  prisma: PrismaClient,
  count: number,
  companyId: string,
  departmentId: string,
  tenantId: string
) {
  const employees = [];

  for (let i = 0; i < count; i++) {
    const employee = await prisma.employee.create({
      data: {
        employeeCode: `BULK-${i}-${crypto.randomUUID().substring(0, 8)}`,
        firstName: `Employee${i}`,
        lastName: `Test`,
        email: `bulk-${i}-${crypto.randomUUID()}@example.com`,
        companyId,
        departmentId,
        tenantId,
        joiningDate: new Date(),
      },
    });
    employees.push(employee);
  }

  return employees;
}

/**
 * Clean up test data by email pattern
 */
export async function cleanupTestData(
  prisma: PrismaClient,
  emailPattern: string
) {
  await prisma.employee.deleteMany({
    where: {
      email: {
        startsWith: emailPattern,
      },
    },
  });
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Assert valid UUID
 */
export function assertValidUUID(value: string, fieldName = 'ID') {
  expect(isValidUUID(value)).toBe(true);
  console.log(`${fieldName}: ${value} is a valid UUID`);
}

/**
 * Create test data with relationships
 */
export async function setupTestDataWithRelationships(
  prisma: PrismaClient,
  tenantId: string
) {
  // Create company
  const company = await prisma.company.create({
    data: createTestCompanyData(tenantId),
  });

  // Create department
  const department = await prisma.department.create({
    data: createTestDepartmentData(company.id, tenantId),
  });

  // Create employee
  const employee = await prisma.employee.create({
    data: {
      ...createTestEmployeeData(),
      companyId: company.id,
      departmentId: department.id,
      tenantId,
    },
  });

  return {
    company,
    department,
    employee,
  };
}

/**
 * Assert rate limit headers
 */
export function assertRateLimitHeaders(response: Response) {
  const headers = response.headers;

  expect(headers.get('X-RateLimit-Limit')).toBeDefined();
  expect(headers.get('X-RateLimit-Remaining')).toBeDefined();
  expect(headers.get('X-RateLimit-Reset')).toBeDefined();
}

/**
 * Test rate limiting for an endpoint
 */
export async function testRateLimit(
  endpoint: string,
  handler: (request: NextRequest) => Promise<Response>,
  limit: number,
  token: string
) {
  const ip = generateRandomIP();
  const requests = [];

  for (let i = 0; i < limit + 1; i++) {
    const request = createRequestWithIP(endpoint, ip, { token });
    requests.push(handler(request));
  }

  const responses = await Promise.all(requests);
  const lastResponse = responses[responses.length - 1];

  // Last request should be rate limited
  expect(lastResponse.status).toBe(429);

  const data = await lastResponse.json();
  expect(data.success).toBe(false);
  expect(data.error.message.toLowerCase()).toContain('rate limit');
}

/**
 * Export all utilities
 */
export default {
  createApiRequest,
  createTestAuthToken,
  extractJsonResponse,
  assertSuccessResponse,
  assertErrorResponse,
  assertPaginationMeta,
  assertStandardMeta,
  assertAuditLogCreated,
  assertTenantIsolation,
  createTestEmployeeData,
  createTestCompanyData,
  createTestDepartmentData,
  sleep,
  generateRandomIP,
  createRequestWithIP,
  measureResponseTime,
  assertResponseTime,
  createBulkTestEmployees,
  cleanupTestData,
  isValidUUID,
  assertValidUUID,
  setupTestDataWithRelationships,
  assertRateLimitHeaders,
  testRateLimit,
};
