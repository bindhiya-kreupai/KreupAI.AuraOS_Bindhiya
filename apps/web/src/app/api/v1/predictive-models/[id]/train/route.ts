import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { AnalyticsService } from '@/lib/services/analytics.service';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('predictive-models:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing predictive-models:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const model = await AnalyticsService.trainModel(params.id, user.tenantId, user.id);
    return NextResponse.json({ success: true, data: model });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
});
