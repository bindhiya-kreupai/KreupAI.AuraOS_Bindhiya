import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { orgChartService } from '@/lib/services/org-design';
import { forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'org-chart:read', 'organization:read', 'dashboard:read'))
    return forbidden();
  try {
    return ok(await orgChartService.getPositionTree(ctx.user.tenantId));
  } catch (err) {
    return serverError('Failed to load org chart', err);
  }
});
