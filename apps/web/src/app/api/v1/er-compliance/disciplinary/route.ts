import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { erDisciplinaryService } from '@/lib/services/er-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await erDisciplinaryService.list(
        ctx.user.tenantId,
        {
          status: url.searchParams.get('status') ?? undefined,
          employeeId: url.searchParams.get('employeeId') ?? undefined,
          actionType: url.searchParams.get('actionType') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list disciplinary actions', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'employee:manage', 'risk_register:manage'))
    return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'draft') {
      for (const f of ['actionNumber', 'employeeId', 'misconductType', 'actionType']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(await erDisciplinaryService.draft(body, auth), 'Drafted');
    }
    if (body.action === 'record-hearing') {
      if (!body.id || !body.hearingDate) return badRequest('id and hearingDate required');
      return ok(
        await erDisciplinaryService.recordHearing(
          body.id,
          new Date(body.hearingDate),
          body.responseRecorded ?? true,
          auth
        ),
        'Hearing recorded'
      );
    }
    if (body.action === 'issue') {
      if (!body.id || !body.effectiveFrom) return badRequest('id and effectiveFrom required');
      return ok(
        await erDisciplinaryService.issue(body.id, new Date(body.effectiveFrom), auth),
        'Issued'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update disciplinary action', err);
  }
});
