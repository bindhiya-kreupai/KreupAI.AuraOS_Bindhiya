import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { LifeEventService } from '@/lib/services/life-event.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('life-events:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing life-events:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const stats = await LifeEventService.getStatistics(user.tenantId);
    return NextResponse.json({
      success: true,
      data: stats,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch statistics' } },
      { status: 500 }
    );
  }
});
