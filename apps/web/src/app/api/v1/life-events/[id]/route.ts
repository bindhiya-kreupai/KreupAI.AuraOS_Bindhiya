import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { LifeEventService } from '@/lib/services/life-event.service';
import { z } from 'zod';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = context.params;
    const { user, permissions } = context;
    if (!permissions.includes('life-events:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing life-events:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }

    const lifeEvent = await LifeEventService.findById(id, user.tenantId);

    if (!lifeEvent) {
      const response: ApiResponse = {
        success: false,
        error: { code: 'E4001', message: 'Life event not found' },
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
      data: lifeEvent,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch life event',
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

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = context.params;
    const { user, permissions } = context;
    if (!permissions.includes('life-events:update')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing life-events:update permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();

    const lifeEvent = await LifeEventService.update(id, user.tenantId, body);

    if (!lifeEvent) {
      const response: ApiResponse = {
        success: false,
        error: { code: 'E4001', message: 'Life event not found' },
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
      data: lifeEvent,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    let statusCode = 500;
    let errorCode = 'E5001';

    if (error instanceof z.ZodError) {
      statusCode = 400;
      errorCode = 'E2001';
    }

    const response: ApiResponse = {
      success: false,
      error: {
        code: errorCode,
        message: error instanceof Error ? error.message : 'Failed to update life event',
        details: error instanceof z.ZodError ? { errors: error.errors } : undefined,
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

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = context.params;
    const { user, permissions } = context;
    if (!permissions.includes('life-events:delete')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing life-events:delete permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }

    const lifeEvent = await LifeEventService.delete(id, user.tenantId);

    if (!lifeEvent) {
      const response: ApiResponse = {
        success: false,
        error: { code: 'E4001', message: 'Life event not found' },
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
      data: { message: 'Life event deleted successfully', id: lifeEvent.id },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to delete life event',
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
