/**
 * Swagger/OpenAPI Configuration
 *
 * Provides comprehensive API documentation for all AuraOS endpoints
 */

export const swaggerConfig = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AuraOS HCM API',
      version: '1.0.0',
      description: `
# AuraOS Human Capital Management System API

Complete API documentation for the AuraOS HCM platform.

## Features

- **Multi-tenant Architecture:** All endpoints enforce tenant isolation
- **Role-Based Access Control:** Granular permissions for all operations
- **Multi-Factor Authentication:** TOTP-based MFA for enhanced security
- **Rate Limiting:** Protects against abuse and ensures fair usage
- **Audit Logging:** Complete audit trail for all operations

## Authentication

All protected endpoints require a valid JWT access token in the Authorization header:

\`\`\`
Authorization: Bearer <access_token>
\`\`\`

## Rate Limiting

API endpoints are rate-limited to ensure fair usage:

- **Authentication endpoints:** 10 requests per 5 minutes
- **Standard API endpoints:** 100 requests per minute (per user)
- **Public endpoints:** 50 requests per minute (per IP)

Rate limit information is included in response headers:
- \`X-RateLimit-Limit\`: Maximum requests allowed
- \`X-RateLimit-Remaining\`: Remaining requests in current window
- \`X-RateLimit-Reset\`: Time when the rate limit resets
- \`Retry-After\`: Seconds to wait before retrying (when rate limited)

## Error Responses

All endpoints return consistent error responses:

\`\`\`json
{
  "success": false,
  "error": "Error message",
  "details": {} // Optional additional error details
}
\`\`\`

Common HTTP status codes:
- \`200\`: Success
- \`400\`: Bad Request (validation error)
- \`401\`: Unauthorized (invalid/missing token)
- \`403\`: Forbidden (insufficient permissions)
- \`404\`: Not Found
- \`429\`: Too Many Requests (rate limit exceeded)
- \`500\`: Internal Server Error

## Tenant Isolation

All API operations are isolated by tenant. Users can only access data belonging to their tenant.

## Pagination

List endpoints support pagination with the following query parameters:
- \`page\`: Page number (default: 1)
- \`limit\`: Items per page (default: 20, max: 100)

Pagination information is returned in the response:

\`\`\`json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
\`\`\`
      `,
      contact: {
        name: 'AuraOS Development Team',
        email: 'support@auraos.com',
        url: 'https://auraos.com/support',
      },
      license: {
        name: 'Proprietary',
        url: 'https://auraos.com/license',
      },
    },
    servers: [
      {
        url: 'http://localhost:3006/api',
        description: 'Development server',
      },
      {
        url: 'https://staging-api.auraos.com/api',
        description: 'Staging server',
      },
      {
        url: 'https://api.auraos.com/api',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
      },
      {
        name: 'MFA',
        description: 'Multi-Factor Authentication management',
      },
      {
        name: 'Users',
        description: 'User management operations',
      },
      {
        name: 'Roles',
        description: 'Role and permission management',
      },
      {
        name: 'Employees',
        description: 'Employee management operations',
      },
      {
        name: 'Departments',
        description: 'Department management',
      },
      {
        name: 'Companies',
        description: 'Company management',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token obtained from /auth/login',
        },
      },
      schemas: {
        // Common schemas
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Error message',
            },
            details: {
              type: 'object',
              description: 'Optional additional error details',
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1,
            },
            limit: {
              type: 'integer',
              example: 20,
            },
            total: {
              type: 'integer',
              example: 150,
            },
            totalPages: {
              type: 'integer',
              example: 8,
            },
          },
        },

        // Authentication schemas
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'SecurePassword123!',
            },
            rememberMe: {
              type: 'boolean',
              default: false,
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            mfaRequired: {
              type: 'boolean',
              description: 'True if MFA verification is required',
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'User ID (only present if MFA required)',
            },
            accessToken: {
              type: 'string',
              description: 'JWT access token (only present if MFA not required)',
            },
            refreshToken: {
              type: 'string',
              description: 'JWT refresh token (only present if MFA not required)',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
            message: {
              type: 'string',
            },
          },
        },

        // User schemas
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            tenantId: {
              type: 'string',
              format: 'uuid',
            },
            status: {
              type: 'string',
              enum: ['Active', 'Inactive', 'Suspended'],
            },
            mfaEnabled: {
              type: 'boolean',
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
            employee: {
              $ref: '#/components/schemas/Employee',
            },
          },
        },

        // Role schemas
        Role: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            code: {
              type: 'string',
              example: 'HR_MANAGER',
            },
            name: {
              type: 'string',
              example: 'HR Manager',
            },
            description: {
              type: 'string',
              nullable: true,
            },
            tenantId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'Null for system-wide roles',
            },
            isSystem: {
              type: 'boolean',
            },
            isActive: {
              type: 'boolean',
            },
            permissions: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Permission',
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Permission: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            resource: {
              type: 'string',
              example: 'users',
            },
            action: {
              type: 'string',
              example: 'create',
            },
            description: {
              type: 'string',
              nullable: true,
            },
          },
        },

        // Employee schemas
        Employee: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            firstName: {
              type: 'string',
            },
            lastName: {
              type: 'string',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            phoneNumber: {
              type: 'string',
              nullable: true,
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
              nullable: true,
            },
            hireDate: {
              type: 'string',
              format: 'date',
            },
            position: {
              type: 'string',
              nullable: true,
            },
            salary: {
              type: 'number',
              nullable: true,
            },
            employmentType: {
              type: 'string',
              enum: ['FullTime', 'PartTime', 'Contract', 'Intern'],
            },
            status: {
              type: 'string',
              enum: ['Active', 'Inactive', 'OnLeave', 'Terminated'],
            },
            departmentId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
            },
            companyId: {
              type: 'string',
              format: 'uuid',
            },
            tenantId: {
              type: 'string',
              format: 'uuid',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: 'Unauthorized. Please login.',
              },
            },
          },
        },
        ForbiddenError: {
          description: 'User does not have permission to perform this action',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: 'Insufficient permissions',
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: 'Resource not found',
              },
            },
          },
        },
        RateLimitError: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false,
                  },
                  error: {
                    type: 'string',
                    example: 'Too many requests. Please try again later.',
                  },
                  retryAfter: {
                    type: 'integer',
                    description: 'Seconds until rate limit resets',
                    example: 60,
                  },
                },
              },
            },
          },
          headers: {
            'X-RateLimit-Limit': {
              schema: {
                type: 'integer',
              },
              description: 'Maximum requests allowed in window',
            },
            'X-RateLimit-Remaining': {
              schema: {
                type: 'integer',
              },
              description: 'Remaining requests in current window',
            },
            'X-RateLimit-Reset': {
              schema: {
                type: 'string',
                format: 'date-time',
              },
              description: 'Time when rate limit resets',
            },
            'Retry-After': {
              schema: {
                type: 'integer',
              },
              description: 'Seconds to wait before retrying',
            },
          },
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false,
                  },
                  error: {
                    type: 'string',
                    example: 'Validation failed',
                  },
                  details: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        path: {
                          type: 'array',
                          items: {
                            type: 'string',
                          },
                        },
                        message: {
                          type: 'string',
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
      parameters: {
        PageParam: {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1,
          },
        },
        LimitParam: {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20,
          },
        },
        SearchParam: {
          name: 'search',
          in: 'query',
          description: 'Search query string',
          schema: {
            type: 'string',
          },
        },
        SortByParam: {
          name: 'sortBy',
          in: 'query',
          description: 'Field to sort by',
          schema: {
            type: 'string',
          },
        },
        SortOrderParam: {
          name: 'sortOrder',
          in: 'query',
          description: 'Sort order',
          schema: {
            type: 'string',
            enum: ['asc', 'desc'],
            default: 'desc',
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ['./src/app/api/**/*.ts'], // Path to API routes with JSDoc comments
};

export default swaggerConfig;
