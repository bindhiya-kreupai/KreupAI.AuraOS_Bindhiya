import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  aiGovernanceService,
  InvalidModelTransitionError,
  UnpublishableHighRiskModelError,
} from '@/lib/services/ai-governance.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/ai-governance/model-cards/[id]/publish
 *
 * Publishes a model card. Refuses HIGH-risk cards that fail the EU AI
 * Act Annex IV checklist (intendedUse ≥ 20 chars, knownLimitations
 * present, fairnessMetrics non-empty, performanceMetrics non-empty,
 * passing bias audit within last 12 months). Returns 422 with the
 * blocking reasons in the response.
 */
export const POST = withAudit(
  withEnhancedAuth(
    async (
      _request: NextRequest,
      context: {
        user: { id: string; tenantId: string };
        permissions: string[];
        params: { id: string };
      }
    ) => {
      try {
        if (!context.permissions.includes('ai-governance:approve')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing ai-governance:approve' } },
            { status: 403 }
          );
        }
        const updated = await aiGovernanceService.publishModel(context.params.id, context.user.id);
        if (!updated) {
          return NextResponse.json(
            { success: false, error: { code: 'E4040', message: 'Model card not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updated, message: 'Published' });
      } catch (error) {
        if (error instanceof UnpublishableHighRiskModelError) {
          return NextResponse.json(
            { success: false, error: { code: 'E4220', message: error.message } },
            { status: 422 }
          );
        }
        if (error instanceof InvalidModelTransitionError) {
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
              message: 'Publish failed',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  { action: AuditAction.SETTINGS_UPDATED, resourceType: 'ai_model_card' }
);
