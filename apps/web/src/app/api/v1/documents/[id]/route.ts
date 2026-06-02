/**
 * @api /api/v1/documents/:id
 * @description Individual document operations (GET, PUT, DELETE)
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
 * GET /api/v1/documents/:id
 * Get document by ID with version history
 */
export const GET = withEnhancedAuth(async (request: NextRequest, { params, permissions }: any) => {
  if (!permissions.includes('documents:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing documents:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const { id } = params;
    const { user } = (request as any).context;

    // Fetch document from microservice
    const document = await ServiceProxy.get('document', `/documents/${id}`, {
      tenantId: user.tenantId,
    });

    if (!document) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E3001',
          message: 'Document not found',
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
      data: document,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('[Document API] GET Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch document',
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
 * PUT /api/v1/documents/:id
 * Update document by ID
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, { params, permissions }: any) => {
  if (!permissions.includes('documents:update')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing documents:update permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const { id } = params;
    const { user } = (request as any).context;
    const body = await request.json();

    // Update document via microservice
    const document = await ServiceProxy.put('document', `/documents/${id}`, {
      ...body,
      tenantId: user.tenantId,
    });

    const response: ApiResponse = {
      success: true,
      data: document,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('[Document API] PUT Error:', error);

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
        message: error instanceof Error ? error.message : 'Failed to update document',
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
 * DELETE /api/v1/documents/:id
 * Soft delete document
 */
export const DELETE = withEnhancedAuth(
  async (request: NextRequest, { params, permissions }: any) => {
    if (!permissions.includes('documents:delete')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing documents:delete permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    try {
      const { id } = params;
      const { user } = (request as any).context;

      // Soft delete document via microservice
      await ServiceProxy.delete('document', `/documents/${id}?tenantId=${user.tenantId}`);

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
      console.error('[Document API] DELETE Error:', error);

      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      const errorCode =
        error instanceof Error && error.message.includes('not found') ? 'E3001' : 'E5001';

      const response: ApiResponse = {
        success: false,
        error: {
          code: errorCode,
          message: error instanceof Error ? error.message : 'Failed to delete document',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: statusCode });
    }
  }
);
