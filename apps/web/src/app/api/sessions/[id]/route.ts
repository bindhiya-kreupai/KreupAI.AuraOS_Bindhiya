import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// DELETE - Revoke a session
export const DELETE = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: { params: { id: string } }) => {
    try {
      // Check permission
      const permissionError = requirePermission(Resource.SESSIONS, Action.DELETE, permissions);
      if (permissionError) return permissionError;

      const sessionId = params.id;

      // Fetch session
      const session = await prisma.userSession.findUnique({
        where: { id: sessionId },
        select: { id: true, userId: true, status: true },
      });

      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Session not found' },
          { status: 404 }
        );
      }

      // Check if user can revoke this session
      const canRevokeAllSessions = permissions.includes('sessions:manage');
      if (!canRevokeAllSessions && session.userId !== user.userId) {
        return NextResponse.json(
          { success: false, error: 'Can only revoke your own sessions' },
          { status: 403 }
        );
      }

      // Revoke session
      await prisma.userSession.update({
        where: { id: sessionId },
        data: { status: 'Revoked' },
      });

      // Create audit log
      const ipAddress =
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown';

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'DELETE',
          module: 'Session Management',
          details: `Revoked session: ${sessionId}`,
          ipAddress,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Session revoked successfully',
      });
    } catch (error) {
      logger.error('Error revoking session:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to revoke session' },
        { status: 500 }
      );
    }
  }
);
