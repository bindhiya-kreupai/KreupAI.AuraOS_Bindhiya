import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { bahrainizationCertificateServiceExt } from '@/lib/services/bahrainization-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'compliance_kpi:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '25');
    const sortField = url.searchParams.get('sortField') ?? 'period';
    const sortDir = (url.searchParams.get('sortDir') ?? 'desc') as 'asc' | 'desc';
    const status = url.searchParams.get('status') ?? undefined;
    const periodFrom = url.searchParams.get('periodFrom') ?? undefined;
    const periodTo = url.searchParams.get('periodTo') ?? undefined;

    return ok(
      await bahrainizationCertificateServiceExt.listPaginated(
        ctx.user.tenantId,
        { status, periodFrom, periodTo },
        { page, pageSize },
        { field: sortField, dir: sortDir }
      )
    );
  } catch (err) {
    return serverError('Failed to list certificates', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'risk_register:manage')) return forbidden();
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };

    if (body.action === 'generate') {
      if (!body.period) return badRequest('period required');
      return ok(
        await bahrainizationCertificateServiceExt.generate(body.period as string, auth),
        'Generated'
      );
    }
    if (body.action === 'sign') {
      if (!body.period) return badRequest('period required');
      return ok(
        await bahrainizationCertificateServiceExt.sign(
          body.period as string,
          (body.attestations as Array<{ field: string; value: string }>) ?? [],
          auth
        ),
        'Signed'
      );
    }
    if (body.action === 'delete') {
      if (!body.id) return badRequest('id required');
      return ok(
        await bahrainizationCertificateServiceExt.deleteCertificate(
          body.id as string,
          ctx.user.tenantId
        ),
        'Deleted'
      );
    }
    if (body.action === 'bulk-delete') {
      const ids = body.ids as string[];
      await Promise.all(
        ids.map((id) =>
          bahrainizationCertificateServiceExt.deleteCertificate(id, ctx.user.tenantId)
        )
      );
      return ok({ count: ids.length }, `${ids.length} records deleted`);
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update certificate', err);
  }
});
