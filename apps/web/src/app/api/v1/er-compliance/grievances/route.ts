import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { erGrievanceService } from '@/lib/services/er-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await erGrievanceService.list(
        ctx.user.tenantId,
        {
          status: url.searchParams.get('status') ?? undefined,
          severity: url.searchParams.get('severity') ?? undefined,
          channel: url.searchParams.get('channel') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list grievances', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'risk_register:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'raise') {
      for (const field of ['caseNumber', 'channel', 'grievanceType', 'subject']) {
        if (!body[field]) {
          return badRequest(`${field} required`);
        }
      }

      const grievanceData = {
        caseNumber: body.caseNumber,
        channel: body.channel,
        grievanceType: body.grievanceType,
        severity: body.severity,
        subject: body.subject,
        description: body.description,
        complainantId: body.complainantId,
        respondentId: body.respondentId,
        isWhistleblower: body.isWhistleblower,
        country: body.country,
        slaDays: body.slaDays,
      };

      return ok(await erGrievanceService.raise(grievanceData, auth), 'Raised');
    }
    if (body.action === 'assign') {
      if (!body.id || !body.assigneeId) return badRequest('id and assigneeId required');
      return ok(await erGrievanceService.assign(body.id, body.assigneeId, auth));
    }
    if (body.action === 'resolve') {
      if (!body.id || !body.outcome) return badRequest('id and outcome required');
      return ok(await erGrievanceService.resolve(body.id, body.outcome, auth), 'Resolved');
    }
    if (body.action === 'refer-to-authority') {
      if (!body.id || !body.reference) return badRequest('id and reference required');
      return ok(await erGrievanceService.referToAuthority(body.id, body.reference, auth));
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update grievance', err);
  }
});
