import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/notifications/register-device
 * Register a device push token for the authenticated user
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('notifications:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing notifications:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();
    const { pushToken, deviceToken, platform, tokenType } = body;

    const token = pushToken || deviceToken;
    if (!token) {
      return NextResponse.json({ error: 'pushToken or deviceToken is required' }, { status: 400 });
    }

    const record = await prisma.deviceToken.upsert({
      where: {
        userId_token: {
          userId: user.id,
          token,
        },
      },
      update: {
        platform: platform || 'unknown',
        tokenType: tokenType || 'expo',
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        tenantId: user.tenantId,
        token,
        platform: platform || 'unknown',
        tokenType: tokenType || 'expo',
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: record.id, token: record.token, platform: record.platform },
    });
  } catch (error: any) {
    console.error('[register-device] Error:', error);
    return NextResponse.json({ error: 'Failed to register device' }, { status: 500 });
  }
});
