import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { bahrainizationSnapshotService } from '@/lib/services/bahrainization-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await bahrainizationSnapshotService.list(ctx.user.tenantId, {
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
    if (!body.snapshotDate) return badRequest('snapshotDate required');
    return ok(
      await bahrainizationSnapshotService.takeSnapshot(
        { legalEntityId: body.legalEntityId, snapshotDate: new Date(body.snapshotDate) },
        { tenantId: ctx.user.tenantId, userId: ctx.user.id }
      ),
      'Snapshot taken'
    );
  } catch (err) {
    return serverError('Failed to take snapshot', err);
  }
});
