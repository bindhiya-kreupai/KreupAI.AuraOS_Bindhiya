/**
 * CSRF Token Endpoint
 * Provides CSRF tokens for authenticated users
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { sessionService } from '@/lib/auth/session.service';
import { generateCSRFToken } from '@/lib/middleware/csrf.middleware';
import { logger } from '@/lib/logger';

/**
 * GET /api/auth/csrf-token
 * Get a CSRF token for the current session
 *
 * @headers Authorization: Bearer token OR Cookie: accessToken
 * @returns CSRF token
 */
export async function GET(request: NextRequest) {
  try {
    // Get access token from cookie
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E1001',
            message: 'Authentication required',
            details: 'No access token provided',
          },
        },
        { status: 401 }
      );
    }

    // Verify token
    const sessionData = await sessionService.verifyAccessToken(accessToken);

    if (!sessionData) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E1002',
            message: 'Invalid or expired session',
            details: 'Please log in again',
          },
        },
        { status: 401 }
      );
    }

    // Generate CSRF token
    const csrfToken = await generateCSRFToken(sessionData.userId);

    logger.info({ userId: sessionData.userId }, 'CSRF token generated for user');

    return NextResponse.json({
      success: true,
      data: {
        csrfToken,
        expiresIn: 3600, // 1 hour
      },
      message: 'CSRF token generated successfully',
    });
  } catch (error: any) {
    logger.error({ error }, 'Error generating CSRF token');

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Internal server error',
          details: 'Error generating CSRF token',
        },
      },
      { status: 500 }
    );
  }
}
