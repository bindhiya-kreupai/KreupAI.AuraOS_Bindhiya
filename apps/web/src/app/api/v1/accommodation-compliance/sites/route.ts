import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { accommodationSiteService } from '@/lib/services/accommodation-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (
    !ctx.roles.includes('SUPER_ADMIN') &&
    !ctx.roles.includes('ADMIN') &&
    !hasAny(ctx.permissions, 'tenant:read', 'dashboard:read', 'employees:read')
  )
    return forbidden();
  try {
    const url = new URL(req.url);
    const filter = {
      country: url.searchParams.get('country') ?? undefined,
      siteType: url.searchParams.get('siteType') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      search: url.searchParams.get('search') ?? undefined,
      isDeleted: url.searchParams.get('isDeleted') === 'true',
    };
    const paging = {
      page: Number(url.searchParams.get('page') ?? '1'),
      pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
      sort: url.searchParams.get('sort') ? JSON.parse(url.searchParams.get('sort')!) : undefined,
    };
    return ok(await accommodationSiteService.list(ctx.user.tenantId, filter, paging));
  } catch (err) {
    return serverError('Failed to list sites', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (
    !ctx.roles.includes('SUPER_ADMIN') &&
    !ctx.roles.includes('ADMIN') &&
    !hasAny(ctx.permissions, 'tenant:manage', 'employees:manage')
  )
    return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };

    if (body.action === 'upsert') {
      for (const f of ['name', 'siteType', 'country', 'totalCapacity']) {
        if (body[f] == null) return badRequest(`${f} required`);
      }
      return ok(
        await accommodationSiteService.upsert(
          {
            ...body,
            nextInspectionAt: body.nextInspectionAt ? new Date(body.nextInspectionAt) : undefined,
          },
          auth
        ),
        'Saved'
      );
    }

    if (body.action === 'archive') {
      if (!body.id) return badRequest('id required');
      return ok(await accommodationSiteService.archive(body.id, auth), 'Archived');
    }

    if (body.action === 'restore') {
      if (!body.id) return badRequest('id required');
      return ok(await accommodationSiteService.restore(body.id, auth), 'Restored');
    }

    if (body.action === 'delete') {
      if (!body.id) return badRequest('id required');
      return ok(await accommodationSiteService.softDelete(body.id, auth), 'Deleted');
    }

    if (body.action === 'hard-delete') {
      if (!body.id) return badRequest('id required');
      return ok(await accommodationSiteService.hardDelete(body.id, auth), 'Hard Deleted');
    }

    if (body.action === 'bulk-archive') {
      if (!Array.isArray(body.ids)) return badRequest('ids array required');
      return ok(await accommodationSiteService.bulkArchive(body.ids, auth), 'Bulk Archived');
    }

    if (body.action === 'bulk-restore') {
      if (!Array.isArray(body.ids)) return badRequest('ids array required');
      return ok(await accommodationSiteService.bulkRestore(body.ids, auth), 'Bulk Restored');
    }

    if (body.action === 'bulk-delete') {
      if (!Array.isArray(body.ids)) return badRequest('ids array required');
      return ok(await accommodationSiteService.bulkDelete(body.ids, auth), 'Bulk Deleted');
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update site', err);
  }
});
