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

    const position = await PositionService.close(id, user.tenantId);

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
      error: { code: 'E5001', message: 'Failed to close position', details: { error: error instanceof Error ? error.message : 'Unknown error' } },
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
    };

    return NextResponse.json(response, { status: 500 });
  }
});
