import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { AnalyticsService } from '@/lib/services/analytics.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('ai-conversations:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing ai-conversations:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);
    const filter = {
      tenantId: user.tenantId,
      userId: searchParams.get('userId') || user.id,
      agentType: searchParams.get('agentType') || undefined,
      isActive: searchParams.get('isActive') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
    };
    const result = await AnalyticsService.findAllConversations(filter);
    return NextResponse.json({ success: true, data: result.data, meta: result.meta });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('ai-conversations:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing ai-conversations:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();
    body.tenantId = user.tenantId;
    body.userId = user.id;
    const conversation = await AnalyticsService.createConversation(body);
    return NextResponse.json({ success: true, data: conversation }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
});
