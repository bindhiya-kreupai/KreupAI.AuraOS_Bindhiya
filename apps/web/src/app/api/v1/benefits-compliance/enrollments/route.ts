import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  benefitCoverageService,
  benefitExceptionService,
} from '@/lib/services/benefits-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const resource = url.searchParams.get('resource') ?? 'coverage';
    if (resource === 'exceptions') {
      return ok(
        await benefitExceptionService.list(ctx.user.tenantId, {
          status: url.searchParams.get('status') ?? undefined,
        })
      );
    }
    return ok(
      await benefitCoverageService.list(ctx.user.tenantId, {
        employeeId: url.searchParams.get('employeeId') ?? undefined,
        expiringSoon: url.searchParams.get('expiringSoon') === 'true',
        status: url.searchParams.get('status') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'employee:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'enroll') {
      for (const f of ['employeeId', 'benefitCode', 'startedAt']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await benefitCoverageService.enroll(
          {
            ...body,
            startedAt: new Date(body.startedAt),
            expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
          },
          auth
        ),
        'Enrolled'
      );
    }
    if (body.action === 'renew') {
      if (!body.id || !body.expiresAt) return badRequest('id and expiresAt required');
      return ok(
        await benefitCoverageService.renew(body.id, new Date(body.expiresAt), auth),
        'Renewed'
      );
    }
    if (body.action === 'terminate') {
      if (!body.id || !body.endsAt) return badRequest('id and endsAt required');
      return ok(
        await benefitCoverageService.terminate(body.id, new Date(body.endsAt), auth),
        'Terminated'
      );
    }
    if (body.action === 'accrue') {
      if (!body.id) return badRequest('id required');
      return ok(await benefitCoverageService.accrue(body.id, auth), 'Accrued');
    }
    if (body.action === 'raise-exception') {
      for (const f of ['employeeId', 'benefitCode', 'exceptionType']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await benefitExceptionService.raise(
          {
            ...body,
            expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
          },
          auth
        ),
        'Raised'
      );
    }
    if (body.action === 'close-exception') {
      if (!body.id) return badRequest('id required');
      return ok(await benefitExceptionService.close(body.id, auth), 'Closed');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update', err);
  }
});
