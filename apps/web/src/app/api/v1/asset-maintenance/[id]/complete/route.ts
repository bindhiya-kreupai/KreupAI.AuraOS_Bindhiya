/**
 * @api /api/v1/asset-maintenance/:id/complete
 * @description Mark maintenance as completed
 * @project AURA HCM Platform
 */

import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { AssetService } from '@/lib/services/asset.service';

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
 * POST /api/v1/asset-maintenance/:id/complete
 * Mark maintenance as completed
 */
export const POST = withEnhancedAuth(
  async (request: NextRequest, context: any) => {
    try {
      const { id } = context.params;
      const { user } = context;
      const body = await request.json();

      await AssetService.completeMaintenance(
        id,
        user.tenantId,
        user.userId,
        body.cost
      );

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
    } catch (error) {
      console.error('[Maintenance Complete API] POST Error:', error);

      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      const errorCode = error instanceof Error && error.message.includes('not found') ? 'E3001' : 'E5001';

      const response: ApiResponse = {
        success: false,
        error: {
          code: errorCode,
          message: error instanceof Error ? error.message : 'Failed to complete maintenance',
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
