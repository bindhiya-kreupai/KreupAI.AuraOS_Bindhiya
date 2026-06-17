import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  contractorAssignmentService,
  accommodationMaintenanceService,
  employeeLoanService,
  uniformPpeIssuanceService,
} from '@/lib/services/workforce-extensions';
import { forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const [contractors, loans, issuance, maintenanceOpenCritical] = await Promise.all([
      contractorAssignmentService.list(ctx.user.tenantId, { status: 'ACTIVE' }),
      employeeLoanService.list(ctx.user.tenantId, { status: 'ACTIVE' }),
      uniformPpeIssuanceService.list(ctx.user.tenantId),
      accommodationMaintenanceService.openCriticalCount(ctx.user.tenantId),
    ]);
    return ok({
      activeContractors: (contractors as any[]).length,
      activeLoans: (loans as any[]).length,
      activeLoanBalance: (loans as any[]).reduce((s, l) => s + Number(l.balance ?? 0), 0),
      ppeIssuancesLast30: (issuance as any[]).filter(
        (i) => new Date(i.issuedAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
      ).length,
      maintenanceOpenCritical,
    });
  } catch (err) {
    return serverError('Failed to load dashboard', err);
  }
});
