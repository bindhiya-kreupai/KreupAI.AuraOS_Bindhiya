import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  taAuditChecklistService,
  taRiskService,
  taComplianceCertificateService,
  TA_COMPLIANCE_CONSTANTS,
} from '@/lib/services/talent-acquisition-compliance';
import { forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'ta_compliance:read', 'recruitment:read', 'dashboard:read'))
    return forbidden();
  try {
    const tenantId = ctx.user.tenantId;
    const [checklist, risks, certs, stageBreakdown, overdue, failing] = await Promise.all([
      taAuditChecklistService.list(tenantId),
      taRiskService.list(tenantId, { status: 'OPEN' }),
      taComplianceCertificateService.list(tenantId),
      taAuditChecklistService.stageBreakdown(tenantId),
      taAuditChecklistService.overdueCount(tenantId),
      taAuditChecklistService.failingHighOrCriticalCount(tenantId),
    ]);
    const risksByBand = (risks as Array<{ band: string }>).reduce<Record<string, number>>(
      (acc, r) => ({ ...acc, [r.band]: (acc[r.band] ?? 0) + 1 }),
      {}
    );
    return ok({
      counts: {
        checklist: checklist.length,
        checklistOverdue: overdue,
        checklistFailingHighOrCritical: failing,
        risksOpen: risks.length,
        risksByBand,
        certificates: certs.length,
        certificatesSigned: (certs as Array<{ status: string }>).filter(
          (c) => c.status === 'SIGNED'
        ).length,
      },
      stageBreakdown,
      stages: TA_COMPLIANCE_CONSTANTS.STAGES,
      categories: TA_COMPLIANCE_CONSTANTS.CATEGORIES,
    });
  } catch (err) {
    return serverError('Failed to load TA compliance dashboard', err);
  }
});
