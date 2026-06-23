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
    const [contractorsRes, loansRes, issuanceRes, maintenanceOpenCritical] = await Promise.all([
      contractorAssignmentService.list(
        ctx.user.tenantId,
        { status: 'ACTIVE' },
        { page: 1, pageSize: 500 }
      ),
      employeeLoanService.list(ctx.user.tenantId, { status: 'ACTIVE' }, { page: 1, pageSize: 500 }),
      uniformPpeIssuanceService.list(ctx.user.tenantId, {}, { page: 1, pageSize: 500 }),
      accommodationMaintenanceService.openCriticalCount(ctx.user.tenantId),
    ]);
    const contractors = contractorsRes.items as any[];
    const loans = loansRes.items as any[];
    const issuance = issuanceRes.items as any[];
    return ok({
      activeContractors: contractors.length,
      activeLoans: loans.length,
      activeLoanBalance: loans.reduce((s, l) => s + Number(l.balance ?? 0), 0),
      ppeIssuancesLast30: issuance.filter(
        (i) => new Date(i.issuedAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
      ).length,
      maintenanceOpenCritical,
    });
  } catch (err) {
    return serverError('Failed to load dashboard', err);
  }
});
