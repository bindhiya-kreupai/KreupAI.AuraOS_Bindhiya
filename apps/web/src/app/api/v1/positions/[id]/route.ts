import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { PositionService } from '@/lib/services/position.service';
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
    const { user } = context;

    const position = await PositionService.findById(id, user.tenantId);

    if (!position) {
      const response: ApiResponse = {
        success: false,
        error: { code: 'E4001', message: 'Position not found' },
        meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: position,
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: { code: 'E5001', message: 'Failed to fetch position', details: { error: error instanceof Error ? error.message : 'Unknown error' } },
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
    };
    return NextResponse.json(response, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = context.params;
    const { user } = context;
    const body = await request.json();

    const position = await PositionService.update(id, user.tenantId, body);

    if (!position) {
      const response: ApiResponse = {
        success: false,
        error: { code: 'E4001', message: 'Position not found' },
        meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: position,
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    let statusCode = 500;
    let errorCode = 'E5001';

    if (error instanceof z.ZodError) {
      statusCode = 400;
      errorCode = 'E2001';
    }

    const response: ApiResponse = {
      success: false,
      error: { code: errorCode, message: error instanceof Error ? error.message : 'Failed to update position', details: error instanceof z.ZodError ? { errors: error.errors } : undefined },
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
    };

    return NextResponse.json(response, { status: statusCode });
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = context.params;
    const { user } = context;

    const position = await PositionService.delete(id, user.tenantId);

    if (!position) {
      const response: ApiResponse = {
        success: false,
        error: { code: 'E4001', message: 'Position not found' },
        meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: { message: 'Position deleted successfully', id: position.id },
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    let statusCode = 500;
    let errorCode = 'E5001';
    let message = 'Failed to delete position';

    if (error instanceof Error && error.message.includes('has employees')) {
      statusCode = 400;
      errorCode = 'E3001';
      message = error.message;
    }

    const response: ApiResponse = {
      success: false,
      error: { code: errorCode, message, details: { error: error instanceof Error ? error.message : 'Unknown error' } },
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
    };

    return NextResponse.json(response, { status: statusCode });
  }
});
