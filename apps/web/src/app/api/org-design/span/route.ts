import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { spanOfControlService } from '@/lib/services/org-design';
import { forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'org-chart:read', 'organization:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const idealMin = Number(url.searchParams.get('idealMin') ?? '4');
    const idealMax = Number(url.searchParams.get('idealMax') ?? '7');
    return ok(await spanOfControlService.analyze(ctx.user.tenantId, idealMin, idealMax));
  } catch (err) {
    return serverError('Failed to analyze span of control', err);
  }
});
