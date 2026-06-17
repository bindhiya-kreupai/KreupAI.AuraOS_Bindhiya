import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { redundancyBatchService } from '@/lib/services/structural-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await redundancyBatchService.list(ctx.user.tenantId, {
        status: url.searchParams.get('status') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list redundancy batches', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (!body.batchCode || !body.label || !body.country || !body.scope) {
        return badRequest('batchCode/label/country/scope required');
      }
      return ok(
        await redundancyBatchService.upsert(
          {
            batchCode: body.batchCode,
            label: body.label,
            country: body.country,
            scope: body.scope,
            selectionCriteria: body.selectionCriteria,
            impactedHeadcount: body.impactedHeadcount,
            consultationStartAt: body.consultationStartAt
              ? new Date(body.consultationStartAt)
              : undefined,
            consultationEndAt: body.consultationEndAt
              ? new Date(body.consultationEndAt)
              : undefined,
            noticeDate: body.noticeDate ? new Date(body.noticeDate) : undefined,
            effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : undefined,
          },
          auth
        ),
        'Saved'
      );
    }
    if (body.action === 'transition') {
      if (!body.id || !body.status) return badRequest('id/status required');
      return ok(
        await redundancyBatchService.transition(body.id, body.status, auth),
        'Transitioned'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update redundancy batch', err);
  }
});
