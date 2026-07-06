import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { bahrainizationHireServiceExt } from '@/lib/services/bahrainization-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '25');
    const sortField = url.searchParams.get('sortField') ?? 'hireDate';
    const sortDir = (url.searchParams.get('sortDir') ?? 'desc') as 'asc' | 'desc';
    const search = url.searchParams.get('search') ?? undefined;
    const legalEntityId = url.searchParams.get('legalEntityId') ?? undefined;
    const artificialRiskOnly = url.searchParams.get('artificialRiskOnly') === 'true';
    const isBahrainiParam = url.searchParams.get('isBahraini');
    const isBahraini =
      isBahrainiParam === 'true' ? true : isBahrainiParam === 'false' ? false : undefined;
    const sioParam = url.searchParams.get('sioRegistered');
    const sioRegistered = sioParam === 'true' ? true : sioParam === 'false' ? false : undefined;
    const wageParam = url.searchParams.get('wageEvidenceLinked');
    const wageEvidenceLinked =
      wageParam === 'true' ? true : wageParam === 'false' ? false : undefined;
    const isDeletedParam = url.searchParams.get('isDeleted');
    const isDeleted = isDeletedParam === 'true' ? true : false;

    return ok(
      await bahrainizationHireServiceExt.listPaginatedExt(
        ctx.user.tenantId,
        {
          search,
          legalEntityId,
          artificialRiskOnly,
          isBahraini,
          sioRegistered,
          wageEvidenceLinked,
          isDeleted,
        },
        { page, pageSize },
        { field: sortField, dir: sortDir }
      )
    );
  } catch (err) {
    return serverError('Failed to list hires', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'employee:manage')) return forbidden();
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };

    if (body.action === 'record') {
      for (const f of ['employeeId', 'hireDate']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await bahrainizationHireServiceExt.record(
          {
            ...(body as Parameters<typeof bahrainizationHireServiceExt.record>[0]),
            hireDate: new Date(body.hireDate as string),
          },
          auth
        ),
        'Hire recorded'
      );
    }
    if (body.action === 'link-evidence') {
      if (!body.employeeId) return badRequest('employeeId required');
      return ok(
        await bahrainizationHireServiceExt.linkEvidence(
          body.employeeId as string,
          {
            sioRegistered: body.sioRegistered as boolean | undefined,
            wageEvidenceLinked: body.wageEvidenceLinked as boolean | undefined,
            tamkeenSupported: body.tamkeenSupported as boolean | undefined,
          },
          auth
        ),
        'Evidence linked'
      );
    }
    if (body.action === 'detect-artificial-risk') {
      if (!body.employeeId) return badRequest('employeeId required');
      return ok(
        await bahrainizationHireServiceExt.detectArtificialRisk(body.employeeId as string, auth),
        'Risk evaluated'
      );
    }
    if (body.action === 'archive') {
      if (!body.id) return badRequest('id required');
      return ok(
        await bahrainizationHireServiceExt.archiveHire(body.id as string, ctx.user.tenantId),
        'Archived'
      );
    }
    if (body.action === 'restore') {
      if (!body.id) return badRequest('id required');
      return ok(
        await bahrainizationHireServiceExt.restoreHire(body.id as string, ctx.user.tenantId),
        'Restored'
      );
    }
    if (body.action === 'delete') {
      if (!body.id) return badRequest('id required');
      return ok(
        await bahrainizationHireServiceExt.hardDeleteHire(body.id as string, ctx.user.tenantId),
        'Deleted'
      );
    }
    if (body.action === 'bulk-archive') {
      const ids = body.ids as string[];
      await Promise.all(
        ids.map((id) => bahrainizationHireServiceExt.archiveHire(id, ctx.user.tenantId))
      );
      return ok({ count: ids.length }, `${ids.length} records archived`);
    }
    if (body.action === 'bulk-restore') {
      const ids = body.ids as string[];
      await Promise.all(
        ids.map((id) => bahrainizationHireServiceExt.restoreHire(id, ctx.user.tenantId))
      );
      return ok({ count: ids.length }, `${ids.length} records restored`);
    }
    if (body.action === 'bulk-delete') {
      const ids = body.ids as string[];
      await Promise.all(
        ids.map((id) => bahrainizationHireServiceExt.hardDeleteHire(id, ctx.user.tenantId))
      );
      return ok({ count: ids.length }, `${ids.length} records deleted`);
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update hire', err);
  }
});
