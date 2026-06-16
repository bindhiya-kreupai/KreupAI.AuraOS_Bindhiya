import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { complianceExceptionService } from '@/lib/services/checklist-engine';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'audit:read', 'risk_register:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await complianceExceptionService.list(ctx.user.tenantId, {
        domain: url.searchParams.get('domain') ?? undefined,
        registerCode: url.searchParams.get('registerCode') ?? undefined,
        status: url.searchParams.get('status') ?? undefined,
        severity: url.searchParams.get('severity') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list exceptions', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'audit:read', 'risk_register:manage', 'tenant:manage'))
    return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'raise') {
      for (const f of [
        'domain',
        'registerCode',
        'sourceType',
        'sourceId',
        'title',
        'description',
        'severity',
        'ownerRole',
      ]) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await complianceExceptionService.raise(
          { ...body, dueDate: body.dueDate ? new Date(body.dueDate) : undefined },
          auth
        ),
        'Raised'
      );
    }
    if (body.action === 'close') {
      if (!body.exceptionId) return badRequest('exceptionId required');
      return ok(await complianceExceptionService.close(body.exceptionId, auth), 'Closed');
    }
    if (body.action === 'accept') {
      if (!body.exceptionId) return badRequest('exceptionId required');
      return ok(await complianceExceptionService.accept(body.exceptionId, auth), 'Accepted');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update exception', err);
  }
});
