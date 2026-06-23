import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { sioRegistrationService } from '@/lib/services/sio-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    if (url.searchParams.get('view') === 'bahrainization-evidence') {
      return ok({
        activeBahrainis: await sioRegistrationService.bahrainizationEvidenceCount(
          ctx.user.tenantId
        ),
      });
    }
    return ok(
      await sioRegistrationService.list(
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
    return serverError('Failed to list registrations', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'employee:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'register') {
      for (const f of ['employeeId', 'establishmentId', 'nationalityClass']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(await sioRegistrationService.register(body, auth), 'Registered');
    }
    if (body.action === 'deregister') {
      if (!body.employeeId || !body.reason) return badRequest('employeeId/reason required');
      return ok(
        await sioRegistrationService.deregister(
          body.employeeId,
          { reason: body.reason, date: body.date ? new Date(body.date) : undefined },
          auth
        ),
        'Deregistered'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update registration', err);
  }
});
