import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { calendarCertificateService } from '@/lib/services/compliance-calendar';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'dashboard:read', 'compliance_kpi:read', 'tenant:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const period = url.searchParams.get('period');
    if (!period) return badRequest('period required');
    return ok(await calendarCertificateService.dashboard(ctx.user.tenantId, period));
  } catch (err) {
    return serverError('Failed to compute dashboard', err);
  }
});
