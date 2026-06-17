import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { hseCertificateService } from '@/lib/services/hse-compliance';
import { forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'compliance_kpi:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    const period =
      url.searchParams.get('period') ??
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const totalHoursWorked = Number(url.searchParams.get('totalHoursWorked') ?? '200000');
    return ok(await hseCertificateService.dashboard(ctx.user.tenantId, period, totalHoursWorked));
  } catch (err) {
    return serverError('Failed to load dashboard', err);
  }
});
