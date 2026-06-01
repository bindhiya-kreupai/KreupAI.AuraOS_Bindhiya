import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { AnalyticsService } from '@/lib/services/analytics.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
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
    const conversation = await AnalyticsService.findConversationById(params.id, user.tenantId);
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: conversation });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('ai-conversations:delete')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing ai-conversations:delete permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    await AnalyticsService.deleteConversation(params.id, user.tenantId);
    return NextResponse.json({ success: true, message: 'Conversation deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
});
