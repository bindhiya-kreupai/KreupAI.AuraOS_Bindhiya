import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  aiRecommendationService,
  type RecommendationCategory,
  type RecommendationPriority,
  type RecommendationStatus,
} from '@/lib/services/ai-recommendation.service';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(
  async (request: NextRequest, context: { user: { tenantId: string }; permissions: string[] }) => {
    if (!context.permissions.includes('ai:read')) {
      return NextResponse.json(
        { success: false, error: { code: 'E4030', message: 'missing ai:read' } },
        { status: 403 }
      );
    }
    const url = new URL(request.url);
    const result = await aiRecommendationService.list({
      tenantId: context.user.tenantId,
      category: (url.searchParams.get('category') as RecommendationCategory) ?? undefined,
      subjectType: url.searchParams.get('subjectType') ?? undefined,
      subjectId: url.searchParams.get('subjectId') ?? undefined,
      status: (url.searchParams.get('status') as RecommendationStatus) ?? undefined,
      priority: (url.searchParams.get('priority') as RecommendationPriority) ?? undefined,
      page: Number(url.searchParams.get('page')) || 1,
      limit: Number(url.searchParams.get('limit')) || 50,
    });
    return NextResponse.json({ success: true, ...result });
  }
);

export const POST = withAudit(
  withEnhancedAuth(
    async (
      request: NextRequest,
      context: { user: { tenantId: string }; permissions: string[] }
    ) => {
      try {
        if (!context.permissions.includes('ai:write')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing ai:write' } },
            { status: 403 }
          );
        }
        const body = await request.json();
        if (
          !body?.category ||
          !body?.subjectType ||
          !body?.subjectId ||
          !body?.title ||
          !body?.rationale
        ) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'E2001',
                message: 'category, subjectType, subjectId, title, rationale required',
              },
            },
            { status: 400 }
          );
        }
        const created = await aiRecommendationService.create({
          tenantId: context.user.tenantId,
          category: body.category,
          subjectType: body.subjectType,
          subjectId: body.subjectId,
          title: body.title,
          rationale: body.rationale,
          recommendedAction: body.recommendedAction,
          priority: body.priority,
          generatingModelCardId: body.generatingModelCardId,
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
        });
        return NextResponse.json(
          { success: true, data: created, message: 'Recommendation created' },
          { status: 201 }
        );
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Failed to create recommendation',
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
