import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { AnalyticsService } from '@/lib/services/analytics.service';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('dashboards:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing dashboards:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const result = await AnalyticsService.refreshWidget(params.id, user.tenantId);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
});
