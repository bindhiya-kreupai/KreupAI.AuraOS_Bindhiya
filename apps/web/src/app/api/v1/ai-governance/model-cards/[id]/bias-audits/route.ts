import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { aiGovernanceService } from '@/lib/services/ai-governance.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/ai-governance/model-cards/[id]/bias-audits
 * Body: { auditor, cohorts: [{name, n, positiveRate}], metric?,
 *         threshold?, findings?, remediationPlan?, reportUrl?,
 *         forcePassed? }
 *
 * Records a bias audit. Pass/fail computed via 4/5ths rule unless
 * `forcePassed` is supplied.
 */
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
        if (!context.permissions.includes('ai-governance:approve')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing ai-governance:approve' } },
            { status: 403 }
          );
        }
        const body = await request.json();
        if (!body?.auditor || !Array.isArray(body?.cohorts)) {
          return NextResponse.json(
            { success: false, error: { code: 'E2001', message: 'auditor and cohorts[] required' } },
            { status: 400 }
          );
        }
        const created = await aiGovernanceService.recordBiasAudit({
          tenantId: context.user.tenantId,
          modelCardId: context.params.id,
          auditor: body.auditor,
          cohorts: body.cohorts,
          metric: body.metric,
          threshold: body.threshold,
          findings: body.findings,
          remediationPlan: body.remediationPlan,
          reportUrl: body.reportUrl,
          forcePassed: body.forcePassed,
          actorId: context.user.id,
        });
        return NextResponse.json(
          { success: true, data: created, message: 'Bias audit recorded' },
          { status: 201 }
        );
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Failed to record audit',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  { action: AuditAction.SETTINGS_UPDATED, resourceType: 'ai_bias_audit', captureRequestBody: true }
);
