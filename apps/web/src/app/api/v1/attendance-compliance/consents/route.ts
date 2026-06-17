import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { attendanceConsentService } from '@/lib/services/attendance-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await attendanceConsentService.list(ctx.user.tenantId, {
        employeeId: url.searchParams.get('employeeId') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list consents', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'employee:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'grant') {
      for (const f of ['employeeId', 'consentType']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await attendanceConsentService.grant(
          body.employeeId,
          body.consentType,
          body.evidenceUrl,
          auth
        ),
        'Granted'
      );
    }
    if (body.action === 'revoke') {
      if (!body.employeeId || !body.consentType)
        return badRequest('employeeId and consentType required');
      return ok(
        await attendanceConsentService.revoke(body.employeeId, body.consentType, auth),
        'Revoked'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update consent', err);
  }
});
