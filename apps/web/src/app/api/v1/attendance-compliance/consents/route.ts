import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { attendanceConsentService } from '@/lib/services/attendance-compliance';
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
      employeeId: url.searchParams.get('employeeId') ?? undefined,
      consentType: url.searchParams.get('consentType') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      search: url.searchParams.get('search') ?? undefined,
      isDeleted: url.searchParams.get('isDeleted') === 'true',
      sortBy: url.searchParams.get('sortBy') ?? undefined,
      sortOrder: (url.searchParams.get('sortOrder') as 'asc' | 'desc') ?? undefined,
    };
    const paging = {
      page: Number(url.searchParams.get('page') ?? '1'),
      pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
    };
    return ok(await attendanceConsentService.list(ctx.user.tenantId, filter, paging));
  } catch (err) {
    return serverError('Failed to list consents', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (
    !ctx.roles?.includes('SUPER_ADMIN') &&
    !ctx.roles?.includes('ADMIN') &&
    !hasAny(ctx.permissions, 'tenant:manage', 'employee:manage')
  ) {
    return forbidden();
  }
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };

    if (body.action === 'grant' || body.action === 'create') {
      for (const f of ['employeeId', 'consentType']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await attendanceConsentService.grant(
          body.employeeId,
          body.consentType,
          body.evidenceUrl,
          auth
        ),
        'Granted'
      );
    }

    if (body.action === 'revoke') {
      if (!body.employeeId || !body.consentType) {
        return badRequest('employeeId and consentType required');
      }
      return ok(
        await attendanceConsentService.revoke(body.employeeId, body.consentType, auth),
        'Revoked'
      );
    }

    if (body.action === 'update') {
      if (!body.id) return badRequest('id required');
      return ok(await attendanceConsentService.update(body.id, body, auth), 'Updated');
    }

    if (body.action === 'archive') {
      if (!body.id) return badRequest('id required');
      return ok(await attendanceConsentService.archive(body.id, auth), 'Archived');
    }

    if (body.action === 'restore') {
      if (!body.id) return badRequest('id required');
      return ok(await attendanceConsentService.restore(body.id, auth), 'Restored');
    }

    if (body.action === 'delete') {
      if (!body.id) return badRequest('id required');
      return ok(await attendanceConsentService.hardDelete(body.id, auth), 'Deleted');
    }

    if (body.action === 'bulk-archive') {
      if (!body.ids || !Array.isArray(body.ids)) return badRequest('ids array required');
      return ok(await attendanceConsentService.bulkArchive(body.ids, auth), 'Bulk Archived');
    }

    if (body.action === 'bulk-restore') {
      if (!body.ids || !Array.isArray(body.ids)) return badRequest('ids array required');
      return ok(await attendanceConsentService.bulkRestore(body.ids, auth), 'Bulk Restored');
    }

    if (body.action === 'bulk-delete') {
      if (!body.ids || !Array.isArray(body.ids)) return badRequest('ids array required');
      return ok(await attendanceConsentService.bulkDelete(body.ids, auth), 'Bulk Deleted');
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to handle consent action', err);
  }
});
