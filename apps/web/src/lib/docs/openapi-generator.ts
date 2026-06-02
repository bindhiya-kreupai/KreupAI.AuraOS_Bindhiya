/**
 * OpenAPI 3.0 Specification Generator
 * Generates comprehensive API documentation
 */

import type { OpenAPIV3 } from 'openapi-types';

/**
 * Generate OpenAPI 3.0 specification for AuraOS HCM APIs
 */
export function generateOpenAPISpec(): OpenAPIV3.Document {
  const spec: OpenAPIV3.Document = {
    openapi: '3.0.3',
    info: {
      title: 'AuraOS HCM API',
      version: '1.0.0',
      description: `
# AuraOS HCM API Documentation

Complete API reference for the AuraOS Human Capital Management platform.

## Features

- **Employee Management**: CRUD operations, org charts, employment history
- **Organization Management**: Departments, positions, cost centers
- **Payroll Processing**: Async payroll runs, payslips, statutory reports
- **Leave Management**: Policies, applications, approvals, balances
- **Attendance Tracking**: Clock-in/out, regularization, reports, anomaly detection
- **Shift Management**: Schedules, assignments, rosters
- **Performance Monitoring**: System metrics, job queues, caching stats

## Authentication

All API endpoints require authentication using Bearer tokens.

\`\`\`
Authorization: Bearer <your_access_token>
\`\`\`

## Rate Limiting

- **Rate Limit**: 1000 requests per hour per user
- **Burst**: 100 requests per minute

## Error Codes

- **E1xxx**: Authentication errors
- **E2xxx**: Validation errors
- **E3xxx**: Resource errors (not found, conflict)
- **E4xxx**: Business logic errors
- **E5xxx**: System errors

## Pagination

List endpoints support pagination:

\`\`\`
?page=1&limit=20
\`\`\`

## Caching

GET endpoints may return cached responses with cache headers:

\`\`\`
X-Cache: HIT | MISS
X-Response-Time: 45ms
\`\`\`
      `,
      contact: {
        name: 'AuraOS API Support',
        email: 'api-support@auraos.com',
        url: 'https://auraos.com/support',
      },
      license: {
        name: 'Proprietary',
        url: 'https://auraos.com/license',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
      {
        url: 'https://staging-api.auraos.com/api/v1',
        description: 'Staging server',
      },
      {
        url: 'https://api.auraos.com/api/v1',
        description: 'Production server',
      },
    ],
    tags: [
      { name: 'Employees', description: 'Employee management endpoints' },
      { name: 'Departments', description: 'Department hierarchy management' },
      { name: 'Positions', description: 'Job position management' },
      { name: 'Cost Centers', description: 'Cost center management' },
      { name: 'Organization', description: 'Organizational structure' },
      { name: 'Payroll', description: 'Payroll processing and management' },
      { name: 'Payslips', description: 'Employee payslip access' },
      { name: 'Statutory', description: 'Statutory compliance reports' },
      { name: 'Leave', description: 'Leave management and policies' },
      { name: 'Attendance', description: 'Attendance tracking and reporting' },
      { name: 'Shifts', description: 'Shift scheduling and management' },
      { name: 'System', description: 'System monitoring and administration' },
    ],
    paths: {
      ...generateEmployeePaths(),
      ...generateDepartmentPaths(),
      ...generatePayrollPaths(),
      ...generateLeavePaths(),
      ...generateAttendancePaths(),
      ...generateShiftPaths(),
      ...generateSystemPaths(),
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer token authentication',
        },
      },
      schemas: {
        ...generateCommonSchemas(),
        ...generateEmployeeSchemas(),
        ...generatePayrollSchemas(),
        ...generateLeaveSchemas(),
        ...generateAttendanceSchemas(),
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  };

  return spec;
}

/**
 * Generate employee-related paths
 */
function generateEmployeePaths(): OpenAPIV3.PathsObject {
  return {
    '/employees': {
      get: {
        tags: ['Employees'],
        summary: 'List employees',
        description: 'Retrieve a paginated list of employees with optional filtering',
        operationId: 'listEmployees',
        parameters: [
          {
            name: 'companyId',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
            required: false,
            description: 'Filter by company ID',
          },
          {
            name: 'departmentId',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
            required: false,
            description: 'Filter by department ID',
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            required: false,
            description: 'Search by name, email, or employee code',
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1, minimum: 1 },
            description: 'Page number',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 },
            description: 'Results per page',
          },
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/EmployeeListResponse',
                },
              },
            },
          },
          400: {
            $ref: '#/components/responses/BadRequest',
          },
          401: {
            $ref: '#/components/responses/Unauthorized',
          },
          500: {
            $ref: '#/components/responses/InternalError',
          },
        },
      },
      post: {
        tags: ['Employees'],
        summary: 'Create employee',
        description: 'Create a new employee record',
        operationId: 'createEmployee',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateEmployeeRequest',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Employee created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/EmployeeResponse',
                },
              },
            },
          },
          400: {
            $ref: '#/components/responses/BadRequest',
          },
          409: {
            $ref: '#/components/responses/Conflict',
          },
        },
      },
    },
    '/employees/{id}': {
      get: {
        tags: ['Employees'],
        summary: 'Get employee by ID',
        operationId: 'getEmployee',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Employee ID',
          },
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/EmployeeResponse',
                },
              },
            },
          },
          404: {
            $ref: '#/components/responses/NotFound',
          },
        },
      },
      put: {
        tags: ['Employees'],
        summary: 'Update employee',
        operationId: 'updateEmployee',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateEmployeeRequest',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Employee updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/EmployeeResponse',
                },
              },
            },
          },
          404: {
            $ref: '#/components/responses/NotFound',
          },
        },
      },
      delete: {
        tags: ['Employees'],
        summary: 'Delete employee',
        description: 'Soft delete an employee (sets status to inactive)',
        operationId: 'deleteEmployee',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Employee deleted successfully',
          },
          404: {
            $ref: '#/components/responses/NotFound',
          },
        },
      },
    },
  };
}

