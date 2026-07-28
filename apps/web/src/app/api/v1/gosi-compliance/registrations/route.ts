import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { gosiRegistrationService } from '@/lib/services/gosi-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read', 'employee:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    if (action === 'preview-employee') {
      const employeeId = url.searchParams.get('employeeId');
      if (!employeeId) return badRequest('employeeId required');
      const preview = await gosiRegistrationService.getEmployeePreview(
        employeeId,
        ctx.user.tenantId
      );
      return ok(preview);
    }
    return ok(
      await gosiRegistrationService.list(
        ctx.user.tenantId,
        {
          status: url.searchParams.get('status') ?? undefined,
          nationalityClass: url.searchParams.get('nationalityClass') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list registrations/preview employee', err);
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
      return ok(await gosiRegistrationService.register(body, auth), 'Registered');
    }
    if (body.action === 'deregister') {
      if (!body.employeeId || !body.reason) return badRequest('employeeId/reason required');
      return ok(
        await gosiRegistrationService.deregister(
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
