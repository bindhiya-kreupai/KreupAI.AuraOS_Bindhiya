import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { complianceCorrectiveActionService } from '@/lib/services/executive-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'compliance_kpi:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await complianceCorrectiveActionService.list(
        ctx.user.tenantId,
        {
          status: url.searchParams.get('status') ?? undefined,
          severity: url.searchParams.get('severity') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list corrective actions', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'compliance_kpi:manage', 'risk_register:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'raise') {
      for (const f of ['actionNumber', 'sourceDomain', 'title']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      const { action, ...data } = body;
      return ok(
        await complianceCorrectiveActionService.raise(
          { ...data, dueAt: data.dueAt ? new Date(data.dueAt) : undefined },
          auth
        ),
        'Raised'
      );
    }
    if (body.action === 'complete') {
      if (!body.id) return badRequest('id required');
      return ok(
        await complianceCorrectiveActionService.complete(body.id, body.verificationNotes, auth),
        'Completed'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update corrective action', err);
  }
});
