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
      matrix,
      windowCounts,
      expired,
      transfers,
      transfersOverdue,
      checklist,
      checklistOverdue,
      checklistFailing,
      risks,
      certs,
    ] = await Promise.all([
      authorizationMatrixService.list(tenantId),
      renewalAlertService.openCountsByWindow(tenantId),
      renewalAlertService.expiredCount(tenantId),
      transferCaseService.list(tenantId, { status: 'REQUESTED' }),
      transferCaseService.openOverdueCount(tenantId),
      immigrationAuditChecklistService.list(tenantId),
      immigrationAuditChecklistService.overdueCount(tenantId),
      immigrationAuditChecklistService.failingHighOrCriticalCount(tenantId),
      immigrationRiskService.list(tenantId, { status: 'OPEN' }),
      immigrationComplianceCertificateService.list(tenantId),
    ]);
    const countriesCovered = new Set((matrix as Array<{ country: string }>).map((m) => m.country))
      .size;
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
