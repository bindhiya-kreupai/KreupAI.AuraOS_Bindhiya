import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  predictionResultService,
  type ModelCode,
  type PredictionSubjectType,
  type ScoreBand,
  ScoreOutOfRangeError,
} from '@/lib/services/prediction-result.service';

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
    const result = await predictionResultService.list({
      tenantId: context.user.tenantId,
      modelCode: (url.searchParams.get('modelCode') as ModelCode) ?? undefined,
      subjectType: (url.searchParams.get('subjectType') as PredictionSubjectType) ?? undefined,
      subjectId: url.searchParams.get('subjectId') ?? undefined,
      scoreBand: (url.searchParams.get('scoreBand') as ScoreBand) ?? undefined,
      activeOnly: url.searchParams.get('activeOnly') !== 'false',
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
          !body?.modelCode ||
          !body?.modelVersion ||
          !body?.subjectType ||
          !body?.subjectId ||
          body?.scoreValue === undefined
        ) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'E2001',
                message: 'modelCode, modelVersion, subjectType, subjectId, scoreValue required',
              },
            },
            { status: 400 }
          );
        }
        const created = await predictionResultService.record({
          tenantId: context.user.tenantId,
          modelCardId: body.modelCardId,
          modelCode: body.modelCode,
          modelVersion: body.modelVersion,
          subjectType: body.subjectType,
          subjectId: body.subjectId,
          scoreValue: Number(body.scoreValue),
          features: body.features,
          explanations: body.explanations,
          confidence: body.confidence,
          confidenceInterval: body.confidenceInterval,
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
        });
        return NextResponse.json(
          { success: true, data: created, message: 'Prediction recorded' },
          { status: 201 }
        );
      } catch (error) {
        if (error instanceof ScoreOutOfRangeError) {
          return NextResponse.json(
            { success: false, error: { code: 'E4220', message: error.message } },
            { status: 422 }
          );
        }
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Failed to record prediction',
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
    resourceType: 'prediction_result',
    captureRequestBody: true,
  }
);
