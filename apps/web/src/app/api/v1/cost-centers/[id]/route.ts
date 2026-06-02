import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { costCenterService } from '@/lib/services/organization';
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

const updateCostCenterSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
});

/**
 * GET /api/v1/cost-centers/:id
 * Get cost center by ID
 */
export const GET = withEnhancedAuth(async (request: NextRequest, { params, permissions }: any) => {
  if (!permissions.includes('cost-centers:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing cost-centers:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const { id } = params;

    const costCenter = await costCenterService.findById(id);

    if (!costCenter) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E3001',
          message: 'Cost center not found',
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
      data: costCenter,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('[Cost Center API] GET Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch cost center',
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
 * PUT /api/v1/cost-centers/:id
 * Update cost center by ID
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, { params, permissions }: any) => {
  if (!permissions.includes('cost-centers:update')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing cost-centers:update permission',
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
    const validationResult = updateCostCenterSchema.safeParse(body);
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

    // Update cost center
    const costCenter = await costCenterService.update(id, validationResult.data);

    const response: ApiResponse = {
      success: true,
      data: costCenter,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('[Cost Center API] PUT Error:', error);

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

      if (error.message.includes('already exists')) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E3002',
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
        message: 'Failed to update cost center',
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
 * DELETE /api/v1/cost-centers/:id
 * Delete cost center
 */
export const DELETE = withEnhancedAuth(
  async (request: NextRequest, { params, permissions }: any) => {
    if (!permissions.includes('cost-centers:delete')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing cost-centers:delete permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    try {
      const { id } = params;

      await costCenterService.delete(id);

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
      console.error('[Cost Center API] DELETE Error:', error);

      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'E3001',
              message: 'Cost center not found',
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
          message: 'Failed to delete cost center',
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
