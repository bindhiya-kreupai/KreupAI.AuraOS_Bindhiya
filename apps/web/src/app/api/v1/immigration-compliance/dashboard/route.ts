import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  authorizationMatrixService,
  renewalAlertService,
  transferCaseService,
  immigrationAuditChecklistService,
  immigrationRiskService,
  immigrationComplianceCertificateService,
  IMMIGRATION_COMPLIANCE_CONSTANTS,
} from '@/lib/services/immigration-compliance';
import { forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'immigration_compliance:read', 'immigration:read', 'dashboard:read'))
    return forbidden();
  try {
    const tenantId = ctx.user.tenantId;
    const [
      matrixRes,
      windowCounts,
      expired,
      transfersRes,
      transfersOverdue,
      checklistRes,
      checklistOverdue,
      checklistFailing,
      risksRes,
      certs,
    ] = await Promise.all([
      authorizationMatrixService.list(tenantId, {}, { page: 1, pageSize: 500 }),
      renewalAlertService.openCountsByWindow(tenantId),
      renewalAlertService.expiredCount(tenantId),
      transferCaseService.list(tenantId, { status: 'REQUESTED' }, { page: 1, pageSize: 500 }),
      transferCaseService.openOverdueCount(tenantId),
      immigrationAuditChecklistService.list(tenantId, {}, { page: 1, pageSize: 500 }),
      immigrationAuditChecklistService.overdueCount(tenantId),
      immigrationAuditChecklistService.failingHighOrCriticalCount(tenantId),
      immigrationRiskService.list(tenantId, { status: 'OPEN' }, { page: 1, pageSize: 500 }),
      immigrationComplianceCertificateService.list(tenantId),
    ]);
    const matrix = matrixRes.items as Array<{ country: string }>;
    const transfers = transfersRes.items as Array<unknown>;
    const checklist = checklistRes.items as Array<unknown>;
    const risks = risksRes.items as Array<unknown>;
    const countriesCovered = new Set(matrix.map((m) => m.country)).size;
    return ok({
      counts: {
        matrixItems: matrix.length,
        countriesCovered,
        alertsExpired: expired,
        alerts7d: windowCounts.WINDOW_7 ?? 0,
        alerts30d: windowCounts.WINDOW_30 ?? 0,
        alerts60d: windowCounts.WINDOW_60 ?? 0,
        transfersRequested: transfers.length,
        transfersOverdue,
        checklist: checklist.length,
        checklistOverdue,
        checklistFailingHighOrCritical: checklistFailing,
        risksOpen: risks.length,
        certificates: certs.length,
        certificatesSigned: (certs as Array<{ status: string }>).filter(
          (c) => c.status === 'SIGNED'
        ).length,
      },
      categories: IMMIGRATION_COMPLIANCE_CONSTANTS.CATEGORIES,
      countries: IMMIGRATION_COMPLIANCE_CONSTANTS.COUNTRIES,
      transferTypes: IMMIGRATION_COMPLIANCE_CONSTANTS.TRANSFER_TYPES,
    });
  } catch (err) {
    return serverError('Failed to load immigration compliance dashboard', err);
  }
});
