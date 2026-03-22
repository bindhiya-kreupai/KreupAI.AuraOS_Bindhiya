import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/notifications/unregister-device
 * Unregister a device push token for the authenticated user
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { pushToken } = body;

    if (!pushToken) {
      return NextResponse.json(
        { error: 'pushToken is required' },
        { status: 400 }
      );
    }

    // Soft-delete by marking inactive
    await prisma.deviceToken.updateMany({
      where: {
        userId: user.id,
        token: pushToken,
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[unregister-device] Error:', error);
    return NextResponse.json(
      { error: 'Failed to unregister device' },
      { status: 500 }
    );
  }
});
