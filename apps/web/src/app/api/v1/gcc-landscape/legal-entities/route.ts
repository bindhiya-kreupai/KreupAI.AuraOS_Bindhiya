import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { gccTenancyService } from '@/lib/services/gcc-landscape';
import {
  badRequest,
  forbidden,
  hasAny,
  ok,
  created,
  serverError,
  type RouteContext,
} from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const countryCode = url.searchParams.get('countryCode') ?? undefined;
    const data = await gccTenancyService.listLegalEntities(ctx.user.tenantId, { countryCode });
    return ok(data);
  } catch (err) {
    return serverError('Failed to list legal entities', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    for (const field of ['countryCode', 'legalName', 'registrationRef']) {
      if (!body[field]) return badRequest(`${field} is required`);
    }
    const data = await gccTenancyService.createLegalEntity(body, {
      tenantId: ctx.user.tenantId,
      userId: ctx.user.id,
    });
    return created(data, 'Legal entity created');
  } catch (err) {
    return serverError('Failed to create legal entity', err);
  }
});

export const DELETE = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return badRequest('id is required');
    const data = await gccTenancyService.deactivateLegalEntity(id, {
      tenantId: ctx.user.tenantId,
      userId: ctx.user.id,
    });
    return ok(data, 'Legal entity deactivated');
  } catch (err) {
    return serverError('Failed to deactivate legal entity', err);
  }
});
