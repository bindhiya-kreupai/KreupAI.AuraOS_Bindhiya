import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/middleware/enhanced-auth';
import { AnalyticsService } from '@/lib/services/analytics.service';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const model = await AnalyticsService.trainModel(params.id, user.tenantId, user.id);
    return NextResponse.json({ success: true, data: model });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
});
