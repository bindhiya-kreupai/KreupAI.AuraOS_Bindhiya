import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { docLitigationHoldService } from '@/lib/services/document-retention-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await docLitigationHoldService.list(ctx.user.tenantId, {
        status: url.searchParams.get('status') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list holds', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'risk_register:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'start') {
      for (const f of ['caseNumber', 'subject', 'scopeFilter']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(await docLitigationHoldService.start(body, auth), 'Started');
    }
    if (body.action === 'release') {
      if (!body.caseNumber) return badRequest('caseNumber required');
      return ok(await docLitigationHoldService.release(body.caseNumber, auth), 'Released');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update hold', err);
  }
});
