import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { accommodationInspectionService } from '@/lib/services/accommodation-compliance';
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
      siteId: url.searchParams.get('siteId') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      category: url.searchParams.get('category') ?? undefined,
      search: url.searchParams.get('search') ?? undefined,
      inspectionDateStart: url.searchParams.get('inspectionDateStart') ?? undefined,
      inspectionDateEnd: url.searchParams.get('inspectionDateEnd') ?? undefined,
      isDeleted: url.searchParams.get('isDeleted') === 'true',
    };
    const paging = {
      page: Number(url.searchParams.get('page') ?? '1'),
      pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
      sort: url.searchParams.get('sort') ? JSON.parse(url.searchParams.get('sort')!) : undefined,
    };
    return ok(await accommodationInspectionService.list(ctx.user.tenantId, filter, paging));
  } catch (err) {
    return serverError('Failed to list inspections', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (
    !ctx.roles.includes('SUPER_ADMIN') &&
    !ctx.roles.includes('ADMIN') &&
    !hasAny(ctx.permissions, 'tenant:manage', 'risk_register:manage', 'employees:manage')
  )
    return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };

    if (body.action === 'record') {
      for (const f of ['siteId', 'inspectionDate', 'category', 'score']) {
        if (body[f] == null) return badRequest(`${f} required`);
      }
      return ok(
        await accommodationInspectionService.record(
          { ...body, inspectionDate: new Date(body.inspectionDate) },
          auth
        ),
        'Recorded'
      );
    }

    if (body.action === 'update') {
      if (!body.id) return badRequest('id required');
      return ok(
        await accommodationInspectionService.update(
          body.id,
          {
            ...body,
            inspectionDate: body.inspectionDate ? new Date(body.inspectionDate) : undefined,
          },
          auth
        ),
        'Updated'
      );
    }

    if (body.action === 'close') {
      if (!body.id) return badRequest('id required');
      return ok(await accommodationInspectionService.close(body.id, auth), 'Closed');
    }

    if (body.action === 'archive') {
      if (!body.id) return badRequest('id required');
      return ok(await accommodationInspectionService.archive(body.id, auth), 'Archived');
    }

    if (body.action === 'restore') {
      if (!body.id) return badRequest('id required');
      return ok(await accommodationInspectionService.restore(body.id, auth), 'Restored');
    }

    if (body.action === 'delete') {
      if (!body.id) return badRequest('id required');
      return ok(await accommodationInspectionService.softDelete(body.id, auth), 'Deleted');
    }

    if (body.action === 'hard-delete') {
      if (!body.id) return badRequest('id required');
      return ok(await accommodationInspectionService.hardDelete(body.id, auth), 'Hard Deleted');
    }

    if (body.action === 'bulk-archive') {
      if (!Array.isArray(body.ids)) return badRequest('ids array required');
      return ok(await accommodationInspectionService.bulkArchive(body.ids, auth), 'Bulk Archived');
    }

    if (body.action === 'bulk-restore') {
      if (!Array.isArray(body.ids)) return badRequest('ids array required');
      return ok(await accommodationInspectionService.bulkRestore(body.ids, auth), 'Bulk Restored');
    }

    if (body.action === 'bulk-delete') {
      if (!Array.isArray(body.ids)) return badRequest('ids array required');
      return ok(await accommodationInspectionService.bulkDelete(body.ids, auth), 'Bulk Deleted');
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update inspection', err);
  }
});
