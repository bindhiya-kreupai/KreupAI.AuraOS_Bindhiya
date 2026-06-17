import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { nitaqatHireService } from '@/lib/services/nitaqat-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await nitaqatHireService.list(
        ctx.user.tenantId,
        {
          legalEntityId: url.searchParams.get('legalEntityId') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list hires', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'employee:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'record') {
      for (const f of ['employeeId', 'hireDate']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await nitaqatHireService.record({ ...body, hireDate: new Date(body.hireDate) }, auth),
        'Hire recorded'
      );
    }
    if (body.action === 'link-evidence') {
      if (!body.employeeId) return badRequest('employeeId required');
      return ok(
        await nitaqatHireService.linkEvidence(
          body.employeeId,
          { gosiRegistered: body.gosiRegistered, mudadCovered: body.mudadCovered },
          auth
        ),
        'Evidence linked'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update hire', err);
  }
});
