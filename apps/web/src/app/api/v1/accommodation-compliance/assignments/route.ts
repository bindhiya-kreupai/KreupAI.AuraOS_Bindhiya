import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { accommodationAssignmentService } from '@/lib/services/accommodation-compliance';
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
      employeeId: url.searchParams.get('employeeId') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      search: url.searchParams.get('search') ?? undefined,
      checkInStart: url.searchParams.get('checkInStart') ?? undefined,
      checkInEnd: url.searchParams.get('checkInEnd') ?? undefined,
      checkOutStart: url.searchParams.get('checkOutStart') ?? undefined,
      checkOutEnd: url.searchParams.get('checkOutEnd') ?? undefined,
      isDeleted: url.searchParams.get('isDeleted') === 'true',
    };
    const paging = {
      page: Number(url.searchParams.get('page') ?? '1'),
      pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
      sort: url.searchParams.get('sort') ? JSON.parse(url.searchParams.get('sort')!) : undefined,
    };
    return ok(await accommodationAssignmentService.list(ctx.user.tenantId, filter, paging));
  } catch (err) {
    return serverError('Failed to list assignments', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (
    !ctx.roles.includes('SUPER_ADMIN') &&
    !ctx.roles.includes('ADMIN') &&
    !hasAny(ctx.permissions, 'tenant:manage', 'employee:manage', 'employees:manage')
  )
    return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };

    if (body.action === 'assign') {
      for (const f of ['siteId', 'employeeId', 'checkInAt']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await accommodationAssignmentService.assign(
          { ...body, checkInAt: new Date(body.checkInAt) },
          auth
        ),
        'Assigned'
      );
    }

    if (body.action === 'update') {
      if (!body.id) return badRequest('id required');
      return ok(
        await accommodationAssignmentService.update(
          body.id,
          {
            ...body,
            checkInAt: body.checkInAt ? new Date(body.checkInAt) : undefined,
          },
          auth
        ),
        'Updated'
      );
    }

    if (body.action === 'check-out') {
      if (!body.id || !body.checkOutAt) return badRequest('id and checkOutAt required');
      return ok(
        await accommodationAssignmentService.checkOut(body.id, new Date(body.checkOutAt), auth),
        'Checked out'
      );
    }

    if (body.action === 'archive') {
      if (!body.id) return badRequest('id required');
      return ok(await accommodationAssignmentService.archive(body.id, auth), 'Archived');
    }

    if (body.action === 'restore') {
      if (!body.id) return badRequest('id required');
      return ok(await accommodationAssignmentService.restore(body.id, auth), 'Restored');
    }

    if (body.action === 'delete') {
      if (!body.id) return badRequest('id required');
      return ok(await accommodationAssignmentService.softDelete(body.id, auth), 'Deleted');
    }

    if (body.action === 'hard-delete') {
      if (!body.id) return badRequest('id required');
      return ok(await accommodationAssignmentService.hardDelete(body.id, auth), 'Hard Deleted');
    }

    if (body.action === 'bulk-archive') {
      if (!Array.isArray(body.ids)) return badRequest('ids array required');
      return ok(await accommodationAssignmentService.bulkArchive(body.ids, auth), 'Bulk Archived');
    }

    if (body.action === 'bulk-restore') {
      if (!Array.isArray(body.ids)) return badRequest('ids array required');
      return ok(await accommodationAssignmentService.bulkRestore(body.ids, auth), 'Bulk Restored');
    }

    if (body.action === 'bulk-delete') {
      if (!Array.isArray(body.ids)) return badRequest('ids array required');
      return ok(await accommodationAssignmentService.bulkDelete(body.ids, auth), 'Bulk Deleted');
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update assignment', err);
  }
});
