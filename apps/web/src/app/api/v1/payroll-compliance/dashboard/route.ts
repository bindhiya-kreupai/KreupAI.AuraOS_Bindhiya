import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  payrollGovernanceService,
  payrollAuditFindingService,
  payrollRiskService,
  payrollComplianceCertificateService,
  PAYROLL_COMPLIANCE_CONSTANTS,
} from '@/lib/services/payroll-compliance';
import { forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'payroll_compliance:read', 'payroll:read', 'dashboard:read'))
    return forbidden();
  try {
    const tenantId = ctx.user.tenantId;
    const url = new URL(req.url);
    const period =
      url.searchParams.get('period') ??
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const [controlsRes, findingsRes, risksRes, certs, controlsOverdue] = await Promise.all([
      payrollGovernanceService.list(tenantId, {}, { page: 1, pageSize: 500 }),
      payrollAuditFindingService.list(tenantId, { period }, { page: 1, pageSize: 500 }),
      payrollRiskService.list(tenantId, { status: 'OPEN' }, { page: 1, pageSize: 500 }),
      payrollComplianceCertificateService.list(tenantId),
      payrollGovernanceService.overdueCount(tenantId),
    ]);
    const controls = controlsRes.items as Array<unknown>;
    const findings = findingsRes.items as Array<{ severity: string; status: string }>;
    const risks = risksRes.items as Array<{ band: string }>;
    const findingsBySev = findings.reduce<Record<string, number>>((acc, f) => {
      if (f.status !== 'OPEN') return acc;
      return { ...acc, [f.severity]: (acc[f.severity] ?? 0) + 1 };
    }, {});
    const risksByBand = risks.reduce<Record<string, number>>(
      (acc, r) => ({ ...acc, [r.band]: (acc[r.band] ?? 0) + 1 }),
      {}
    );
    return ok({
      period,
      counts: {
        controls: controls.length,
        controlsOverdue,
        findingsOpen: (findings as Array<{ status: string }>).filter((f) => f.status === 'OPEN')
          .length,
        findingsBySev,
        risksOpen: risks.length,
        risksByBand,
        certificates: certs.length,
        certificatesSigned: (certs as Array<{ status: string }>).filter(
          (c) => c.status === 'SIGNED'
        ).length,
      },
      categories: PAYROLL_COMPLIANCE_CONSTANTS.CATEGORIES,
      severities: PAYROLL_COMPLIANCE_CONSTANTS.SEVERITIES,
    });
  } catch (err) {
    return serverError('Failed to load payroll compliance dashboard', err);
  }
});
