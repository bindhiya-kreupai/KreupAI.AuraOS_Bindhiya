import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { gccLandscapeDashboardService } from '@/lib/services/gcc-landscape';
import { forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'dashboard:read', 'compliance_kpi:read', 'tenant:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const countryCode = url.searchParams.get('countryCode') ?? undefined;
    const legalEntityId = url.searchParams.get('legalEntityId') ?? undefined;
    const data = await gccLandscapeDashboardService.load(ctx.user.tenantId, ctx.user.id, {
      countryCode,
      legalEntityId,
    });
    return ok(data);
  } catch (err) {
    return serverError('Failed to load GCC landscape dashboard', err);
  }
});
