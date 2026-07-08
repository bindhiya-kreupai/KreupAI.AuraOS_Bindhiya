import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  benefitCoverageService,
  benefitExceptionService,
} from '@/lib/services/benefits-compliance';
import { prisma } from '@aura/database';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const resource = url.searchParams.get('resource') ?? 'coverage';
    if (resource === 'exceptions') {
      return ok(
        await benefitExceptionService.list(ctx.user.tenantId, {
          status: url.searchParams.get('status') ?? undefined,
        })
      );
    }
    return ok(
      await benefitCoverageService.list(
        ctx.user.tenantId,
        {
          employeeId: url.searchParams.get('employeeId') ?? undefined,
          expiringSoon: url.searchParams.get('expiringSoon') === 'true',
          status: url.searchParams.get('status') ?? undefined,
          search: url.searchParams.get('search') ?? undefined,
          benefitType: url.searchParams.get('benefitType') ?? undefined,
          countryCode: url.searchParams.get('countryCode') ?? undefined,
          vendorId: url.searchParams.get('vendorId') ?? undefined,
          showDeleted: url.searchParams.get('showDeleted') === 'true',
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'employee:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };

    if (body.action === 'enroll') {
      for (const f of ['employeeId', 'benefitCode', 'startedAt']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await benefitCoverageService.enroll(
          {
            ...body,
            startedAt: new Date(body.startedAt),
            expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
          },
          auth
        ),
        'Enrolled'
      );
    }

    if (body.action === 'renew') {
      if (!body.id || !body.expiresAt) return badRequest('id and expiresAt required');
      return ok(
        await benefitCoverageService.renew(body.id, new Date(body.expiresAt), auth),
        'Renewed'
      );
    }

    if (body.action === 'terminate') {
      if (!body.id || !body.endsAt) return badRequest('id and endsAt required');
      return ok(
        await benefitCoverageService.terminate(body.id, new Date(body.endsAt), auth),
        'Terminated'
      );
    }

    if (body.action === 'suspend') {
      if (!body.id) return badRequest('id required');
      return ok(await benefitCoverageService.suspend(body.id, auth), 'Suspended');
    }

    if (body.action === 'resume') {
      if (!body.id) return badRequest('id required');
      return ok(await benefitCoverageService.resume(body.id, auth), 'Resumed');
    }

    if (body.action === 'accrue') {
      if (!body.id) return badRequest('id required');
      return ok(await benefitCoverageService.accrue(body.id, auth), 'Accrued');
    }

    if (body.action === 'raise-exception') {
      for (const f of ['employeeId', 'benefitCode', 'exceptionType']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await benefitExceptionService.raise(
          {
            ...body,
            expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
          },
          auth
        ),
        'Raised'
      );
    }

    if (body.action === 'close-exception') {
      if (!body.id) return badRequest('id required');
      return ok(await benefitExceptionService.close(body.id, auth), 'Closed');
    }

    // Bulk actions
    if (body.action === 'bulk-archive') {
      if (!body.ids || !Array.isArray(body.ids)) return badRequest('ids array required');
      await (prisma as any).benefitCoverage.updateMany({
        where: { id: { in: body.ids }, tenantId: auth.tenantId },
        data: { isDeleted: true, deletedAt: new Date() },
      });
      return ok({ count: body.ids.length }, 'Archived successfully');
    }

    if (body.action === 'bulk-restore') {
      if (!body.ids || !Array.isArray(body.ids)) return badRequest('ids array required');
      await (prisma as any).benefitCoverage.updateMany({
        where: { id: { in: body.ids }, tenantId: auth.tenantId },
        data: { isDeleted: false, deletedAt: null },
      });
      return ok({ count: body.ids.length }, 'Restored successfully');
    }

    if (body.action === 'bulk-delete') {
      if (!body.ids || !Array.isArray(body.ids)) return badRequest('ids array required');
      // For safety, bulk delete does soft-delete first. If user wants a hard delete, they can do it.
      await (prisma as any).benefitCoverage.updateMany({
        where: { id: { in: body.ids }, tenantId: auth.tenantId },
        data: { isDeleted: true, deletedAt: new Date(), status: 'TERMINATED' },
      });
      return ok({ count: body.ids.length }, 'Deleted successfully');
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update', err);
  }
});