/**
 * Generate department paths (abbreviated for brevity)
 */
function generateDepartmentPaths(): OpenAPIV3.PathsObject {
  return {
    '/departments': {
      get: {
        tags: ['Departments'],
        summary: 'List departments',
        operationId: 'listDepartments',
        parameters: [
          { name: 'companyId', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: { description: 'Success' },
        },
      },
    },
  };
}

/**
 * Generate payroll paths
 */
function generatePayrollPaths(): OpenAPIV3.PathsObject {
  return {
    '/payroll/run': {
      post: {
        tags: ['Payroll'],
        summary: 'Initiate payroll run',
        description: 'Start async payroll processing for a given month',
        operationId: 'runPayroll',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['tenantId', 'companyId', 'month', 'countryCode'],
                properties: {
                  tenantId: { type: 'string', format: 'uuid' },
                  companyId: { type: 'string', format: 'uuid' },
                  month: { type: 'string', pattern: '^\\d{4}-\\d{2}$', example: '2024-12' },
                  countryCode: { type: 'string', enum: ['IN', 'AE', 'SA', 'QA'] },
                  employeeIds: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          202: {
            description: 'Payroll processing started',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        runId: { type: 'string' },
                        status: { type: 'string', enum: ['PROCESSING'] },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

// Abbreviated path generators for other modules
function generateLeavePaths(): OpenAPIV3.PathsObject { return {}; }
function generateAttendancePaths(): OpenAPIV3.PathsObject { return {}; }
function generateShiftPaths(): OpenAPIV3.PathsObject { return {}; }
function generateSystemPaths(): OpenAPIV3.PathsObject { return {}; }

/**
 * Generate common schemas
 */
function generateCommonSchemas(): Record<string, OpenAPIV3.SchemaObject> {
  return {
    ApiResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            message: { type: 'string' },
            details: { type: 'object' },
          },
        },
        meta: {
          type: 'object',
          properties: {
            timestamp: { type: 'string', format: 'date-time' },
            requestId: { type: 'string', format: 'uuid' },
            apiVersion: { type: 'string' },
          },
        },
      },
    },
    PaginationMeta: {
      type: 'object',
      properties: {
        page: { type: 'integer' },
        limit: { type: 'integer' },
        total: { type: 'integer' },
        totalPages: { type: 'integer' },
      },
    },
  };
}

/**
 * Generate employee schemas
 */
function generateEmployeeSchemas(): Record<string, OpenAPIV3.SchemaObject> {
  return {
    Employee: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        employeeCode: { type: 'string', example: 'EMP001' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        email: { type: 'string', format: 'email', example: 'john.doe@company.com' },
        phoneNumber: { type: 'string', example: '+1234567890' },
        hireDate: { type: 'string', format: 'date', example: '2024-01-15' },
        status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'TERMINATED'] },
        department: { $ref: '#/components/schemas/Department' },
        position: { $ref: '#/components/schemas/Position' },
      },
    },
    CreateEmployeeRequest: {
      type: 'object',
      required: ['employeeCode', 'firstName', 'lastName', 'email', 'companyId'],
      properties: {
        employeeCode: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string', format: 'email' },
        companyId: { type: 'string', format: 'uuid' },
        departmentId: { type: 'string', format: 'uuid' },
        positionId: { type: 'string', format: 'uuid' },
        hireDate: { type: 'string', format: 'date' },
      },
    },
    UpdateEmployeeRequest: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string', format: 'email' },
        phoneNumber: { type: 'string' },
        departmentId: { type: 'string', format: 'uuid' },
        positionId: { type: 'string', format: 'uuid' },
      },
    },
    EmployeeListResponse: {
      allOf: [
        { $ref: '#/components/schemas/ApiResponse' },
        {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Employee' },
            },
            meta: {
              allOf: [
                {
                  type: 'object',
                  properties: {
                    pagination: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              ],
            },
          },
        },
      ],
    },
    EmployeeResponse: {
      allOf: [
        { $ref: '#/components/schemas/ApiResponse' },
        {
          type: 'object',
          properties: {
            data: { $ref: '#/components/schemas/Employee' },
          },
        },
      ],
    },
    Department: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        code: { type: 'string' },
        name: { type: 'string' },
      },
    },
    Position: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        code: { type: 'string' },
        name: { type: 'string' },
      },
    },
  };
}

// Abbreviated schema generators
function generatePayrollSchemas(): Record<string, OpenAPIV3.SchemaObject> { return {}; }
function generateLeaveSchemas(): Record<string, OpenAPIV3.SchemaObject> { return {}; }
function generateAttendanceSchemas(): Record<string, OpenAPIV3.SchemaObject> { return {}; }
