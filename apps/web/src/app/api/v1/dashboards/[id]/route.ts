import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { AnalyticsService } from '@/lib/services/analytics.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('dashboards:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing dashboards:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const widget = await AnalyticsService.findWidgetById(params.id, user.tenantId);
    if (!widget) {
      return NextResponse.json({ success: false, error: 'Widget not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: widget });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('dashboards:update')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing dashboards:update permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();
    const widget = await AnalyticsService.updateWidget(params.id, user.tenantId, body);
    return NextResponse.json({ success: true, data: widget });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('dashboards:delete')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing dashboards:delete permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    await AnalyticsService.deleteWidget(params.id, user.tenantId);
    return NextResponse.json({ success: true, message: 'Widget deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
});
