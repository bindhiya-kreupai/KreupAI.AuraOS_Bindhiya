import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { bahrainizationConfigServiceExt } from '@/lib/services/bahrainization-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '25');
    const sortField = url.searchParams.get('sortField') ?? 'sector';
    const sortDir = (url.searchParams.get('sortDir') ?? 'asc') as 'asc' | 'desc';
    const search = url.searchParams.get('search') ?? undefined;
    const sector = url.searchParams.get('sector') ?? undefined;
    const sizeBracket = url.searchParams.get('sizeBracket') ?? undefined;
    const isDeleted = url.searchParams.get('isDeleted') === 'true';

    return ok(
      await bahrainizationConfigServiceExt.listTargetsPaginated(
        ctx.user.tenantId,
        { search, sector, sizeBracket, isDeleted },
        { page, pageSize },
        { field: sortField, dir: sortDir }
      )
    );
  } catch (err) {
    return serverError('Failed to list targets', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };

    // Bulk actions
    if (body.action === 'bulk-archive') {
      const ids = body.ids as string[];
      await Promise.all(
        ids.map((id) => bahrainizationConfigServiceExt.archiveTarget(id, ctx.user.tenantId))
      );
      return ok({ count: ids.length }, `${ids.length} records archived`);
    }
    if (body.action === 'bulk-restore') {
      const ids = body.ids as string[];
      await Promise.all(
        ids.map((id) =>
          bahrainizationConfigServiceExt.updateTarget(id, { status: 'ACTIVE' }, ctx.user.tenantId)
        )
      );
      return ok({ count: ids.length }, `${ids.length} records restored`);
    }
    if (body.action === 'bulk-delete') {
      const ids = body.ids as string[];
      await Promise.all(
        ids.map((id) => bahrainizationConfigServiceExt.deleteTarget(id, ctx.user.tenantId))
      );
      return ok({ count: ids.length }, `${ids.length} records deleted`);
    }

    if (body.action === 'seed-defaults') {
      return ok(
        await bahrainizationConfigServiceExt.seedDefaultTargets(
          auth,
          body.effectiveFrom ? new Date(body.effectiveFrom as string) : undefined
        )
      );
    }
    if (body.action === 'create') {
      for (const f of ['sector', 'sizeBracket', 'targetRatioPct', 'effectiveFrom']) {
        if (body[f] == null) return badRequest(`${f} required`);
      }
      return ok(
        await bahrainizationConfigServiceExt.createTarget(
          {
            sector: body.sector as string,
            sizeBracket: body.sizeBracket as string,
            targetRatioPct: Number(body.targetRatioPct),
            tenderEligibilityMinPct: body.tenderEligibilityMinPct
              ? Number(body.tenderEligibilityMinPct)
              : undefined,
            effectiveFrom: new Date(body.effectiveFrom as string),
            effectiveTo: body.effectiveTo ? new Date(body.effectiveTo as string) : undefined,
            basis: body.basis as string | undefined,
          },
          auth
        ),
        'Target created'
      );
    }
    if (body.action === 'update') {
      if (!body.id) return badRequest('id required');
      return ok(
        await bahrainizationConfigServiceExt.updateTarget(
          body.id as string,
          {
            targetRatioPct: body.targetRatioPct ? Number(body.targetRatioPct) : undefined,
            tenderEligibilityMinPct: body.tenderEligibilityMinPct
              ? Number(body.tenderEligibilityMinPct)
              : undefined,
            effectiveFrom: body.effectiveFrom ? new Date(body.effectiveFrom as string) : undefined,
            effectiveTo: body.effectiveTo ? new Date(body.effectiveTo as string) : undefined,
            basis: body.basis as string | undefined,
          },
          ctx.user.tenantId
        ),
        'Target updated'
      );
    }
    if (body.action === 'archive') {
      if (!body.id) return badRequest('id required');
      return ok(
        await bahrainizationConfigServiceExt.archiveTarget(body.id as string, ctx.user.tenantId),
        'Archived'
      );
    }
    if (body.action === 'restore') {
      if (!body.id) return badRequest('id required');
      return ok(
        await bahrainizationConfigServiceExt.updateTarget(
          body.id as string,
          { status: 'ACTIVE' },
          ctx.user.tenantId
        ),
        'Restored'
      );
    }
    if (body.action === 'delete') {
      if (!body.id) return badRequest('id required');
      return ok(
        await bahrainizationConfigServiceExt.deleteTarget(body.id as string, ctx.user.tenantId),
        'Deleted'
      );
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update targets', err);
  }
});
