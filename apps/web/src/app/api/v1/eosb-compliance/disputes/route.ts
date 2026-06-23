import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { eosbDisputeService } from '@/lib/services/eosb-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await eosbDisputeService.list(
        ctx.user.tenantId,
        { status: url.searchParams.get('status') ?? undefined },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list disputes', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'risk_register:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'raise') {
      for (const f of ['employeeId', 'subject', 'currency', 'category']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(await eosbDisputeService.raise(body, auth), 'Raised');
    }
    if (body.action === 'transition') {
      if (!body.id || !body.next) return badRequest('id and next required');
      return ok(
        await eosbDisputeService.transition(body.id, body.next, body.resolutionNotes, auth),
        'Transitioned'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update dispute', err);
  }
});
