import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * POST /api/auth/logout
 * Logout user and revoke current session
 */
export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    // Revoke current session if sessionId is present
    if (user.sessionId) {
      await prisma.userSession.update({
        where: { id: user.sessionId },
        data: {
          status: 'Revoked',
          lastActive: new Date(),
        },
      });

      logger.info({
        userId: user.userId,
        sessionId: user.sessionId,
        ipAddress
      }, 'Session revoked during logout');
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'LOGOUT',
        module: 'Authentication',
        details: `User logged out from ${ipAddress}`,
        ipAddress,
      },
    });

    logger.info({
      userId: user.userId,
      email: user.email,
      ipAddress
    }, 'User logout successful');

    return NextResponse.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    logger.error({
      error,
      userId: user.userId
    }, 'Logout error');

    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
});
