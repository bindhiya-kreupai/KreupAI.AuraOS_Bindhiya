import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { PositionService } from '@/lib/services/position.service';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = context.params;
    const { user } = context;

    const position = await PositionService.approve(id, user.tenantId, user.userId);

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
    let message = 'Failed to approve position';

    if (error instanceof Error && error.message.includes('Only DRAFT positions')) {
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
