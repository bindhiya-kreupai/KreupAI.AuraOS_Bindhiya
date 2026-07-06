import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { bahrainizationSnapshotServiceExt } from '@/lib/services/bahrainization-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '25');
    const sortField = url.searchParams.get('sortField') ?? 'snapshotDate';
    const sortDir = (url.searchParams.get('sortDir') ?? 'desc') as 'asc' | 'desc';
    const legalEntityId = url.searchParams.get('legalEntityId') ?? undefined;
    const ragStatus = url.searchParams.get('ragStatus') ?? undefined;
    const lmraGatedParam = url.searchParams.get('lmraGated');
    const lmraGated =
      lmraGatedParam === 'true' ? true : lmraGatedParam === 'false' ? false : undefined;
    const tenderParam = url.searchParams.get('tenderEligible');
    const tenderEligible =
      tenderParam === 'true' ? true : tenderParam === 'false' ? false : undefined;
    const dateFrom = url.searchParams.get('dateFrom') ?? undefined;
    const dateTo = url.searchParams.get('dateTo') ?? undefined;

    return ok(
      await bahrainizationSnapshotServiceExt.listPaginated(
        ctx.user.tenantId,
        { legalEntityId, ragStatus, lmraGated, tenderEligible, dateFrom, dateTo },
        { page, pageSize },
        { field: sortField, dir: sortDir }
      )
    );
  } catch (err) {
    return serverError('Failed to list snapshots', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'risk_register:manage')) return forbidden();
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };

    if (body.action === 'take' || !body.action) {
      if (!body.snapshotDate) return badRequest('snapshotDate required');
      return ok(
        await bahrainizationSnapshotServiceExt.takeSnapshot(
          {
            legalEntityId: body.legalEntityId as string | undefined,
            snapshotDate: new Date(body.snapshotDate as string),
          },
          auth
        ),
        'Snapshot taken'
      );
    }
    if (body.action === 'delete') {
      if (!body.id) return badRequest('id required');
      return ok(
        await bahrainizationSnapshotServiceExt.deleteSnapshot(body.id as string, ctx.user.tenantId),
        'Deleted'
      );
    }
    if (body.action === 'bulk-delete') {
      const ids = body.ids as string[];
      await Promise.all(
        ids.map((id) => bahrainizationSnapshotServiceExt.deleteSnapshot(id, ctx.user.tenantId))
      );
      return ok({ count: ids.length }, `${ids.length} records deleted`);
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update snapshot', err);
  }
});
