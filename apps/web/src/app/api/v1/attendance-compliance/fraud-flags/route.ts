import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { attendanceFraudService } from '@/lib/services/attendance-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (
    !ctx.roles?.includes('SUPER_ADMIN') &&
    !ctx.roles?.includes('ADMIN') &&
    !hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read')
  ) {
    return forbidden();
  }
  try {
    const url = new URL(req.url);
    const filter = {
      status: url.searchParams.get('status') ?? undefined,
      severity: url.searchParams.get('severity') ?? undefined,
      employeeId: url.searchParams.get('employeeId') ?? undefined,
      flagType: url.searchParams.get('flagType') ?? undefined,
      search: url.searchParams.get('search') ?? undefined,
      isDeleted: url.searchParams.get('isDeleted') === 'true',
      sortBy: url.searchParams.get('sortBy') ?? undefined,
      sortOrder: (url.searchParams.get('sortOrder') as 'asc' | 'desc') ?? undefined,
    };
    const paging = {
      page: Number(url.searchParams.get('page') ?? '1'),
      pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
    };
    return ok(await attendanceFraudService.list(ctx.user.tenantId, filter, paging));
  } catch (err) {
    return serverError('Failed to list fraud flags', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (
    !ctx.roles?.includes('SUPER_ADMIN') &&
    !ctx.roles?.includes('ADMIN') &&
    !hasAny(ctx.permissions, 'tenant:manage', 'risk_register:manage')
  ) {
    return forbidden();
  }
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };

    if (body.action === 'raise') {
      for (const f of ['employeeId', 'punchDate', 'flagType']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await attendanceFraudService.raise({ ...body, punchDate: new Date(body.punchDate) }, auth),
        'Raised'
      );
    }

    if (body.action === 'update') {
      if (!body.id) return badRequest('id required');
      return ok(await attendanceFraudService.update(body.id, body, auth), 'Updated');
    }

    if (body.action === 'resolve') {
      if (!body.id) return badRequest('id required');
      return ok(await attendanceFraudService.resolve(body.id, body.notes, auth), 'Resolved');
    }

    if (body.action === 'archive') {
      if (!body.id) return badRequest('id required');
      return ok(await attendanceFraudService.archive(body.id, auth), 'Archived');
    }

    if (body.action === 'restore') {
      if (!body.id) return badRequest('id required');
      return ok(await attendanceFraudService.restore(body.id, auth), 'Restored');
    }

    if (body.action === 'delete') {
      if (!body.id) return badRequest('id required');
      return ok(await attendanceFraudService.hardDelete(body.id, auth), 'Deleted');
    }

    if (body.action === 'bulk-archive') {
      if (!body.ids || !Array.isArray(body.ids)) return badRequest('ids array required');
      return ok(await attendanceFraudService.bulkArchive(body.ids, auth), 'Bulk Archived');
    }

    if (body.action === 'bulk-restore') {
      if (!body.ids || !Array.isArray(body.ids)) return badRequest('ids array required');
      return ok(await attendanceFraudService.bulkRestore(body.ids, auth), 'Bulk Restored');
    }

    if (body.action === 'bulk-delete') {
      if (!body.ids || !Array.isArray(body.ids)) return badRequest('ids array required');
      return ok(await attendanceFraudService.bulkDelete(body.ids, auth), 'Bulk Deleted');
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to handle fraud flag action', err);
  }
});
