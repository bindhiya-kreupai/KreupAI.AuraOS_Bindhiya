/**
 * Password Reset Token Verification Endpoint
 * Checks if a reset token is valid
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { passwordResetService } from '@/lib/auth/password-reset.service';
import { logger } from '@/lib/logger';

/**
 * GET /api/auth/password-reset/verify?token=xxx
 * Verify if a password reset token is valid
 *
 * @query token - The reset token to verify
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'Validation error',
            details: 'Token is required',
          },
        },
        { status: 400 }
      );
    }

    // Verify token
    const isValid = await passwordResetService.isTokenValid(token);

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E1002',
            message: 'Invalid or expired token',
            details: 'This password reset link is invalid or has expired',
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Token is valid',
      data: {
        valid: true,
      },
    });
  } catch (error: any) {
    logger.error({ error }, 'Error verifying password reset token');

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Internal server error',
          details: 'Error verifying token',
        },
      },
      { status: 500 }
    );
  }
}
