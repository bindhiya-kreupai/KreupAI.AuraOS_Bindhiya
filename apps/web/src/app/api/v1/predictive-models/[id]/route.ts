import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { AnalyticsService } from '@/lib/services/analytics.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const model = await AnalyticsService.findModelById(params.id, user.tenantId);
    if (!model) {
      return NextResponse.json({ success: false, error: 'Model not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: model });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
