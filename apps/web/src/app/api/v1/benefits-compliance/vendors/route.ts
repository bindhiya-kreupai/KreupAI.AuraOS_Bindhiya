import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { benefitVendorService } from '@/lib/services/benefits-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    return ok(await benefitVendorService.list(ctx.user.tenantId));
  } catch (err) {
    return serverError('Failed to list vendors', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (!body.name || !body.vendorType) return badRequest('name and vendorType required');
      return ok(
        await benefitVendorService.upsert(
          {
            ...body,
            contractStart: body.contractStart ? new Date(body.contractStart) : undefined,
            contractEnd: body.contractEnd ? new Date(body.contractEnd) : undefined,
          },
          auth
        ),
        'Saved'
      );
    }
    if (body.action === 'sign-dpa') {
      if (!body.id) return badRequest('id required');
      return ok(await benefitVendorService.signDpa(body.id, auth), 'DPA signed');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update vendor', err);
  }
});
