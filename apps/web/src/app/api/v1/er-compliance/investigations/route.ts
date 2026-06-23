import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { erInvestigationService } from '@/lib/services/er-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'risk_register:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await erInvestigationService.list(
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
    return serverError('Failed to list investigations', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'risk_register:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'open') {
      for (const f of ['investigationNumber', 'startedAt']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await erInvestigationService.open({ ...body, startedAt: new Date(body.startedAt) }, auth),
        'Opened'
      );
    }
    if (body.action === 'add-interview')
      return ok(await erInvestigationService.addInterview(body.id, auth));
    if (body.action === 'add-evidence')
      return ok(await erInvestigationService.addEvidence(body.id, auth));
    if (body.action === 'complete') {
      if (!body.id || !body.findings) return badRequest('id and findings required');
      return ok(
        await erInvestigationService.complete(body.id, body.findings, body.recommendation, auth),
        'Completed'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update investigation', err);
  }
});
