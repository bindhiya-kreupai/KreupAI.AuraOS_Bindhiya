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
    const sortField = url.searchParams.get('sortField') ?? 'establishmentName';
    const sortDir = (url.searchParams.get('sortDir') ?? 'asc') as 'asc' | 'desc';
    const search = url.searchParams.get('search') ?? undefined;
    const sector = url.searchParams.get('sector') ?? undefined;
    const sizeBracket = url.searchParams.get('sizeBracket') ?? undefined;
    const isDeletedParam = url.searchParams.get('isDeleted');
    const isDeleted =
      isDeletedParam === 'true' ? true : isDeletedParam === 'false' ? false : undefined;
    const isInScopeParam = url.searchParams.get('isInScope');
    const isInScope =
      isInScopeParam === 'true' ? true : isInScopeParam === 'false' ? false : undefined;

    return ok(
      await bahrainizationConfigServiceExt.listPaginated(
        ctx.user.tenantId,
        { search, sector, sizeBracket, isDeleted, isInScope },
        { page, pageSize },
        { field: sortField, dir: sortDir }
      )
    );
  } catch (err) {
    return serverError('Failed to load configs', err);
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
        ids.map((id) => bahrainizationConfigServiceExt.archive(id, ctx.user.tenantId))
      );
      return ok({ count: ids.length }, `${ids.length} records archived`);
    }
    if (body.action === 'bulk-restore') {
      const ids = body.ids as string[];
      await Promise.all(
        ids.map((id) => bahrainizationConfigServiceExt.restore(id, ctx.user.tenantId))
      );
      return ok({ count: ids.length }, `${ids.length} records restored`);
    }
    if (body.action === 'bulk-delete') {
      const ids = body.ids as string[];
      await Promise.all(
        ids.map((id) => bahrainizationConfigServiceExt.hardDelete(id, ctx.user.tenantId))
      );
      return ok({ count: ids.length }, `${ids.length} records deleted`);
    }
    if (body.action === 'archive') {
      if (!body.id) return badRequest('id required');
      return ok(
        await bahrainizationConfigServiceExt.archive(body.id as string, ctx.user.tenantId),
        'Archived'
      );
    }
    if (body.action === 'restore') {
      if (!body.id) return badRequest('id required');
      return ok(
        await bahrainizationConfigServiceExt.restore(body.id as string, ctx.user.tenantId),
        'Restored'
      );
    }
    if (body.action === 'delete') {
      if (!body.id) return badRequest('id required');
      return ok(
        await bahrainizationConfigServiceExt.hardDelete(body.id as string, ctx.user.tenantId),
        'Deleted'
      );
    }

    // Upsert (create/update)
    for (const f of [
      'establishmentName',
      'sector',
      'sizeBracket',
      'bahrainiHeadcount',
      'totalHeadcount',
    ]) {
      if (body[f] == null) return badRequest(`${f} required`);
    }
    return ok(
      await bahrainizationConfigServiceExt.upsertConfig(
        {
          id: body.id as string | undefined,
          legalEntityId: body.legalEntityId as string | undefined,
          establishmentName: body.establishmentName as string,
          sector: body.sector as string,
          sizeBracket: body.sizeBracket as string,
          bahrainiHeadcount: Number(body.bahrainiHeadcount),
          totalHeadcount: Number(body.totalHeadcount),
          lmraEstablishmentId: body.lmraEstablishmentId as string | undefined,
        },
        auth
      ),
      'Config saved'
    );
  } catch (err) {
    return serverError('Failed to update config', err);
  }
});
