import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { emiratisationSnapshotService } from '@/lib/services/emiratisation-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await emiratisationSnapshotService.list(ctx.user.tenantId, {
        legalEntityId: url.searchParams.get('legalEntityId') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list snapshots', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'risk_register:manage')) return forbidden();
  try {
    const body = await req.json();
    for (const f of ['checkpointDate', 'checkpoint', 'year']) {
      if (body[f] == null) return badRequest(`${f} required`);
    }
    return ok(
      await emiratisationSnapshotService.takeSnapshot(
        { ...body, checkpointDate: new Date(body.checkpointDate) },
        { tenantId: ctx.user.tenantId, userId: ctx.user.id }
      ),
      'Snapshot taken'
    );
  } catch (err) {
    return serverError('Failed to take snapshot', err);
  }
});
