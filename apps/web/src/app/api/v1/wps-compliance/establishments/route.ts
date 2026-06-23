import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { wpsSchemeService } from '@/lib/services/wps-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await wpsSchemeService.listEstablishments(ctx.user.tenantId, {
        countryCode: url.searchParams.get('countryCode') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list establishments', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    for (const f of ['countryCode', 'employerId', 'establishmentName']) {
      if (!body[f]) return badRequest(`${f} required`);
    }
    return ok(
      await wpsSchemeService.createEstablishment(body, {
        tenantId: ctx.user.tenantId,
        userId: ctx.user.id,
      }),
      'Establishment registered'
    );
  } catch (err) {
    return serverError('Failed to register establishment', err);
  }
});
