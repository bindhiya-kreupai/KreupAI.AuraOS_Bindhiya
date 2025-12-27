/**
 * @api /api/v1/assets/dashboard
 * @description Get asset dashboard statistics
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
 * GET /api/v1/assets/dashboard
 * Get dashboard statistics
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;

    const stats = await AssetService.getDashboardStats(user.tenantId);

    const response: ApiResponse = {
      success: true,
      data: stats,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[Asset Dashboard API] GET Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch dashboard statistics',
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
