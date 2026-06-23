import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { gccRbacService } from '@/lib/services/gcc-landscape';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'role:read', 'tenant:read', 'tenant:manage')) return forbidden();
  try {
    return ok(await gccRbacService.listPersonas(ctx.user.tenantId));
  } catch (err) {
    return serverError('Failed to list personas', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'role:manage', 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    if (body.action === 'seed-personas') {
      return ok(
        await gccRbacService.seedPersonas({
          tenantId: ctx.user.tenantId,
          userId: ctx.user.id,
        }),
        'Personas seeded'
      );
    }
    if (body.action === 'assign-scope') {
      if (!body.userRoleId || !Array.isArray(body.scopes)) {
        return badRequest('userRoleId and scopes[] required');
      }
      return ok(
        await gccRbacService.assignRoleScope(body.userRoleId, body.scopes, {
          tenantId: ctx.user.tenantId,
          userId: ctx.user.id,
        }),
        'Scope assigned'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update personas', err);
  }
});
