import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { separationRetentionPolicyService } from '@/lib/services/structural-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await separationRetentionPolicyService.list(ctx.user.tenantId, {
        country: url.searchParams.get('country') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list separation retention policies', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action !== 'upsert') return badRequest('unknown action');
    if (!body.recordType || body.retentionYears == null || !body.effectiveFrom) {
      return badRequest('recordType/retentionYears/effectiveFrom required');
    }
    return ok(
      await separationRetentionPolicyService.upsert(
        {
          country: body.country,
          recordType: body.recordType,
          retentionYears: body.retentionYears,
          classification: body.classification,
          disposalMethod: body.disposalMethod,
          legalBasis: body.legalBasis,
          effectiveFrom: new Date(body.effectiveFrom),
          effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : undefined,
        },
        auth
      ),
      'Saved'
    );
  } catch (err) {
    return serverError('Failed to update retention policy', err);
  }
});
