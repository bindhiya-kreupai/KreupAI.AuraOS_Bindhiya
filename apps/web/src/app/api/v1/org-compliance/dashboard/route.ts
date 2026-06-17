import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  orgAuditChecklistService,
  orgPositionControlService,
  orgVacancyService,
  orgComplianceCertificateService,
  ORG_COMPLIANCE_CONSTANTS,
} from '@/lib/services/org-compliance';
import { forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'org_compliance:read', 'organization:read', 'dashboard:read'))
    return forbidden();
  try {
    const tenantId = ctx.user.tenantId;
    const url = new URL(req.url);
    const period =
      url.searchParams.get('period') ??
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const [checklist, overhireTotal, vacancyAged, departmentsCovered, certs, overdue] =
      await Promise.all([
        orgAuditChecklistService.list(tenantId),
        orgPositionControlService.overhireTotal(tenantId, period),
        orgVacancyService.openAged(tenantId),
        orgPositionControlService.departmentsCovered(tenantId, period),
        orgComplianceCertificateService.list(tenantId),
        orgAuditChecklistService.overdueCount(tenantId),
      ]);
    const checklistByResult = (checklist as Array<{ lastResult: string | null }>).reduce<
      Record<string, number>
    >(
      (acc, c) => ({
        ...acc,
        [c.lastResult ?? 'UNCHECKED']: (acc[c.lastResult ?? 'UNCHECKED'] ?? 0) + 1,
      }),
      {}
    );
    return ok({
      period,
      counts: {
        checklist: checklist.length,
        checklistByResult,
        checklistOverdue: overdue,
        overhireTotal,
        departmentsCovered,
        vacanciesOpen: vacancyAged.open,
        vacanciesAged: vacancyAged.aged,
        vacanciesUnapproved: vacancyAged.unapproved,
        certificates: certs.length,
        certificatesSigned: (certs as Array<{ status: string }>).filter(
          (c) => c.status === 'SIGNED'
        ).length,
      },
      categories: ORG_COMPLIANCE_CONSTANTS.CATEGORIES,
    });
  } catch (err) {
    return serverError('Failed to load org compliance dashboard', err);
  }
});
