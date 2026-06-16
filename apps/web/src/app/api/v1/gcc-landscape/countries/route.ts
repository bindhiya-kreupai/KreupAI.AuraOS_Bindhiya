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

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const data = await gccTenancyService.listCountries(ctx.user.tenantId);
    return ok(data);
  } catch (err) {
    return serverError('Failed to list GCC countries', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    if (!body.countryCode) return badRequest('countryCode is required');
    const data = await gccTenancyService.enableCountry(
      {
        countryCode: body.countryCode,
        defaultCurrency: body.defaultCurrency,
        defaultTimezone: body.defaultTimezone,
      },
      { tenantId: ctx.user.tenantId, userId: ctx.user.id }
    );
    return created(data, 'Country enabled');
  } catch (err) {
    return serverError('Failed to enable GCC country', err);
  }
});

export const DELETE = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const url = new URL(req.url);
    const countryCode = url.searchParams.get('countryCode');
    if (!countryCode) return badRequest('countryCode is required');
    const data = await gccTenancyService.disableCountry(countryCode, {
      tenantId: ctx.user.tenantId,
      userId: ctx.user.id,
    });
    return ok(data, 'Country disabled');
  } catch (err) {
    return serverError('Failed to disable GCC country', err);
  }
});
