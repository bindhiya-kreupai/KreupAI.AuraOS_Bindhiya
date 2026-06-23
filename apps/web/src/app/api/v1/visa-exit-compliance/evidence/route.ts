import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { visaExitEvidenceService } from '@/lib/services/visa-exit-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await visaExitEvidenceService.list(
        ctx.user.tenantId,
        url.searchParams.get('caseId') ?? undefined,
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
  if (!hasAny(ctx.permissions, 'tenant:manage', 'employee:manage')) return forbidden();
  try {
    const body = await req.json();
    if (!body.caseId || !body.portal || !body.evidenceType)
      return badRequest('caseId, portal, evidenceType required');
    return ok(
      await visaExitEvidenceService.capture(
        {
          ...body,
          validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
        },
        { tenantId: ctx.user.tenantId, userId: ctx.user.id }
      ),
      'Captured'
    );
  } catch (err) {
    return serverError('Failed to capture evidence', err);
  }
});
