import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  aiGovernanceService,
  type ModelRiskTier,
  type ModelStatus,
} from '@/lib/services/ai-governance.service';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(
  async (request: NextRequest, context: { user: { tenantId: string }; permissions: string[] }) => {
    if (!context.permissions.includes('ai-governance:read')) {
      return NextResponse.json(
        { success: false, error: { code: 'E4030', message: 'missing ai-governance:read' } },
        { status: 403 }
      );
    }
    const url = new URL(request.url);
    const tenantScope =
      url.searchParams.get('scope') === 'platform' ? undefined : context.user.tenantId;
    const result = await aiGovernanceService.listModelCards({
      tenantId: tenantScope,
      status: (url.searchParams.get('status') as ModelStatus) ?? undefined,
      riskTier: (url.searchParams.get('riskTier') as ModelRiskTier) ?? undefined,
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
      context: { user: { id: string; tenantId: string }; permissions: string[] }
    ) => {
      try {
        if (!context.permissions.includes('ai-governance:create')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing ai-governance:create' } },
            { status: 403 }
          );
        }
        const body = await request.json();
        const required = ['modelName', 'modelVersion', 'modelType', 'intendedUse'];
        for (const f of required) {
          if (!body[f]) {
            return NextResponse.json(
              { success: false, error: { code: 'E2001', message: `${f} required` } },
              { status: 400 }
            );
          }
        }
        const created = await aiGovernanceService.createModelCard({
          tenantId: body.scope === 'platform' ? undefined : context.user.tenantId,
          modelName: body.modelName,
          modelVersion: body.modelVersion,
          modelType: body.modelType,
          riskTier: body.riskTier,
          intendedUse: body.intendedUse,
          prohibitedUse: body.prohibitedUse,
          trainingData: body.trainingData,
          knownLimitations: body.knownLimitations,
          actorId: context.user.id,
        });
        return NextResponse.json(
          { success: true, data: created, message: 'Model card created' },
          { status: 201 }
        );
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Failed to create model card',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  { action: AuditAction.SETTINGS_UPDATED, resourceType: 'ai_model_card', captureRequestBody: true }
);
