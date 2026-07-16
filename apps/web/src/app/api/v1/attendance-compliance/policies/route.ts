import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { attendancePolicyService } from '@/lib/services/attendance-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (
    !ctx.roles?.includes('SUPER_ADMIN') &&
    !ctx.roles?.includes('ADMIN') &&
    !hasAny(ctx.permissions, 'tenant:read', 'dashboard:read', 'employees:read')
  ) {
    return forbidden();
  }
  try {
    const url = new URL(req.url);
    const filter = {
      search: url.searchParams.get('search') ?? undefined,
      country: url.searchParams.get('country') ?? undefined,
      grade: url.searchParams.get('grade') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      isDeleted: url.searchParams.get('isDeleted') === 'true',
      sortBy: url.searchParams.get('sortBy') ?? undefined,
      sortOrder: (url.searchParams.get('sortOrder') as 'asc' | 'desc') ?? undefined,
    };
    const paging = {
      page: Number(url.searchParams.get('page') ?? '1'),
      pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
    };
    return ok(await attendancePolicyService.list(ctx.user.tenantId, filter, paging));
  } catch (err) {
    return serverError('Failed to list policies', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (
    !ctx.roles?.includes('SUPER_ADMIN') &&
    !ctx.roles?.includes('ADMIN') &&
    !hasAny(ctx.permissions, 'tenant:manage', 'employees:manage')
  ) {
    return forbidden();
  }
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };

    if (body.action === 'seed-defaults') {
      return ok(
        await attendancePolicyService.seedDefaults(
          auth,
          body.effectiveFrom ? new Date(body.effectiveFrom) : undefined
        )
      );
    }

    if (body.action === 'create') {
      if (!body.country || !body.effectiveFrom) {
        return badRequest('country and effectiveFrom required');
      }
      return ok(await attendancePolicyService.create(body, auth), 'Created');
    }

    if (body.action === 'update') {
      if (!body.id) return badRequest('id required');
      return ok(await attendancePolicyService.update(body.id, body, auth), 'Updated');
    }

    if (body.action === 'archive') {
      if (!body.id) return badRequest('id required');
      return ok(await attendancePolicyService.archive(body.id, auth), 'Archived');
    }

    if (body.action === 'restore') {
      if (!body.id) return badRequest('id required');
      return ok(await attendancePolicyService.restore(body.id, auth), 'Restored');
    }

    if (body.action === 'delete') {
      if (!body.id) return badRequest('id required');
      return ok(await attendancePolicyService.hardDelete(body.id, auth), 'Deleted');
    }

    if (body.action === 'bulk-archive') {
      if (!body.ids || !Array.isArray(body.ids)) return badRequest('ids array required');
      return ok(await attendancePolicyService.bulkArchive(body.ids, auth), 'Bulk Archived');
    }

    if (body.action === 'bulk-restore') {
      if (!body.ids || !Array.isArray(body.ids)) return badRequest('ids array required');
      return ok(await attendancePolicyService.bulkRestore(body.ids, auth), 'Bulk Restored');
    }

    if (body.action === 'bulk-delete') {
      if (!body.ids || !Array.isArray(body.ids)) return badRequest('ids array required');
      return ok(await attendancePolicyService.bulkDelete(body.ids, auth), 'Bulk Deleted');
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to handle policy action', err);
  }
});
