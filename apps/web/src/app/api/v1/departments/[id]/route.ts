import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { ServiceProxy } from '@/lib/services/service-proxy';
import { z } from 'zod';

// API Response Standard
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    apiVersion: string;
  };
}

const updateDepartmentSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  parentId: z.string().uuid().optional().nullable(),
  costCenterId: z.string().uuid().optional().nullable(),
});

/**
 * GET /api/v1/departments/:id
 * Get department by ID
 */
export const GET = withEnhancedAuth(async (request: NextRequest, { params, permissions }: any) => {
  if (!permissions.includes('departments:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing departments:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const { id } = params;

    // Fetch department from microservice
    const department = await ServiceProxy.get('employee', `/departments/${id}`);

    if (!department) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E3001',
          message: 'Department not found',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: department,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('[Department API] GET Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch department',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
});

/**
 * PUT /api/v1/departments/:id
 * Update department by ID
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, { params, permissions }: any) => {
  if (!permissions.includes('departments:update')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing departments:update permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const { id } = params;
    const body = await request.json();

    // Validate request body
    const validationResult = updateDepartmentSchema.safeParse(body);
    if (!validationResult.success) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Validation failed',
          details: { errors: validationResult.error.errors },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 400 });
    }

    // Update department via microservice
    const department = await ServiceProxy.put(
      'employee',
      `/departments/${id}`,
      validationResult.data
    );

    const response: ApiResponse = {
      success: true,
      data: department,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('[Department API] PUT Error:', error);

    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E3001',
            message: error.message,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };

        return NextResponse.json(response, { status: 404 });
      }

      if (
        error.message.includes('already exists') ||
        error.message.includes('own parent') ||
        error.message.includes('Circular reference')
      ) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: error.message.includes('already exists') ? 'E3002' : 'E4001',
            message: error.message,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };

        return NextResponse.json(response, { status: 409 });
      }
    }

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to update department',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
});

/**
 * DELETE /api/v1/departments/:id
 * Delete department
 */
export const DELETE = withEnhancedAuth(
  async (request: NextRequest, { params, permissions }: any) => {
    if (!permissions.includes('departments:delete')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing departments:delete permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    try {
      const { id } = params;

      // Delete department via microservice
      await ServiceProxy.delete('employee', `/departments/${id}`);

      const response: ApiResponse = {
        success: true,
        data: null,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 204 });
    } catch (error: any) {
      console.error('[Department API] DELETE Error:', error);

      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'E3001',
              message: 'Department not found',
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
              apiVersion: 'v1',
            },
          };

          return NextResponse.json(response, { status: 404 });
        }

        if (error.message.includes('Cannot delete')) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'E4001',
              message: error.message,
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
              apiVersion: 'v1',
            },
          };

          return NextResponse.json(response, { status: 409 });
        }
      }

      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to delete department',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 500 });
    }
  }
);
