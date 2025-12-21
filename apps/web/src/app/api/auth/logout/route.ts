import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withAuth } from '@/lib/auth';

export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    // Revoke current session if sessionId is present
    if (user.sessionId) {
      await prisma.userSession.update({
        where: { id: user.sessionId },
        data: { status: 'Revoked' },
      });
    }

    // Create audit log
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'LOGOUT',
        module: 'Authentication',
        details: 'User logged out',
        ipAddress,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
});
