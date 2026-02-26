/**
 * API Test Helpers
 *
 * Higher-level helpers for testing REST API endpoints including
 * pagination assertions, validation error assertions, and authenticated
 * request builders.
 *
 * @module @aura/testing
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PaginatedResponse<T = unknown> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface APIErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  details?: ValidationError[];
}

// ---------------------------------------------------------------------------
// Pagination assertions
// ---------------------------------------------------------------------------

/**
 * Assert that a response body conforms to the AuraOS paginated response format.
 */
export function assertPagination<T>(
  body: unknown,
  expected: {
    dataLength?: number;
    total?: number;
    page?: number;
    pageSize?: number;
    hasNextPage?: boolean;
  } = {}
): asserts body is PaginatedResponse<T> {
  const b = body as PaginatedResponse<T>;

  if (!b || typeof b !== 'object') {
    throw new Error(`Expected paginated response object, got: ${typeof body}`);
  }

  if (!Array.isArray(b.data)) {
    throw new Error(`Expected response.data to be an array, got: ${typeof b.data}`);
  }

  if (!b.meta || typeof b.meta !== 'object') {
    throw new Error(`Expected response.meta object, got: ${typeof b.meta}`);
  }

  const requiredMetaFields = ['page', 'pageSize', 'total', 'totalPages', 'hasNextPage', 'hasPreviousPage'];
  for (const field of requiredMetaFields) {
    if (!(field in b.meta)) {
      throw new Error(`Missing required meta field: ${field}`);
    }
  }

  if (expected.dataLength !== undefined && b.data.length !== expected.dataLength) {
    throw new Error(
      `Expected data.length=${expected.dataLength} but got ${b.data.length}`
    );
  }

  if (expected.total !== undefined && b.meta.total !== expected.total) {
    throw new Error(
      `Expected meta.total=${expected.total} but got ${b.meta.total}`
    );
  }

  if (expected.page !== undefined && b.meta.page !== expected.page) {
    throw new Error(
      `Expected meta.page=${expected.page} but got ${b.meta.page}`
    );
  }

  if (expected.pageSize !== undefined && b.meta.pageSize !== expected.pageSize) {
    throw new Error(
      `Expected meta.pageSize=${expected.pageSize} but got ${b.meta.pageSize}`
    );
  }

  if (expected.hasNextPage !== undefined && b.meta.hasNextPage !== expected.hasNextPage) {
    throw new Error(
      `Expected meta.hasNextPage=${expected.hasNextPage} but got ${b.meta.hasNextPage}`
    );
  }
}

// ---------------------------------------------------------------------------
// Validation error assertions
// ---------------------------------------------------------------------------

/**
 * Assert that a response is a 400/422 validation error with specific field errors.
 */
export function assertValidation(
  body: unknown,
  expectedErrors: Array<{ field: string; messageContains?: string }>
): asserts body is APIErrorResponse {
  const b = body as APIErrorResponse;

  if (!b || typeof b !== 'object') {
    throw new Error(`Expected error response object, got: ${typeof body}`);
  }

  if (!Array.isArray(b.details)) {
    throw new Error(`Expected error.details to be an array`);
  }

  for (const expected of expectedErrors) {
    const found = b.details.find((d) => d.field === expected.field);
    if (!found) {
      const availableFields = b.details.map((d) => d.field).join(', ');
      throw new Error(
        `Expected validation error for field "${expected.field}" but only found errors for: ${availableFields}`
      );
    }

    if (expected.messageContains && !found.message.includes(expected.messageContains)) {
      throw new Error(
        `Expected error for field "${expected.field}" to contain "${expected.messageContains}" ` +
        `but got: "${found.message}"`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Helper to build a mock authenticated HTTP request context
// ---------------------------------------------------------------------------

export interface AuthContext {
  userId: string;
  tenantId: string;
  email: string;
  roles: string[];
  permissions: string[];
}

/**
 * Create a standard admin auth context for tests.
 */
export function createAdminAuthContext(
  overrides: Partial<AuthContext> = {}
): AuthContext {
  return {
    userId:      'admin-user-001',
    tenantId:    'tenant-test-001',
    email:       'admin@test.kreupai.com',
    roles:       ['admin', 'hr-manager'],
    permissions: ['*'],
    ...overrides,
  };
}

/**
 * Create a standard employee auth context for tests.
 */
export function createEmployeeAuthContext(
  overrides: Partial<AuthContext> = {}
): AuthContext {
  return {
    userId:      'emp-user-001',
    tenantId:    'tenant-test-001',
    email:       'employee@test.kreupai.com',
    roles:       ['employee'],
    permissions: ['profile:read', 'leave:request', 'payslip:read'],
    ...overrides,
  };
}

/**
 * Create a standard manager auth context for tests.
 */
export function createManagerAuthContext(
  overrides: Partial<AuthContext> = {}
): AuthContext {
  return {
    userId:      'mgr-user-001',
    tenantId:    'tenant-test-001',
    email:       'manager@test.kreupai.com',
    roles:       ['manager', 'employee'],
    permissions: ['leave:approve', 'team:view', 'report:read'],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Response builder helpers
// ---------------------------------------------------------------------------

/**
 * Build a standard AuraOS paginated response for use in mocks.
 */
export function buildPaginatedResponse<T>(
  data: T[],
  options: { page?: number; pageSize?: number; total?: number } = {}
): PaginatedResponse<T> {
  const page     = options.page     ?? 1;
  const pageSize = options.pageSize ?? data.length;
  const total    = options.total    ?? data.length;
  const totalPages = Math.ceil(total / pageSize);

  return {
    data,
    meta: {
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage:     page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * Build a standard AuraOS error response for use in mocks.
 */
export function buildErrorResponse(
  statusCode: number,
  error: string,
  message: string,
  details?: ValidationError[]
): APIErrorResponse {
  return { statusCode, error, message, details };
}
