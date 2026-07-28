import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { leaveMedicalEvidenceService } from '@/lib/services/leave-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await leaveMedicalEvidenceService.list(
        ctx.user.tenantId,
        {
          leaveRequestId: url.searchParams.get('leaveRequestId') ?? undefined,
          employeeId: url.searchParams.get('employeeId') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list evidence', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (
    !hasAny(
      ctx.permissions,
      'tenant:manage',
      'tenant:read',
      'employee:manage',
      'employee:read',
      'dashboard:read',
      'leave:manage'
    )
  )
    return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'capture') {
      for (const f of ['leaveRequestId', 'employeeId', 'evidenceType']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await leaveMedicalEvidenceService.capture(
          { ...body, issuedAt: body.issuedAt ? new Date(body.issuedAt) : undefined },
          auth
        ),
        'Captured'
      );
    }
    if (body.action === 'verify') {
      if (!body.id) return badRequest('id required');
      return ok(await leaveMedicalEvidenceService.verify(body.id, auth), 'Verified');
    }
    if (body.action === 'flag-fraud') {
      if (!body.id) return badRequest('id required');
      return ok(await leaveMedicalEvidenceService.flagFraud(body.id, auth));
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update evidence', err);
  }
});
