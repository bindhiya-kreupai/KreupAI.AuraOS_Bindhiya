import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { visaExitGraceService } from '@/lib/services/visa-exit-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const within = url.searchParams.get('expiringWithinDays');
    return ok(
      await visaExitGraceService.list(ctx.user.tenantId, {
        expiringWithinDays: within ? Number(within) : undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list grace records', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'employee:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'start') {
      for (const f of ['caseId', 'grantedAt', 'graceType']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await visaExitGraceService.start({ ...body, grantedAt: new Date(body.grantedAt) }, auth),
        'Grace started'
      );
    }
    if (body.action === 'extend') {
      if (!body.caseId || !body.extraDays) return badRequest('caseId and extraDays required');
      return ok(
        await visaExitGraceService.extend(body.caseId, Number(body.extraDays), auth),
        'Extended'
      );
    }
    if (body.action === 'close') {
      if (!body.caseId) return badRequest('caseId required');
      return ok(await visaExitGraceService.close(body.caseId, auth), 'Closed');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update grace', err);
  }
});
