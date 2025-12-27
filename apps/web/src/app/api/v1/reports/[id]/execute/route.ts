import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/middleware/enhanced-auth';
import { AnalyticsService } from '@/lib/services/analytics.service';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const body = await request.json();
    const result = await AnalyticsService.executeReport(
      params.id,
      user.tenantId,
      user.id,
      body.parameters
    );
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
});
