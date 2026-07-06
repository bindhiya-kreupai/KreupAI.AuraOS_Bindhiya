import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { attendanceCertificateService } from '@/lib/services/attendance-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (
    !ctx.roles?.includes('SUPER_ADMIN') &&
    !ctx.roles?.includes('ADMIN') &&
    !hasAny(ctx.permissions, 'compliance_kpi:read', 'dashboard:read')
  ) {
    return forbidden();
  }
  try {
    const url = new URL(req.url);
    const filter = {
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
    return ok(await attendanceCertificateService.list(ctx.user.tenantId, filter, paging));
  } catch (err) {
    return serverError('Failed to list certificates', err);
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

    if (body.action === 'generate') {
      if (!body.period) return badRequest('period required');
      return ok(await attendanceCertificateService.generate(body.period, auth), 'Generated');
    }

    if (body.action === 'sign') {
      if (!body.period) return badRequest('period required');
      return ok(
        await attendanceCertificateService.sign(body.period, body.attestations ?? [], auth),
        'Signed'
      );
    }

    if (body.action === 'archive') {
      if (!body.id) return badRequest('id required');
      return ok(await attendanceCertificateService.archive(body.id, auth), 'Archived');
    }

    if (body.action === 'restore') {
      if (!body.id) return badRequest('id required');
      return ok(await attendanceCertificateService.restore(body.id, auth), 'Restored');
    }

    if (body.action === 'delete') {
      if (!body.id) return badRequest('id required');
      return ok(await attendanceCertificateService.hardDelete(body.id, auth), 'Deleted');
    }

    if (body.action === 'bulk-archive') {
      if (!body.ids || !Array.isArray(body.ids)) return badRequest('ids array required');
      return ok(await attendanceCertificateService.bulkArchive(body.ids, auth), 'Bulk Archived');
    }

    if (body.action === 'bulk-restore') {
      if (!body.ids || !Array.isArray(body.ids)) return badRequest('ids array required');
      return ok(await attendanceCertificateService.bulkRestore(body.ids, auth), 'Bulk Restored');
    }

    if (body.action === 'bulk-delete') {
      if (!body.ids || !Array.isArray(body.ids)) return badRequest('ids array required');
      return ok(await attendanceCertificateService.bulkDelete(body.ids, auth), 'Bulk Deleted');
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to handle certificate action', err);
  }
});
