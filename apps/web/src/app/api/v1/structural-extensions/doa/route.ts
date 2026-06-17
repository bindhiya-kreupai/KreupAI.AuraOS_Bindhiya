import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { delegationOfAuthorityService } from '@/lib/services/structural-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await delegationOfAuthorityService.list(
        ctx.user.tenantId,
        {
          domain: url.searchParams.get('domain') ?? undefined,
          actionCode: url.searchParams.get('actionCode') ?? undefined,
          isActive:
            url.searchParams.get('isActive') === null
              ? undefined
              : url.searchParams.get('isActive') === 'true',
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list DoA matrix', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action !== 'upsert') return badRequest('unknown action');
    if (
      !body.domain ||
      !body.actionCode ||
      !body.label ||
      body.level == null ||
      !body.minRole ||
      !body.effectiveFrom
    ) {
      return badRequest('domain/actionCode/label/level/minRole/effectiveFrom required');
    }
    return ok(
      await delegationOfAuthorityService.upsert(
        {
          domain: body.domain,
          actionCode: body.actionCode,
          label: body.label,
          level: body.level,
          minRole: body.minRole,
          thresholdAmount: body.thresholdAmount,
          currency: body.currency,
          country: body.country,
          effectiveFrom: new Date(body.effectiveFrom),
          effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : undefined,
        },
        auth
      ),
      'Saved'
    );
  } catch (err) {
    return serverError('Failed to update DoA', err);
  }
});
