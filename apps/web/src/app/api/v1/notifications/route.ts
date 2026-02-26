import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/notifications
 * List notifications for the current user with filters
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    const isRead = searchParams.get('isRead');
    const type = searchParams.get('type') || undefined;
    const category = searchParams.get('category') || undefined;

    const where: Record<string, unknown> = {
      tenantId: user.tenantId,
      recipientId: user.id,
    };
    if (isRead !== null && isRead !== undefined) where.isRead = isRead === 'true';
    if (type) where.type = type;
    if (category) where.category = category;

    const [data, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { tenantId: user.tenantId, recipientId: user.id, isRead: false },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      meta: {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        unreadCount,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    console.error('[Notifications API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch notifications' } },
      { status: 500 }
    );
  }
});
