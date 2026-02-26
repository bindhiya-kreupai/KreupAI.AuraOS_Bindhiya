import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/v1/notifications/read-all
 * Mark all notifications as read for the current user
 */
export const PATCH = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;

    const result = await prisma.notification.updateMany({
      where: {
        tenantId: user.tenantId,
        recipientId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: { updatedCount: result.count },
      message: `${result.count} notifications marked as read`,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    console.error('[Notifications Read All API] PATCH Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'E5001', message: 'Failed to mark all notifications as read' },
      },
      { status: 500 }
    );
  }
});
