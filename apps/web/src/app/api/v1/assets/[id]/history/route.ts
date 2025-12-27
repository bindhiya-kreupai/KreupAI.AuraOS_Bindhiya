/**
 * @api /api/v1/assets/:id/history
 * @description Get asset assignment history
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
 * GET /api/v1/assets/:id/history
 * Get assignment history for asset
 */
export const GET = withEnhancedAuth(
  async (request: NextRequest, context: any) => {
    try {
      const { id } = context.params;
      const { user } = context;

      const history = await AssetService.getAssignmentHistory(id, user.tenantId);

      const response: ApiResponse = {
        success: true,
        data: history,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('[Asset History API] GET Error:', error);

      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch assignment history',
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
