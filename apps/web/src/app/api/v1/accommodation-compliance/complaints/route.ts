import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { accommodationComplaintService } from '@/lib/services/accommodation-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (
    !ctx.roles.includes('SUPER_ADMIN') &&
    !ctx.roles.includes('ADMIN') &&
    !hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'employees:read', 'dashboard:read')
  )
    return forbidden();
  try {
    const url = new URL(req.url);
    const filter = {
      siteId: url.searchParams.get('siteId') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      severity: url.searchParams.get('severity') ?? undefined,
      category: url.searchParams.get('category') ?? undefined,
      assigneeId: url.searchParams.get('assigneeId') ?? undefined,
      employeeId: url.searchParams.get('employeeId') ?? undefined,
      search: url.searchParams.get('search') ?? undefined,
      raisedAtStart: url.searchParams.get('raisedAtStart') ?? undefined,
      raisedAtEnd: url.searchParams.get('raisedAtEnd') ?? undefined,
      isDeleted: url.searchParams.get('isDeleted') === 'true',
    };
    const paging = {
      page: Number(url.searchParams.get('page') ?? '1'),
      pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
      sort: url.searchParams.get('sort') ? JSON.parse(url.searchParams.get('sort')!) : undefined,
    };
    return ok(await accommodationComplaintService.list(ctx.user.tenantId, filter, paging));
  } catch (err) {
    return serverError('Failed to list complaints', err);
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

    if (body.action === 'raise') {
      for (const f of ['siteId', 'category', 'subject']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(await accommodationComplaintService.raise(body, auth), 'Raised');
    }

    if (body.action === 'update') {
      if (!body.id) return badRequest('id required');
      return ok(await accommodationComplaintService.update(body.id, body, auth), 'Updated');
    }

    if (body.action === 'assign') {
      if (!body.id || !body.assigneeId) return badRequest('id and assigneeId required');
      return ok(
        await accommodationComplaintService.assign(body.id, body.assigneeId, auth),
        'Assigned'
      );
    }

    if (body.action === 'resolve') {
      if (!body.id) return badRequest('id required');
      return ok(await accommodationComplaintService.resolve(body.id, body.notes, auth), 'Resolved');
    }

    if (body.action === 'archive') {
      if (!body.id) return badRequest('id required');
      return ok(await accommodationComplaintService.archive(body.id, auth), 'Archived');
    }

    if (body.action === 'restore') {
      if (!body.id) return badRequest('id required');
      return ok(await accommodationComplaintService.restore(body.id, auth), 'Restored');
    }

    if (body.action === 'delete') {
      if (!body.id) return badRequest('id required');
      return ok(await accommodationComplaintService.softDelete(body.id, auth), 'Deleted');
    }

    if (body.action === 'hard-delete') {
      if (!body.id) return badRequest('id required');
      return ok(await accommodationComplaintService.hardDelete(body.id, auth), 'Hard Deleted');
    }

    if (body.action === 'bulk-archive') {
      if (!Array.isArray(body.ids)) return badRequest('ids array required');
      return ok(await accommodationComplaintService.bulkArchive(body.ids, auth), 'Bulk Archived');
    }

    if (body.action === 'bulk-restore') {
      if (!Array.isArray(body.ids)) return badRequest('ids array required');
      return ok(await accommodationComplaintService.bulkRestore(body.ids, auth), 'Bulk Restored');
    }

    if (body.action === 'bulk-delete') {
      if (!Array.isArray(body.ids)) return badRequest('ids array required');
      return ok(await accommodationComplaintService.bulkDelete(body.ids, auth), 'Bulk Deleted');
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update complaint', err);
  }
});
