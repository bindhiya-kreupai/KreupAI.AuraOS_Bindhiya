import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { hseSafetyOfficerService } from '@/lib/services/hse-visa-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await hseSafetyOfficerService.list(
        ctx.user.tenantId,
        {
          siteId: url.searchParams.get('siteId') ?? undefined,
          status: url.searchParams.get('status') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list safety officers', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action !== 'upsert') return badRequest('unknown action');
    if (!body.employeeId || !body.name) return badRequest('employeeId/name required');
    return ok(
      await hseSafetyOfficerService.upsert(
        {
          employeeId: body.employeeId,
          name: body.name,
          role: body.role,
          siteId: body.siteId,
          certificationCode: body.certificationCode,
          certificationIssuedAt: body.certificationIssuedAt
            ? new Date(body.certificationIssuedAt)
            : undefined,
          certificationExpiresAt: body.certificationExpiresAt
            ? new Date(body.certificationExpiresAt)
            : undefined,
          scope: body.scope,
          isPrimary: body.isPrimary,
        },
        auth
      ),
      'Saved'
    );
  } catch (err) {
    return serverError('Failed to update safety officer', err);
  }
});
