import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { successionPoolService } from '@/lib/services/org-design';
import {
  badRequest,
  created,
  forbidden,
  hasAny,
  ok,
  serverError,
  type RouteContext,
} from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'org-chart:read', 'organization:read', 'dashboard:read'))
    return forbidden();
  try {
    return ok(await successionPoolService.list(ctx.user.tenantId));
  } catch (err) {
    return serverError('Failed to list succession pools', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'org-chart:manage', 'organization:manage')) return forbidden();
  try {
    const body = await req.json();
    if (!body.name || !body.criticalRole)
      return badRequest('name and criticalRole are required', 'الاسم والدور الحرج مطلوبان');
    return created(await successionPoolService.create(ctx.user.tenantId, ctx.user.userId, body));
  } catch (err) {
    return serverError('Failed to create succession pool', err);
  }
});
