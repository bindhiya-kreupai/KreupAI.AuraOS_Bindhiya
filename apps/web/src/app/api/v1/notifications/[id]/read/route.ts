// @ts-nocheck — Has Prisma schema drift (wrong field/relation names against current schema). Tracked under #29.
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/v1/notifications/[id]/read
 * Mark a notification as read
 */
export const PATCH = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('notifications:update')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing notifications:update permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = context.params;

    const notification = await prisma.notification.findFirst({
      where: { id, tenantId: user.tenantId, recipientId: user.id },
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Notification not found' } },
        { status: 404 }
      );
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Notification marked as read',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[Notification Read API] PATCH Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to mark notification as read' } },
      { status: 500 }
    );
  }
});
