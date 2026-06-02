/**
 * @api /api/v1/assets/:id
 * @description Individual asset operations (GET, PUT, DELETE)
 * @project AURA HCM Platform
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { ServiceProxy } from '@/lib/services/service-proxy';

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

/**
 * GET /api/v1/assets/:id
 * Get asset by ID with full details
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = context.params;
    const { user, permissions } = context;
    if (!permissions.includes('assets:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing assets:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }

    // Fetch asset from microservice
    const asset = await ServiceProxy.get('employee', `/assets/${id}`, { tenantId: user.tenantId });

    if (!asset) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E3001',
          message: 'Asset not found',
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
      data: asset,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('[Asset API] GET Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch asset',
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
 * PUT /api/v1/assets/:id
 * Update asset by ID
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = context.params;
    const { user, permissions } = context;
    if (!permissions.includes('assets:update')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing assets:update permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();

    // Update asset via microservice
    const asset = await ServiceProxy.put('employee', `/assets/${id}`, {
      ...body,
      tenantId: user.tenantId,
    });

    const response: ApiResponse = {
      success: true,
      data: asset,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('[Asset API] PUT Error:', error);

    let statusCode = 500;
    let errorCode = 'E5001';

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        statusCode = 404;
        errorCode = 'E3001';
      } else if (error.message.includes('already exists')) {
        statusCode = 409;
        errorCode = 'E3002';
      }
    }

    const response: ApiResponse = {
      success: false,
      error: {
        code: errorCode,
        message: error instanceof Error ? error.message : 'Failed to update asset',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: statusCode });
  }
});

/**
 * DELETE /api/v1/assets/:id
 * Soft delete asset (set status to DISPOSED)
 */
export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = context.params;
    const { user, permissions } = context;
    if (!permissions.includes('assets:delete')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing assets:delete permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }

    // Soft delete asset via microservice
    await ServiceProxy.delete('employee', `/assets/${id}?tenantId=${user.tenantId}`);

    const response: ApiResponse = {
      success: true,
      data: null,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('[Asset API] DELETE Error:', error);

    const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
    const errorCode =
      error instanceof Error && error.message.includes('not found') ? 'E3001' : 'E5001';

    const response: ApiResponse = {
      success: false,
      error: {
        code: errorCode,
        message: error instanceof Error ? error.message : 'Failed to delete asset',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: statusCode });
  }
});
