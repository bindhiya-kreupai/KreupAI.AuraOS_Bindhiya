import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { verifyToken, generateAccessToken, JWTPayload } from '@/lib/auth/jwt';
import { validationErrorResponse } from '@/lib/validators';
import { authRateLimit } from '@/lib/middleware/rate-limit';
import { logger } from '@/lib/logger';

const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * POST /api/auth/refresh
 * Refresh access token using a valid refresh token
 */
export const POST = authRateLimit(async function (request: NextRequest) {
  try {
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    // Validate request body
    const body = await request.json();
    const { refreshToken } = RefreshTokenSchema.parse(body);

    // Verify refresh token
    let decoded: JWTPayload;
    try {
      decoded = verifyToken(refreshToken);
    } catch (error) {
      logger.warn({ ipAddress }, 'Invalid refresh token attempt');
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Invalid refresh token',
        },
        { status: 401 }
      );
    }

    // Validate token type
    if (decoded.type !== 'refresh') {
      logger.warn({
        userId: decoded.userId,
        tokenType: decoded.type
      }, 'Wrong token type used for refresh');

      return NextResponse.json(
        { success: false, error: 'Invalid token type. Expected refresh token.' },
        { status: 401 }
      );
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        status: true,
        tenantId: true,
      },
    });

    if (!user) {
      logger.warn({ userId: decoded.userId }, 'User not found during token refresh');
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }

    if (user.status !== 'Active') {
      logger.warn({
        userId: user.id,
        status: user.status
      }, 'Inactive user attempted token refresh');

      return NextResponse.json(
        { success: false, error: 'User account is not active' },
        { status: 403 }
      );
    }

    // Verify session is still active
    if (decoded.sessionId) {
      const session = await prisma.userSession.findUnique({
        where: { id: decoded.sessionId },
        select: {
          status: true,
          expiresAt: true,
        },
      });

      if (!session) {
        logger.warn({
          sessionId: decoded.sessionId
        }, 'Session not found during token refresh');

        return NextResponse.json(
          { success: false, error: 'Session not found' },
          { status: 401 }
        );
      }

      if (session.status !== 'Active') {
        logger.warn({
          sessionId: decoded.sessionId,
          status: session.status
        }, 'Inactive session during token refresh');

        return NextResponse.json(
          { success: false, error: 'Session is not active' },
          { status: 401 }
        );
      }

      // Check if session has expired
      if (session.expiresAt && session.expiresAt < new Date()) {
        logger.warn({
          sessionId: decoded.sessionId,
          expiresAt: session.expiresAt
        }, 'Expired session during token refresh');

        // Update session status to Expired
        await prisma.userSession.update({
          where: { id: decoded.sessionId },
          data: { status: 'Expired' },
        });

        return NextResponse.json(
          { success: false, error: 'Session has expired' },
          { status: 401 }
        );
      }

      // Update session last active
      await prisma.userSession.update({
        where: { id: decoded.sessionId },
        data: { lastActive: new Date() },
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      sessionId: decoded.sessionId,
    });

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'TOKEN_REFRESH',
        module: 'Authentication',
        details: `Access token refreshed from ${ipAddress}`,
        ipAddress,
      },
    });

    // Log successful token refresh
    logger.info({
      userId: user.id,
      email: user.email,
      sessionId: decoded.sessionId
    }, 'Token refresh successful');

    return NextResponse.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        user: {
          id: user.id,
          email: user.email,
          tenantId: user.tenantId,
        },
      },
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    logger.error({ error }, 'Token refresh error');
    return NextResponse.json(
      { success: false, error: 'Token refresh failed' },
      { status: 500 }
    );
  }
});
