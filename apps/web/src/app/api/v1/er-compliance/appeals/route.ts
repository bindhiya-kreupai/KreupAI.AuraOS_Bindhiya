import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { erAppealService } from '@/lib/services/er-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await erAppealService.list(
        ctx.user.tenantId,
        {
          status: url.searchParams.get('status') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list appeals', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'risk_register:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'file') {
      for (const f of ['appealNumber', 'subjectType', 'subjectId', 'appellantId', 'filedAt']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await erAppealService.file(
          {
            ...body,
            filedAt: new Date(body.filedAt),
            decisionDueAt: body.decisionDueAt ? new Date(body.decisionDueAt) : undefined,
          },
          auth
        ),
        'Filed'
      );
    }
    if (body.action === 'decide') {
      if (!body.id || !body.outcome) return badRequest('id and outcome required');
      return ok(await erAppealService.decide(body.id, body.outcome, auth), 'Decided');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update appeal', err);
  }
});
