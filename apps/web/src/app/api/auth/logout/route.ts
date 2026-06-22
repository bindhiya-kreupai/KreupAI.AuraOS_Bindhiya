// @ts-nocheck — Prisma schema drift for UserSession / AuditLog. Tracked under #29.
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withAuth } from '@/lib/auth';
import { clearAuthCookies } from '@/lib/auth/cookies';
import { logger } from '@/lib/logger';

/**
 * POST /api/auth/logout
 * Clears auth cookies; best-effort revokes the DB session + writes an audit
 * log. The cookie is always cleared even if DB calls fail, so the user is
 * effectively logged out from the browser regardless.
 */
export const POST = withAuth(async (request: NextRequest, { user }) => {
  const ipAddress =
    request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';

  // DB cleanup is best-effort — never block logout on it. The auth-related
  // tables may not exist yet (see schema drift note above).
  if (user.sessionId) {
    try {
      await prisma.userSession.update({
        where: { id: user.sessionId },
        data: { status: 'Revoked', lastActive: new Date() },
      });
    } catch (error: any) {
      logger.warn(
        { error, userId: user.userId, sessionId: user.sessionId },
        'Failed to revoke session row during logout — clearing cookie anyway'
      );
    }
  }

  try {
    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.userId,
        action: 'LOGOUT',
        entityType: 'Authentication',
        metadata: { description: `User logged out from ${ipAddress}` } as any,
        ipAddress,
      },
    });
  } catch (error: any) {
    logger.warn({ error, userId: user.userId }, 'Failed to write logout audit log');
  }

  const response = NextResponse.json({ success: true, message: 'Logout successful' });
  clearAuthCookies(response);
  return response;
});
