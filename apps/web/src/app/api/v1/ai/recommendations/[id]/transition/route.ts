import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  aiRecommendationService,
  InvalidRecommendationTransitionError,
} from '@/lib/services/ai-recommendation.service';

export const dynamic = 'force-dynamic';

export const POST = withAudit(
  withEnhancedAuth(
    async (
      request: NextRequest,
      context: {
        user: { id: string; tenantId: string };
        permissions: string[];
        params: { id: string };
      }
    ) => {
      try {
        if (!context.permissions.includes('ai:write')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing ai:write' } },
            { status: 403 }
          );
        }
        const body = await request.json();
        const action = body?.action as 'accept' | 'dismiss' | undefined;
        let updated;
        switch (action) {
          case 'accept':
            updated = await aiRecommendationService.accept(
              context.params.id,
              context.user.tenantId,
              context.user.id
            );
            break;
          case 'dismiss':
            updated = await aiRecommendationService.dismiss(
              context.params.id,
              context.user.tenantId,
              context.user.id,
              body.reason
            );
            break;
          default:
            return NextResponse.json(
              { success: false, error: { code: 'E2001', message: `unknown action ${action}` } },
              { status: 400 }
            );
        }
        if (!updated) {
          return NextResponse.json(
            { success: false, error: { code: 'E4040', message: 'Recommendation not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updated });
      } catch (error) {
        if (error instanceof InvalidRecommendationTransitionError) {
          return NextResponse.json(
            { success: false, error: { code: 'E4090', message: error.message } },
            { status: 409 }
          );
        }
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Failed to transition recommendation',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  {
    action: AuditAction.SETTINGS_UPDATED,
    resourceType: 'ai_recommendation',
    captureRequestBody: true,
  }
);
