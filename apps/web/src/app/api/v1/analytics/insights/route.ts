import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { ServiceProxy } from '@/lib/services/service-proxy';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('analytics:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing analytics:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const tenantId = user.tenantId;

    // Proxy to ai-service for dashboard-specific insights
    // The ai-service should handle generating or fetching stored insights
    const result = await ServiceProxy.get('ai', '/api/v1/insights', {
      tenantId,
      userId: user.id,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[AIInsights API] Error:', error);
    // Return early with empty data rather than failing completely for the dashboard
    return NextResponse.json({
      success: true,
      data: [],
    });
  }
});
