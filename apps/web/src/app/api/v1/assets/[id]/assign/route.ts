/**
 * @api /api/v1/assets/:id/assign
 * @description Assign asset to employee
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
 * POST /api/v1/assets/:id/assign
 * Assign asset to employee
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = context.params;
    const { user, permissions } = context;
    if (!permissions.includes('assets:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing assets:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();

    // Add assignedBy from authenticated user
    body.assignedBy = user.userId;

    const assignment = await AssetService.assignAsset(id, user.tenantId, body);

    const response: ApiResponse = {
      success: true,
      data: assignment,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('[Asset Assign API] POST Error:', error);

    let statusCode = 500;
    let errorCode = 'E5001';

    if (error instanceof z.ZodError) {
      statusCode = 400;
      errorCode = 'E2001';
    } else if (error instanceof Error) {
      if (error.message.includes('not found')) {
        statusCode = 404;
        errorCode = 'E3001';
      } else if (
        error.message.includes('not available') ||
        error.message.includes('already assigned')
      ) {
        statusCode = 409;
        errorCode = 'E3003';
      }
    }

    const response: ApiResponse = {
      success: false,
      error: {
        code: errorCode,
        message: error instanceof Error ? error.message : 'Failed to assign asset',
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
