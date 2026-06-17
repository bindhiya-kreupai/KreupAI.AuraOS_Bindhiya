import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { eosbAccrualService } from '@/lib/services/eosb-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await eosbAccrualService.list(ctx.user.tenantId, url.searchParams.get('period') ?? undefined)
    );
  } catch (err) {
    return serverError('Failed to list accruals', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'employee:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'snapshot') {
      for (const f of ['employeeId', 'period', 'countryCode', 'joiningDate', 'basicSalary']) {
        if (body[f] == null) return badRequest(`${f} required`);
      }
      return ok(
        await eosbAccrualService.snapshot(
          { ...body, joiningDate: new Date(body.joiningDate) },
          auth
        ),
        'Snapshot taken'
      );
    }
    if (body.action === 'mark-gl-posted') {
      if (!body.id || !body.glJournalRef) return badRequest('id and glJournalRef required');
      return ok(
        await eosbAccrualService.markGlPosted(body.id, body.glJournalRef, auth),
        'GL posted'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update accrual', err);
  }
});
