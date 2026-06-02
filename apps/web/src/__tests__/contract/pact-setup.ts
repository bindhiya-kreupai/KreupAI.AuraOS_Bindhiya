/**
 * Pact Setup Configuration
 * Week 15-16: Contract Testing & API Testing
 *
 * Configures Pact for consumer-driven contract testing
 */

import { Pact } from '@pact-foundation/pact';
import { MatchersV3, SpecificationVersion } from '@pact-foundation/pact';
import path from 'path';

const { like, eachLike, integer, string, iso8601DateTime, boolean, uuid } = MatchersV3;

/**
 * Common matchers for API responses
 */
export const commonMatchers = {
  // Standard fields
  id: integer(),
  uuid: uuid(),
  createdAt: iso8601DateTime(),
  updatedAt: iso8601DateTime(),

  // Common employee fields
  employeeId: string('EMP001'),
  firstName: string('John'),
  lastName: string('Doe'),
  email: string('john.doe@example.com'),

  // Status fields
  status: string('active'),
  isActive: boolean(true),

  // Pagination
  page: integer(1),
  limit: integer(10),
  total: integer(100),
  totalPages: integer(10),
};

/**
 * Create Pact provider for Employee API
 */
export function createEmployeeApiProvider(): Pact {
  return new Pact({
    consumer: 'web-client',
    provider: 'employee-service',
    port: 8001,
    log: path.resolve(process.cwd(), 'pacts', 'logs', 'employee-api.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'info',
    spec: SpecificationVersion.SPECIFICATION_VERSION_V3,
    cors: true,
  });
}

/**
 * Create Pact provider for Payroll API
 */
export function createPayrollApiProvider(): Pact {
  return new Pact({
    consumer: 'web-client',
    provider: 'payroll-service',
    port: 8002,
    log: path.resolve(process.cwd(), 'pacts', 'logs', 'payroll-api.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'info',
    spec: SpecificationVersion.SPECIFICATION_VERSION_V3,
    cors: true,
  });
}

/**
 * Create Pact provider for Leave API
 */
export function createLeaveApiProvider(): Pact {
  return new Pact({
    consumer: 'web-client',
    provider: 'leave-service',
    port: 8003,
    log: path.resolve(process.cwd(), 'pacts', 'logs', 'leave-api.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'info',
    spec: SpecificationVersion.SPECIFICATION_VERSION_V3,
    cors: true,
  });
}

/**
 * Create Pact provider for Attendance API
 */
export function createAttendanceApiProvider(): Pact {
  return new Pact({
    consumer: 'web-client',
    provider: 'attendance-service',
    port: 8004,
    log: path.resolve(process.cwd(), 'pacts', 'logs', 'attendance-api.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'info',
    spec: SpecificationVersion.SPECIFICATION_VERSION_V3,
    cors: true,
  });
}

/**
 * Standard response matchers
 */
export const responseMatchers = {
  /**
   * Success response (200 OK)
   */
  success: (data: any) => ({
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: {
      success: boolean(true),
      data,
      message: like('Success'),
    },
  }),

  /**
   * Created response (201 Created)
   */
  created: (data: any) => ({
    status: 201,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: {
      success: boolean(true),
      data,
      message: like('Resource created successfully'),
    },
  }),

  /**
   * No content response (204 No Content)
   */
  noContent: () => ({
    status: 204,
    headers: {},
    body: '',
  }),

  /**
   * Bad request response (400 Bad Request)
   */
  badRequest: (errors: any) => ({
    status: 400,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: {
      success: boolean(false),
      error: {
        code: string('VALIDATION_ERROR'),
        message: like('Validation failed'),
        errors,
      },
    },
  }),

  /**
   * Unauthorized response (401 Unauthorized)
   */
  unauthorized: () => ({
    status: 401,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: {
      success: boolean(false),
      error: {
        code: string('UNAUTHORIZED'),
        message: like('Authentication required'),
      },
    },
  }),

  /**
   * Forbidden response (403 Forbidden)
   */
  forbidden: () => ({
    status: 403,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: {
      success: boolean(false),
      error: {
        code: string('FORBIDDEN'),
        message: like('Insufficient permissions'),
      },
    },
  }),

  /**
   * Not found response (404 Not Found)
   */
  notFound: () => ({
    status: 404,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: {
      success: boolean(false),
      error: {
        code: string('NOT_FOUND'),
        message: like('Resource not found'),
      },
    },
  }),

  /**
   * Server error response (500 Internal Server Error)
   */
  serverError: () => ({
    status: 500,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: {
      success: boolean(false),
      error: {
        code: string('INTERNAL_ERROR'),
        message: like('Internal server error'),
      },
    },
  }),

  /**
   * Paginated list response
   */
  paginatedList: (items: any) => ({
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: {
      success: boolean(true),
      data: {
        items: eachLike(items),
        pagination: {
          page: integer(1),
          limit: integer(10),
          total: integer(100),
          totalPages: integer(10),
          hasNext: boolean(true),
          hasPrev: boolean(false),
        },
      },
      message: like('Success'),
    },
  }),
};

/**
 * Common request matchers
 */
export const requestMatchers = {
  /**
   * Authorization header
   */
  authHeader: (token: string = 'Bearer eyJhbGc...') => ({
    Authorization: like(token),
  }),

  /**
   * Content-Type header for JSON
   */
  jsonContentType: () => ({
    'Content-Type': 'application/json; charset=utf-8',
  }),

  /**
   * Pagination query parameters
   */
  paginationQuery: () => ({
    page: like('1'),
    limit: like('10'),
  }),

  /**
   * Search query parameter
   */
  searchQuery: (searchTerm: string = 'test') => ({
    search: like(searchTerm),
  }),

  /**
   * Filter query parameters
   */
  filterQuery: (filters: Record<string, string>) => {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(filters)) {
      result[key] = like(value);
    }
    return result;
  },
};

/**
 * Employee matchers
 */
export const employeeMatchers = {
  /**
   * Single employee
   */
  employee: () => ({
    id: integer(),
    employeeId: string('EMP001'),
    firstName: string('John'),
    lastName: string('Doe'),
    email: string('john.doe@example.com'),
    phoneNumber: string('+1234567890'),
    dateOfBirth: iso8601DateTime('1990-01-15'),
    gender: string('Male'),
    maritalStatus: string('Single'),
    nationality: string('US'),
    department: like({
      id: integer(),
      name: string('Engineering'),
      code: string('ENG'),
    }),
    position: like({
      id: integer(),
      title: string('Software Engineer'),
      code: string('SE'),
    }),
    employmentType: string('Full-time'),
    employmentStatus: string('Active'),
    joiningDate: iso8601DateTime('2020-01-01'),
    reportingManager: like({
      id: integer(),
      employeeId: string('EMP002'),
      firstName: string('Jane'),
      lastName: string('Smith'),
    }),
    createdAt: iso8601DateTime(),
    updatedAt: iso8601DateTime(),
  }),

  /**
   * Employee list item
   */
  employeeListItem: () => ({
    id: integer(),
    employeeId: string('EMP001'),
    firstName: string('John'),
    lastName: string('Doe'),
    email: string('john.doe@example.com'),
    department: string('Engineering'),
    position: string('Software Engineer'),
    employmentStatus: string('Active'),
  }),

  /**
   * Create employee request
   */
  createEmployeeRequest: () => ({
    firstName: string('John'),
    lastName: string('Doe'),
    email: string('john.doe@example.com'),
    phoneNumber: string('+1234567890'),
    dateOfBirth: string('1990-01-15'),
    gender: string('Male'),
    departmentId: integer(),
    positionId: integer(),
    employmentType: string('Full-time'),
    joiningDate: string('2020-01-01'),
  }),
};

/**
 * Payroll matchers
 */
export const payrollMatchers = {
  /**
   * Payslip
   */
  payslip: () => ({
    id: integer(),
    employeeId: integer(),
    month: string('2024-01'),
    basicSalary: integer(50000),
    allowances: integer(10000),
    deductions: integer(5000),
    netSalary: integer(55000),
    status: string('Processed'),
    processedAt: iso8601DateTime(),
    paidAt: iso8601DateTime(),
    createdAt: iso8601DateTime(),
    updatedAt: iso8601DateTime(),
  }),

  /**
   * Payroll run
   */
  payrollRun: () => ({
    id: integer(),
    month: string('2024-01'),
    status: string('Completed'),
    totalEmployees: integer(100),
    processedEmployees: integer(100),
    totalGrossSalary: integer(5000000),
    totalNetSalary: integer(4500000),
    startedAt: iso8601DateTime(),
    completedAt: iso8601DateTime(),
    createdAt: iso8601DateTime(),
    updatedAt: iso8601DateTime(),
  }),
};

/**
 * Leave matchers
 */
export const leaveMatchers = {
  /**
   * Leave application
   */
  leaveApplication: () => ({
    id: integer(),
    employeeId: integer(),
    leaveType: string('Annual Leave'),
    startDate: iso8601DateTime('2024-02-01'),
    endDate: iso8601DateTime('2024-02-05'),
    numberOfDays: integer(5),
    reason: string('Personal vacation'),
    status: string('Pending'),
    appliedAt: iso8601DateTime(),
    approvedBy: integer(),
    approvedAt: iso8601DateTime(),
    createdAt: iso8601DateTime(),
    updatedAt: iso8601DateTime(),
  }),

  /**
   * Leave balance
   */
  leaveBalance: () => ({
    employeeId: integer(),
    leaveType: string('Annual Leave'),
    totalDays: integer(20),
    usedDays: integer(5),
    remainingDays: integer(15),
    year: integer(2024),
  }),
};

/**
 * Attendance matchers
 */
export const attendanceMatchers = {
  /**
   * Attendance record
   */
  attendanceRecord: () => ({
    id: integer(),
    employeeId: integer(),
    date: iso8601DateTime('2024-01-15'),
    clockIn: iso8601DateTime('2024-01-15T09:00:00Z'),
    clockOut: iso8601DateTime('2024-01-15T18:00:00Z'),
    workHours: integer(9),
    status: string('Present'),
    createdAt: iso8601DateTime(),
    updatedAt: iso8601DateTime(),
  }),

  /**
   * Attendance summary
   */
  attendanceSummary: () => ({
    employeeId: integer(),
    month: string('2024-01'),
    totalWorkingDays: integer(22),
    presentDays: integer(20),
    absentDays: integer(2),
    lateDays: integer(1),
    totalWorkHours: integer(180),
    averageWorkHours: integer(9),
  }),
};

/**
 * Helper to setup provider state
 */
export async function setupProviderState(state: string, params?: any) {
  // This would communicate with the provider's state setup endpoint
  // Implementation depends on your provider's state management
  console.log(`Setting up provider state: ${state}`, params);
}

/**
 * Helper to cleanup after tests
 */
export async function cleanupPactTests(provider: Pact) {
  await provider.finalize();
}
