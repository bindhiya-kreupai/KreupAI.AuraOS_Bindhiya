/**
 * @api /api/v1/asset-maintenance
 * @description Asset Maintenance Management APIs
 * @project AURA HCM Platform
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { AssetService } from '@/lib/services/asset.service';
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

/**
 * GET /api/v1/asset-maintenance
 * Get upcoming maintenance records
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('asset-maintenance:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing asset-maintenance:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);

    const daysAhead = parseInt(searchParams.get('daysAhead') || '30');

    const maintenances = await AssetService.getUpcomingMaintenance(user.tenantId, daysAhead);

    const response: ApiResponse = {
      success: true,
      data: maintenances,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('[Asset Maintenance API] GET Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch maintenance records',
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
 * POST /api/v1/asset-maintenance
 * Schedule new maintenance
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('asset-maintenance:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing asset-maintenance:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();

    // Add tenant context
    body.tenantId = user.tenantId;

    const maintenance = await AssetService.scheduleMaintenance(body);

    const response: ApiResponse = {
      success: true,
      data: maintenance,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('[Asset Maintenance API] POST Error:', error);

    let statusCode = 500;
    let errorCode = 'E5001';

    if (error instanceof z.ZodError) {
      statusCode = 400;
      errorCode = 'E2001';
    } else if (error instanceof Error && error.message.includes('not found')) {
      statusCode = 404;
      errorCode = 'E3001';
    }

    const response: ApiResponse = {
      success: false,
      error: {
        code: errorCode,
        message: error instanceof Error ? error.message : 'Failed to schedule maintenance',
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
