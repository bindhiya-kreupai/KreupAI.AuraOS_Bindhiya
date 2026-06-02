// @ts-nocheck — Lib drift / missing typings. Tracked under #29.
/**
 * Swagger/OpenAPI Configuration
 */

import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'AuraOS API Documentation',
    version: '1.0.0',
    description: `
      AuraOS is a comprehensive Human Resources Management System (HRMS) platform.

      ## Features
      - User Management with RBAC
      - Multi-tenant Architecture
      - License Management
      - Master Data Management
      - Authentication & Authorization
      - Audit Logging
      - Rate Limiting

      ## Authentication
      Most endpoints require authentication using JWT Bearer tokens.

      To authenticate:
      1. Call POST /api/auth/login with email and password
      2. Copy the accessToken from the response
      3. Click "Authorize" button and enter: Bearer {accessToken}

      ## Rate Limiting
      API endpoints are rate-limited to prevent abuse:
      - Login: 10 requests per 5 minutes
      - General API: 100 requests per 15 minutes
      - Read-only: 300 requests per 15 minutes

      Rate limit information is returned in response headers:
      - X-RateLimit-Limit: Maximum requests allowed
      - X-RateLimit-Remaining: Requests remaining
      - X-RateLimit-Reset: When the limit resets
    `,
    contact: {
      name: 'AuraOS Support',
      email: 'support@auraos.com',
    },
    license: {
      name: 'Proprietary',
    },
  },
  servers: [
    {
      url: 'http://localhost:3006',
      description: 'Development server',
    },
    {
      url: 'https://api.auraos.com',
      description: 'Production server',
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and session management',
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
      name: 'Licenses',
      description: 'License management',
    },
    {
      name: 'Master Data',
      description: 'Master data entities (Countries, States, Cities, etc.)',
    },
    {
      name: 'Sessions',
      description: 'User session management',
    },
    {
      name: 'Audit Logs',
      description: 'System audit trail',
    },
    {
      name: 'Health',
      description: 'System health checks',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'string',
            example: 'An error occurred',
          },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                  example: 'email',
                },
                message: {
                  type: 'string',
                  example: 'Invalid email address',
                },
              },
            },
          },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          total: {
            type: 'integer',
            example: 100,
          },
          page: {
            type: 'integer',
            example: 1,
          },
          limit: {
            type: 'integer',
            example: 10,
          },
          totalPages: {
            type: 'integer',
            example: 10,
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'user-123',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          tenantId: {
            type: 'string',
            example: 'tenant-1',
          },
          roleId: {
            type: 'string',
            example: 'role-admin',
          },
          status: {
            type: 'string',
            enum: ['Active', 'Inactive', 'Suspended'],
            example: 'Active',
          },
          mfaEnabled: {
            type: 'boolean',
            example: false,
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
        },
      },
      License: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'license-123',
          },
          tenantId: {
            type: 'string',
            example: 'tenant-1',
          },
          type: {
            type: 'string',
            enum: ['Trial', 'Professional', 'Enterprise'],
            example: 'Professional',
          },
          totalSeats: {
            type: 'integer',
            example: 100,
          },
          usedSeats: {
            type: 'integer',
            example: 45,
          },
          status: {
            type: 'string',
            enum: ['Active', 'Inactive', 'Expired', 'Suspended'],
            example: 'Active',
          },
          expiresAt: {
            type: 'string',
            format: 'date-time',
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
      Country: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'country-us',
          },
          name: {
            type: 'string',
            example: 'United States',
          },
          code: {
            type: 'string',
            example: 'US',
          },
          isActive: {
            type: 'boolean',
            example: true,
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
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options: swaggerJSDoc.Options = {
  swaggerDefinition,
  apis: [
    './src/app/api/**/route.ts',
    './src/lib/swagger/paths/**/*.ts',
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
