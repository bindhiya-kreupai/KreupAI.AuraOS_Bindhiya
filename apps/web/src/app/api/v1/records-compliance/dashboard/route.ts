import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  recordsDocumentMatrixService,
  recordsAuditChecklistService,
  recordsRiskService,
  recordsCompletenessService,
  recordsComplianceCertificateService,
  RECORDS_COMPLIANCE_CONSTANTS,
} from '@/lib/services/records-compliance';
import { forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'records_compliance:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const tenantId = ctx.user.tenantId;
    const url = new URL(req.url);
    const period =
      url.searchParams.get('period') ??
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const [matrix, agg, checklist, risks, certs, checklistOverdue] = await Promise.all([
      recordsDocumentMatrixService.list(tenantId),
      recordsCompletenessService.aggregate(tenantId, period),
      recordsAuditChecklistService.list(tenantId),
      recordsRiskService.list(tenantId, { status: 'OPEN' }),
      recordsComplianceCertificateService.list(tenantId),
      recordsAuditChecklistService.overdueCount(tenantId),
    ]);
    const matrixByCountry = (matrix as Array<{ country: string }>).reduce<Record<string, number>>(
      (acc, m) => ({ ...acc, [m.country]: (acc[m.country] ?? 0) + 1 }),
      {}
    );
    return ok({
      period,
      counts: {
        matrixItems: matrix.length,
        matrixByCountry,
        ...agg,
        checklist: checklist.length,
        checklistOverdue,
        risksOpen: risks.length,
        certificates: certs.length,
        certificatesSigned: (certs as Array<{ status: string }>).filter(
          (c) => c.status === 'SIGNED'
        ).length,
      },
      categories: RECORDS_COMPLIANCE_CONSTANTS.CATEGORIES,
      sensitivities: RECORDS_COMPLIANCE_CONSTANTS.SENSITIVITIES,
    });
  } catch (err) {
    return serverError('Failed to load records compliance dashboard', err);
  }
});
