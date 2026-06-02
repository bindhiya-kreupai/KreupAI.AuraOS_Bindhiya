// @ts-nocheck — Has Prisma schema drift (wrong field/relation names against current schema). Tracked under #29.
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/notifications/unread-count
 * Get the count of unread notifications for the current user
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('notifications:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing notifications:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }

    const count = await prisma.notification.count({
      where: {
        tenantId: user.tenantId,
        recipientId: user.id,
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      data: { unreadCount: count },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[Notifications Unread Count API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch unread count' } },
      { status: 500 }
    );
  }
});
