import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { jobArchitectureService } from '@/lib/services/structural-extensions';
import { forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    return ok(await jobArchitectureService.list(ctx.user.tenantId));
  } catch (err) {
    return serverError('Failed to list job architecture', err);
  }
});
