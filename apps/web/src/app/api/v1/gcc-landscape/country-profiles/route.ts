import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { gccCountryProfileService } from '@/lib/services/gcc-landscape';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const countryCode = url.searchParams.get('countryCode');
    if (action === 'versions') {
      if (!countryCode) return badRequest('countryCode is required for versions');
      return ok(await gccCountryProfileService.listVersions(countryCode));
    }
    if (countryCode) {
      return ok(await gccCountryProfileService.getActive(countryCode));
    }
    return ok(await gccCountryProfileService.list());
  } catch (err) {
    return serverError('Failed to load country profiles', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    if (body.action === 'seed-defaults') {
      const data = await gccCountryProfileService.seedDefaults({
        tenantId: ctx.user.tenantId,
        userId: ctx.user.id,
      });
      return ok(data, 'Country profiles seeded');
    }
    if (!body.countryCode) return badRequest('countryCode is required');
    const data = await gccCountryProfileService.createVersion(body.countryCode, body.patch ?? {}, {
      tenantId: ctx.user.tenantId,
      userId: ctx.user.id,
    });
    return ok(data, 'New country profile version created');
  } catch (err) {
    return serverError('Failed to update country profile', err);
  }
});
