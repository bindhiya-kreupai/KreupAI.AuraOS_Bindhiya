import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { AnalyticsService } from '@/lib/services/analytics.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('predictions:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing predictions:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);
    const filter = {
      tenantId: user.tenantId,
      modelId: searchParams.get('modelId') || undefined,
      entityId: searchParams.get('entityId') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
    };
    const result = await AnalyticsService.findAllPredictions(filter);
    return NextResponse.json({ success: true, data: result.data, meta: result.meta });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('predictions:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing predictions:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();
    const prediction = await AnalyticsService.makePrediction(
      body.modelId,
      user.tenantId,
      body.inputData,
      body.entityId
    );
    return NextResponse.json({ success: true, data: prediction }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
});
