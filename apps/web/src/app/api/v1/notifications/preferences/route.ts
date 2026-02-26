import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/notifications/preferences
 * Get notification preferences for the current user
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;

    const preferences = await prisma.notificationPreference.findMany({
      where: { userId: user.id },
      orderBy: { category: 'asc' },
    });

    // Return defaults if no preferences set
    if (preferences.length === 0) {
      const defaultPreferences = [
        {
          category: 'LEAVE',
          emailEnabled: true,
          pushEnabled: true,
          smsEnabled: false,
          inAppEnabled: true,
        },
        {
          category: 'PAYROLL',
          emailEnabled: true,
          pushEnabled: false,
          smsEnabled: false,
          inAppEnabled: true,
        },
        {
          category: 'ATTENDANCE',
          emailEnabled: false,
          pushEnabled: true,
          smsEnabled: false,
          inAppEnabled: true,
        },
        {
          category: 'PERFORMANCE',
          emailEnabled: true,
          pushEnabled: true,
          smsEnabled: false,
          inAppEnabled: true,
        },
        {
          category: 'TASK',
          emailEnabled: true,
          pushEnabled: true,
          smsEnabled: false,
          inAppEnabled: true,
        },
        {
          category: 'SYSTEM',
          emailEnabled: true,
          pushEnabled: false,
          smsEnabled: false,
          inAppEnabled: true,
        },
      ];

      return NextResponse.json({
        success: true,
        data: defaultPreferences,
        meta: {
          isDefault: true,
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: preferences,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    console.error('[Notification Preferences API] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'E5001', message: 'Failed to fetch notification preferences' },
      },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/v1/notifications/preferences
 * Update notification preferences for the current user
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();

    if (!Array.isArray(body.preferences)) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'preferences array is required' } },
        { status: 400 }
      );
    }

    // Upsert each preference
    const results = await Promise.all(
      body.preferences.map((pref: any) =>
        prisma.notificationPreference.upsert({
          where: {
            userId_category: { userId: user.id, category: pref.category },
          },
          create: {
            userId: user.id,
            tenantId: user.tenantId,
            category: pref.category,
            emailEnabled: pref.emailEnabled ?? true,
            pushEnabled: pref.pushEnabled ?? true,
            smsEnabled: pref.smsEnabled ?? false,
            inAppEnabled: pref.inAppEnabled ?? true,
          },
          update: {
            emailEnabled: pref.emailEnabled,
            pushEnabled: pref.pushEnabled,
            smsEnabled: pref.smsEnabled,
            inAppEnabled: pref.inAppEnabled,
            updatedAt: new Date(),
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      data: results,
      message: 'Notification preferences updated successfully',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    console.error('[Notification Preferences API] PUT Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'E5001', message: 'Failed to update notification preferences' },
      },
      { status: 500 }
    );
  }
});
